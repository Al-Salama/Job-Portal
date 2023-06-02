import dotenv from "dotenv";
dotenv.config();

import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import fs from "fs"
import crypto from "crypto";
import node_fetch from 'node-fetch';

import {SqlConnection, getConnection} from "./utils/sql.js"
import rateLimiter from "./utils/rateLimiter.js";

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sessionTimeout = 60_000 * 30;
const submissionsPageLimit = 50;

import imgURL from 'image-url-validator'
const isImageURL = imgURL.default;
// const DOMAIN = "http://localhost:3101";
const DOMAIN = "https://career-admin.shubraaltaif.com/api";
const db = {
    accepted_submissions: process.env.accepted_submissions_db,
    interview_locations: process.env.interview_locations_db,
    job_applications: process.env.job_applications_db,
    job_submissions: process.env.job_submissions_db,
    jobs: process.env.jobs_db,
    admins: process.env.admins_db
}

const corsOptions = {
    origin: process.env.CORS_ORIGIN_ADMIN,
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH']
}

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.set('trust proxy', "127.0.0.1")

app.listen(process.env.PORT_ADMIN, process.env.HOST_ADMIN, function () {
    console.log("admin http listening to " + process.env.PORT_ADMIN);
    console.log("Host:", process.env.HOST_ADMIN)
})

const SESSIONS = new Map();
const USERS = new Map();

app.post('/api/login', rateLimiter.adminLoginLimiter, async function (req, res) {
    const oldSessionId = req.cookies.sessionId;
    if (oldSessionId) {
        SESSIONS.delete(oldSessionId);
    }

    if (!req.body.username || !req.body.password) {
        res.status(400).json({
            success: false,
            code: 400,
            message: "Please provide username and password."
        });
        return;
    }

    const SQL = await getConnection(req, res);
    if (!SQL) return;

    const [querySuccess, queryResult] = await SQL.query("SELECT * FROM `admins` WHERE `username` = ? LIMIT 1;", req.body.username);
    SQL.disconnect();

    if (!querySuccess) {
        console.error("Error in database query", queryResult);
        res.status(500).json({
            success: false,
            code: 500,
            message: "Internal Server Error."
        });
        return;
    }
    const user = queryResult[0];

    if (!user || user.password !== req.body.password) {
        res.status(404).json({
            success: false,
            code: 404,
            message: "incorrect username or password."
        })
        return;
    };
    delete user.password

    const sessionId = crypto.randomUUID();
    const csrfToken = crypto.randomUUID();
    SESSIONS.set(sessionId, {
        ...user,
        csrfToken: csrfToken,
        lastInteraction: Date.now()
    });

    res.cookie("sessionId", sessionId, {
        secure: true,
        httpOnly: true,
        sameSite: "none",
        maxAge: 60_000 * 60 * 24 // 12 Hours
    })
        .status(200)
        .json({
            success: true,
            code: 200,
        })
        ;
})

function isUserLoggedIn(req) {
    const sessionId = req.cookies.sessionId;
    const loginData = {loggedIn: false};
    if (!sessionId) return false;

    const session = SESSIONS.get(sessionId);
    if (!session) return false;

    const nowDate = Date.now();
    if ((nowDate - session.lastInteraction) > sessionTimeout) {
        SESSIONS.delete(sessionId);
        return false;
    }
    session.lastInteraction = nowDate;
    SESSIONS.set(sessionId, session);

    loginData.loggedIn = true;
    loginData.sessionId = sessionId;
    loginData.session = session;

    return loginData
}

async function authenticateClient(req, res, next) {
    const userData = isUserLoggedIn(req);
    if (!userData.loggedIn) {
        res.status(401).json({
            success: false,
            code: 401,
            message: "Please login"
        })
        return;
    }

    if (req.method.toUpperCase() !== "GET") {
        const csrfToken = req.body.csrfToken;
        if (!csrfToken || csrfToken !== userData.session.csrfToken) {
            res.status(401).json({
                success: false,
                code: 401,
                message: "Access denied"
            })
            return;
        }
    }
    req.session = userData.session;
    next();
}

app.post("/api/auth", (req, res) => {
    const userData = isUserLoggedIn(req);
    if (!userData.loggedIn) {
        res.status(401).json({
            success: false,
            code: 401,
            message: "Please login"
        })
        return;
    }

    const csrfToken = req.body.csrfToken;
    if (!csrfToken || csrfToken !== userData.session.csrfToken) {
        const newCsrfToken = crypto.randomUUID();
        userData.session.csrfToken = newCsrfToken;
        SESSIONS.set(req.cookies.sessionId, userData.session);
    }

    res.status(200)
    .json({
        success: true,
        code: 200,
        username: userData.session.username,
        csrfToken: userData.session.csrfToken
    })
})

app.get("/api/application_files/:applicationKey/:fileName", authenticateClient, async function (req, res) {
    const rootPath = `${__dirname}/application_files/${req.params.applicationKey}/${req.params.fileName}`;
    if (!fs.existsSync(rootPath)) {
        res.sendStatus(404);
        return;
    }

    res.sendFile(rootPath);
})

app.get("/api/application_files/:fileName", authenticateClient, async function (req, res) {
    const rootPath = `${__dirname}/application_files/${req.params.fileName}`;
    if (!fs.existsSync(rootPath)) {
        res.sendStatus(404);
        return;
    }

    res.sendFile(rootPath);
})

const applications = {
    lastUpdate: 0,
    jobApplications: []
}

setInterval(() => {
    if ((Date.now() - applications.lastUpdate) > (60_000 * 15)) {
        applications.lastUpdate = 0;
        applications.jobApplications = [];
    }
}, 60_000 * 5);

async function getJobApplications(res, SQL, force) {
    if (force || (Date.now() - applications.lastUpdate) > (1000 * 60)) {
        const queryStr = "SELECT ja.`id` as appId, ja.`start_date`, ja.`closed`, j.`title` FROM `"+ db.job_applications +"` ja LEFT JOIN `"+ db.jobs +"` j ON(j.`id` = ja.`job_id`) ORDER BY ja.`start_date` DESC;"
        const [querySuccess, queryResult] = await SQL.query(queryStr);
        if (!querySuccess) {
            console.error("Error in database query\n", queryResult);
            res.status(500).json({
                success: false,
                code: 500,
                message: "Internal Server Error."
            });
            return false;
        }

        applications.jobApplications = queryResult.map((value, index) => {
            return {
                id: value.appId,
                jobName: value.title,
                startDate: value.start_date,
                closed: value.closed === 1 ? true : false,
                submissions: null,
                sendSubmisions: null,
                totalSubmissions: 0,
                lastUpdate: 0
            }
        })
        applications.lastUpdate = Date.now();
    }
}

async function getJobSubmissions(res, SQL, applicationId) {
    await getJobApplications(res, SQL);
    const sendSubmisions = {
        new: {
            rows: [],
            count: 0
        },
        accepted: {
            rows: [],
            count: 0
        },
        pending: {
            rows: [],
            count: 0
        },
        rejected: {
            rows: [],
            count: 0
        }
    }


    let jobApplication;
    if (!applicationId) {
        jobApplication = applications.jobApplications[0];
    } else {
        jobApplication = applications.jobApplications.find(value => value.id === applicationId);
    }

    if (!jobApplication) {
        return sendSubmisions;
    }

    if ((Date.now() - jobApplication.lastUpdate) > 60_000) {
        const [querySuccess, queryResult] = await SQL.query("SELECT * FROM `"+ db.job_submissions +"` WHERE `application_id` = ? ORDER BY `id` ASC;", jobApplication.id);
        if (!querySuccess) {
            console.error("Error in database query", queryResult);
            res.status(500).json({
                success: false,
                code: 500,
                message: "Internal Server Error."
            });
            return false;
        }

        const categories = Object.keys(sendSubmisions);
        for (const submission of queryResult) {
            const category = categories[submission.status];
            if (!category) continue;

            sendSubmisions[category].rows.push({
                id: submission.id,
                status: submission.status,
                name: submission.name,
                id_number: submission.id_number,
                phone: submission.phone
            })
        }
        sendSubmisions.new.count = sendSubmisions.new.rows.length;
        sendSubmisions.accepted.count = sendSubmisions.accepted.rows.length;
        sendSubmisions.pending.count = sendSubmisions.pending.rows.length;
        sendSubmisions.rejected.count = sendSubmisions.rejected.rows.length;
        if (queryResult.courses) {
            try {
                queryResult.courses = JSON.parse(queryResult.courses);
            } catch (error) {
                delete queryResult.courses
            }
        }
        if (queryResult.experiences) {
            try {
                queryResult.experiences = JSON.parse(queryResult.experiences);
            } catch (error) {
                delete queryResult.experiences
            }
        }

        jobApplication.submissions = queryResult;
        jobApplication.sendSubmisions = sendSubmisions;
        jobApplication.totalSubmissions = queryResult.length;
        jobApplication.lastUpdate = Date.now();
    }
    return jobApplication.sendSubmisions;
}

function isDigit(digit) {
    return /^\d+$/.test(digit)
}

function filterByName(value, index, array) {
    let found = false;
    if (this.startsWith("*") && this.endsWith("*")) {
        const actualSearchText = this.slice(1, -1);
        found = value.name.includes(actualSearchText);
    } else if (this.startsWith("*")) {
        const actualSearchText = this.slice(1, this.length);
        found = value.name.endsWith(actualSearchText)
    } else {
        found = value.name.startsWith(this);
    }

    return found;
}

function searchBySubmissionId(value, index, array) {
    return value.id.toString() === this;
}

function searchByIdNumber(value, index, array) {
    return value.id_number.startsWith(this);
}

function searchByPhoneNumber(value, index, array) {
    return value.phone.startsWith(this);
}

function chooseFilterFunction(searchText) {
    let filterFunc;
    if (!isDigit(searchText)) { // if search text is not only numbers, search by name
        filterFunc = filterByName;
    } else { // otherwise
        if (searchText.length === 10) { // if it's 10 digits
            if (searchText.startsWith("1") || searchText.startsWith("2")) { // if it starts with 1 or 2, then search by id_number
                filterFunc = searchByIdNumber;
            } else { // otherwise, search by phone number
                filterFunc = searchByPhoneNumber;
            }
        } else { // otherwise, search by submission id
            filterFunc = searchBySubmissionId;
        }
    }

    return filterFunc;
}

app.get("/api/submissions/:appId/search/:searchText", rateLimiter.adminGlobalLimiter, authenticateClient, async function (req, res){
    const appId = isDigit(req.params.appId) && parseInt(req.params.appId);
    const searchText = ((req.params.searchText.length > 0) && decodeURI(req.params.searchText)) || false;
    if (!appId || !searchText) {
        res.status(400).json({
            success: false,
            code: 400,
            message: "Bad request"
        })
        return;
    }

    const SQL = await getConnection(req, res);
    if (!SQL) return;

    const submissions = await getJobSubmissions(res, SQL, appId);
    SQL.disconnect();
    if (submissions === false) return;

    const filterFunc = chooseFilterFunction(searchText);

    let totalPages;
    let setCategorySelected = false;
    let endSubmission;
    let foundCategoryResult;
    let searchedCategories = {};
    let filteredSearch;
    for (const [category, value] of Object.entries(submissions)) {
        filteredSearch = value.rows.filter(filterFunc, searchText);

        totalPages = Math.ceil(filteredSearch.length / submissionsPageLimit);
        if (!foundCategoryResult) {
            setCategorySelected = filteredSearch.length > 0;
            if (setCategorySelected) {
                foundCategoryResult = true;
            }
        } else if (setCategorySelected) {
            setCategorySelected = false;
        }

        endSubmission = Math.min(submissionsPageLimit, filteredSearch.length);

        searchedCategories[category] = {
            rows: filteredSearch.slice(0, endSubmission),
            count: filteredSearch.length,
            currentPage: 1,
            totalPages: totalPages,
            selected: setCategorySelected
        }
    }
    if (!foundCategoryResult) searchedCategories.new.selected = true;

    res.status(200).json({
        success: true,
        code: 200,
        submissions: searchedCategories
    })
})


app.get("/api/submissions", rateLimiter.adminGlobalLimiter, authenticateClient, async function (req, res) {
    const appId = (req.query.appId ? true : false) && isDigit(req.query.appId) && parseInt(req.query.appId);
    const categoryId = (req.query.category ? true : false) && isDigit(req.query.category) && parseInt(req.query.category);
    const page = (req.query.page ? true : false) && isDigit(req.query.page) && parseInt(req.query.page);
    const searchText = ((req.query.s ? true : false) && decodeURI(req.query.s)) || false;
    if (
        appId ? appId < 1 : false || // if appId is provided and its value less than 1
        categoryId ? (categoryId < 0 || categoryId > 3) : false || // or if category is provided and its value less than 0 or greater than 3
        page ? page < 1 : false // or if page is provided and its value less than 1
    ) { // then
        res.status(400).json({
            success: false,
            code: 400,
            message: "Bad request"
        })
        return;
    }

    const SQL = await getConnection(req, res);
    if (!SQL) return;

    const submissions = await getJobSubmissions(res, SQL, appId);
    SQL.disconnect();
    if (submissions === false) return;

    let filterFunc;
    if (searchText) {
        filterFunc = chooseFilterFunction(searchText);
    }

    const pageSubmission = {};
    let index = 0;
    let totalPages;
    let currentPage;
    let isSelected;
    let aCategorySelected;
    let startSubmission;
    let endSubmission;
    let filteredSearch;
    for (const [category, value] of Object.entries(submissions)) {
        if (searchText) {
            filteredSearch = value.rows.filter(filterFunc, searchText);
            value.count = filteredSearch.length;
        } else filteredSearch = value.rows;

        totalPages = Math.ceil(value.count / submissionsPageLimit);
        currentPage = page ? ((page <= totalPages && page) || 1) : 1;
        isSelected = (categoryId === index);
        if (isSelected) aCategorySelected = true;
        startSubmission = (currentPage - 1) * submissionsPageLimit;
        endSubmission = Math.min(startSubmission + submissionsPageLimit, value.count);

        pageSubmission[category] = {
            rows: filteredSearch.slice(startSubmission, endSubmission),
            count: value.count,
            currentPage: currentPage,
            totalPages: totalPages,
            selected: isSelected
        }

        index++;
    }
    if (!aCategorySelected) pageSubmission.new.selected = true;

    let anApplicationSelected;
    const jobApplications = applications.jobApplications.map((value) => {
        isSelected = appId === value.id
        if (isSelected) anApplicationSelected = true;

        return {
            id: value.id,
            jobName: value.jobName,
            startDate: value.startDate.getTime(),
            closed: value.closed,
            totalSubmissions: value.totalSubmissions,
            selected: isSelected
        }
    });
    if (!anApplicationSelected) jobApplications[0].selected = true;

    res.status(200).json({
        success: true,
        code: 200,
        submissions: pageSubmission,
        applications: jobApplications
    })
})

app.get("/api/submissions/:appId/:categoryId/pages/:page", rateLimiter.adminGlobalLimiter, authenticateClient, async function (req, res) {
    const applicationId = isDigit(req.params.appId) && parseInt(req.params.appId);
    const categoryId = isDigit(req.params.categoryId) && parseInt(req.params.categoryId);
    const page = isDigit(req.params.page) && parseInt(req.params.page);
    const searchText = ((req.query.s ? true : false) && decodeURI(req.query.s)) || false;

    if (
        typeof categoryId !== "number" ||
        typeof applicationId !== "number" ||
        typeof page !== "number" ||
        page < 1 ||
        applicationId < 1 ||
        categoryId < 0
    ) {
        res.status(400).json({
            success: false,
            code: 400,
            message: "Bad request"
        });
        return;
    } else if (categoryId > 3) {
        res.status(404).json({
            success: false,
            code: 404,
            message: "Not found"
        });
        return;
    }

    const SQL = await getConnection(req, res);
    if (!SQL) return;

    const submissions = await getJobSubmissions(res, SQL, applicationId);
    SQL.disconnect();
    const jobApplication = applications.jobApplications.find(value => value.id === applicationId);
    if (!jobApplication) {
        res.status(404).json({
            success: false,
            code: 404,
            message: "Not found"
        });
        return;
    }

    /*
        Convert the submission object into array [[categoryName, categorySubmissions]]
        to select the submission of the given category id in a clean way.
    */
    let categorySubmissions = Object.entries(submissions)[categoryId][1]
    if (searchText) {
        const filterFunc = chooseFilterFunction(searchText);
        categorySubmissions.rows = categorySubmissions.rows.filter(filterFunc, searchText);
        categorySubmissions.count = categorySubmissions.rows.length;
    }

    const totalPages = Math.ceil(categorySubmissions.count / submissionsPageLimit);
    if (page > totalPages) {
        res.status(404).json({
            success: false,
            code: 404,
            message: "Not found"
        });
        return;
    }

    const startSubmission = (page - 1) * submissionsPageLimit;
    const endSubmission = Math.min(startSubmission + submissionsPageLimit, categorySubmissions.count);
    const pageSubmissions = {
        rows: categorySubmissions.rows.slice(startSubmission, endSubmission),
        count: categorySubmissions.count,
        currentPage: page,
        totalPages: totalPages
    }

    res.status(200).json({
        success: true,
        code: 200,
        submissions: pageSubmissions
    })
});

app.get("/api/submissions/:id", rateLimiter.adminGlobalLimiter, /* authenticateClient, */ async function(req, res){
    const submissionId = isDigit(req.params.id) && parseInt(req.params.id);
    if (
        submissionId === false ||
        submissionId < 1 ||
        !Number.isInteger(submissionId)
    ) {
        res.status(400).json({
            success: false,
            code: 400,
            message: "Bad request"
        })
        return;
    }

    let submission;
    for (const app of applications.jobApplications) {
        if (!Array.isArray(app.submissions)) continue;

        const search = app.submissions.find(v => v.id === submissionId);
        if (search) {
            submission = {
                ...search,
                jobName: app.jobName
            };
            break;
        }
    }

    if (!submission) {
        const SQL = await getConnection(req, res);
        if (!SQL) return;
        const qStr = "SELECT js.*, ja.`job_title` FROM `"+ db.job_submissions +"` js "
        + "LEFT JOIN `"+ db.job_applications +"` ja ON(ja.`id` = js.`application_id`) "
        + "WHERE js.`id` = ? LIMIT 1;"; // Select submission details + the job name of that submission.

        const [querySuccess, queryResult] = await SQL.query(qStr, [submissionId])
        SQL.disconnect();
        if (!querySuccess) {
            console.error("Error in database query", queryResult);
            res.status(500).json({
                success: false,
                code: 500,
                message: "Internal Server Error."
            });
            return;
        } else if (queryResult.length === 0) {
            res.status(404).json({
                success: false,
                code: 404,
                message: "Not found."
            });
            return;
        }

        if (queryResult.courses) {
            try {
                queryResult.courses = JSON.parse(queryResult.courses);
            } catch (error) {
                delete queryResult.courses
            }
        }
        if (queryResult.experiences) {
            try {
                queryResult.experiences = JSON.parse(queryResult.experiences);
            } catch (error) {
                delete queryResult.experiences
            }
        }

        submission = {
            ...queryResult[0],
            jobName: queryResult[0].title
        };
        delete submission.title
    }

    const fileUrls = {};
    const folderPath = `${DOMAIN}/application_files/${submission.application_key}`
    for (const [fileName, fileExtension] of Object.entries(submission.files)) {
        fileUrls[fileName] = `${folderPath}/${fileName}.${fileExtension}`;
    }
    submission.files = fileUrls;

    delete submission.ip; // delete unnecessary data
    res.status(200)
    .json({
        success: true,
        code: 200,
        submission
    })
})

app.patch("/api/submissions", rateLimiter.adminGlobalLimiter, authenticateClient, async function (req, res){
    const submissionId = isDigit(req.body.id) && parseInt(req.body.id);
    const submissionNewStatus = isDigit(req.body.status) && parseInt(req.body.status);

    if (
        submissionId === false || submissionNewStatus === false ||
        submissionId < 1 || (submissionNewStatus < 0 || submissionNewStatus > 3) ||
        !Number.isInteger(submissionId) || !Number.isInteger(submissionNewStatus)
    ) {
        res.status(400).json({
            success: false,
            code: 400,
            message: "Bad request"
        })
        return;
    }

    const SQL = await getConnection(req, res);
    if (!SQL) return;

    const [getStatusSuccess, getStatusQuery] = await SQL.query("SELECT `status` FROM `"+ db.job_submissions +"` WHERE `id` = ? LIMIT 1;", [submissionId]);
    if (!getStatusSuccess) {
        res.status(500).json({
            success: false,
            code: 500,
            message: "Internal Server Error"
        })
        return;
    }else if (getStatusQuery.length === 0) {
        res.status(404).json({
            success: false,
            code: 404,
            message: "Not found"
        })
        return;
    }

    if (getStatusQuery[0].status === submissionNewStatus) {
        res.status(403).json({
            success: false,
            code: 403,
            message: "Duplicated request."
        })
        return;
    } else if (getStatusQuery[0].status === 1) {
        res.status(403).json({
            success: false,
            code: 403,
            message: "You can't change the submission status after it has been accepted."
        })
        return;
    }

    if (submissionNewStatus === 1) {
        const interviewDate = isDigit(req.body.interviewDate) && parseInt(req.body.interviewDate);
        const interviewLocationId = isDigit(req.body.interviewLocation) && parseInt(req.body.interviewLocation);
        let interviewNotes = req.body.interviewNotes;

        const nowDate = Date.now();
        if (
            isNaN(interviewDate) ||
            (interviewDate - nowDate) <= 0 ||
            (isNaN(interviewLocationId) || !isFinite(interviewLocationId))
        ) {
            SQL.disconnect();
            res.status(400).json({
                success: false,
                code: 400,
                message: "Bad request"
            })
            return;
        }

        if (typeof interviewNotes !== "string" || interviewNotes.length === 0) {
            interviewNotes = null;
        }

        const [locationSuccess, locationQuery] = await SQL.query("SELECT * FROM `"+ db.interview_locations +"` WHERE `id` = ? LIMIT 1;", [interviewLocationId]);
        if (!locationSuccess){
            SQL.disconnect();
            res.status(500).json({
                success: false,
                code: 500,
                message: "Internal Server Error"
            })
            return;
        } else if (locationQuery.length === 0) {
            SQL.disconnect();
            res.status(404).json({
                success: false,
                code: 404,
                message: "Location Not fount"
            })
            return;
        }

        let foundSubmission;
        for (const app of applications.jobApplications) {
            if (!Array.isArray(app.submissions)) continue;

            const search = app.submissions.find(v => v.id === submissionId);
            if (search) {
                foundSubmission = {
                    ...search,
                    jobName: app.jobName
                };
                break;
            }
        }

        if (!foundSubmission) {
            const qStr = "SELECT js.`id`, js.`name`, js.`phone`, ja.`job_title` as jobName FROM `"+ db.job_submissions +"` js "
            + "LEFT JOIN `"+ db.job_applications +"` ja ON(ja.`id` = js.`application_id`) "
            + "WHERE js.`id` = ? LIMIT 1;"; // Select submission details + the job name of that submission.

            const [querySuccess, queryResult] = await SQL.query(qStr, [submissionId])
            if (!querySuccess) {
                console.error("Error in database query", queryResult);
                res.status(500).json({
                    success: false,
                    code: 500,
                    message: "Internal Server Error."
                });
                return;
            } else if (queryResult.length === 0) {
                res.status(404).json({
                    success: false,
                    code: 404,
                    message: "Not found."
                });
                return;
            }

            foundSubmission = {
                ...queryResult[0]
            };
        }

        const interviewRealDate = new Date(interviewDate);

        if (!process.env.DEVELOPMENT_ENVIRONMENT) {
            /*
                i used this method so it can handles phone numbers with all possible formats:
                • 05########
                • 5########
                • +9665########
            */
            if (!foundSubmission.phone.startsWith("+966")) {
                foundSubmission.phone = foundSubmission.phone.replace(/^0{1}/, "") // 05######## --> 5########
                foundSubmission.phone = "+966".concat(foundSubmission.phone); // 5######## --> +9665########
            }


            const formatTime = interviewRealDate.toLocaleTimeString("ar-US", {
                timeZone: "Asia/Riyadh",
                hour12: true,
                timeStyle: "short"
            }).replace("م", "مساءً").replace("ص", "صباحًا")

            const formatDate = interviewRealDate.toLocaleDateString("ar-US", {
                timeZone: "Asia/Riyadh",
                month: "long",
                weekday: "long",
                day: "2-digit",
                year: "numeric"
            })

            const body = {
                "phone": foundSubmission.phone,
                "channelId": parseInt(process.env.WHATSAPP_CHANNEL_ID),
                "templateName": process.env.WHATSAPP_INTERVIEW_TEMPLATE,
                "languageCode": process.env.WHATSAPP_INTERVIEW_LANGUAGE_CODE,
                "parameters": [
                    foundSubmission.name,
                    `${foundSubmission.id}`,
                    foundSubmission.jobName,
                    `يوم ${formatDate}`,
                    formatTime,
                    locationQuery[0].name,
                    locationQuery[0].url,
                    interviewNotes || "لا يوجد"
                ]
            }
            let result;
            try {
                result = await node_fetch("https://imapi.bevatel.com/whatsapp/api/message", {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": process.env.WHATSAPP_ACCESS_TOKEN
                    }
                });
                /* setTimeout(() => {
                    body.phone = "+966506490800";
                    node_fetch("https://imapi.bevatel.com/whatsapp/api/message", {
                        method: "POST",
                        body: JSON.stringify(body),
                        headers: {
                            'Content-Type': 'application/json',
                            "Authorization": process.env.WHATSAPP_ACCESS_TOKEN
                        }
                    })
                }, 5000); */
            } catch (error) {
                // return;
                console.error(error);
                const message = (error.message && `${error.message}`) || "Couldn't send message to whatsapp."
                res.status(504).json({
                    success: false,
                    code: 504,
                    message: message
                })
                return;
            }

            if (!result.ok) {
                try {
                    const response = await result.json();
                    console.error(response);
                } catch (error) {}

                res.status(502).json({
                    success: false,
                    code: 502,
                    message: "Couldn't send message to whatsapp, maybe wrong number."
                })
                return;
            }
        }

        const logAcceptanceQueryString =
        "INSERT INTO `"+ db.accepted_submissions +"` (`submission_id`, `interview_date`, `interview_location_name`, `interview_location_url`, `interview_notes`, `accepted_by`) VALUES(?,?,?,?,?,?);";
        const [logAcceptanceSuccess, logAcceptanceQuery] = await SQL.query(logAcceptanceQueryString, [submissionId, interviewRealDate, locationQuery[0].name, locationQuery[0].url, interviewNotes, req.session.id]);
        if (!logAcceptanceSuccess || !logAcceptanceQuery.insertId) {
            SQL.disconnect();
            console.error(logAcceptanceQuery)
            res.status(500).json({
                success: false,
                code: 500,
                message: "Internal Server Error"
            })
            return;
        }
    }
    const [updateStatusSuccess, updateStatusQuery] = await SQL.query("UPDATE `"+ db.job_submissions +"` SET `status` = ? WHERE `id` = ?", [submissionNewStatus, submissionId]);
    SQL.disconnect();
    if (!updateStatusSuccess) {
        console.error(updateStatusQuery)
        res.status(500).json({
            success: false,
            code: 500,
            message: "Internal Server Error"
        })
        return;
    } else if (updateStatusQuery.affectedRows === 0) {
        res.status(404).json({
            success: false,
            code: 404,
            message: "Not found"
        })
        return;
    }

    res.status(200).json({
        success: true,
        code: 200,
        submissionId: submissionId,
        newStatus: submissionNewStatus
    })

    for (const app of applications.jobApplications) {
        if (!Array.isArray(app.submissions)) continue;

        const search = app.submissions.find(v => v.id === submissionId);
        if (search) {
            app.lastUpdate = 0;
            break;
        }
    }
})

app.get("/api/settings", rateLimiter.adminGlobalLimiter, authenticateClient, async function(req, res) {
    const SQL = await getConnection(req, res);
    if (!SQL) return;

    const [settingsSuccess, settingsQuery] = await SQL.query("SELECT * FROM `"+ db.interview_locations +"` ORDER BY `id` ASC;");
    SQL.disconnect();
    if (!settingsSuccess) {
        res.status(500).json({
            success: false,
            code: 500,
            message: "Internal Server Error"
        })
        return;
    }

    const settings = {
        "locations": []
    };
    for (const theSetting of settingsQuery) {
        settings.locations.push(theSetting);
    };

    res.status(200).json({
        success: true,
        code: 200,
        settings
    })
})

app.get("/api/locations", rateLimiter.adminGlobalLimiter, authenticateClient, async function(req, res) {
    const SQL = await getConnection(req, res);
    if (!SQL) return;

    const [locationsSuccess, locationsQuery] = await SQL.query("SELECT * FROM `"+ db.interview_locations +"` ORDER BY `id` ASC;");
    SQL.disconnect();
    if (!locationsSuccess) {
        res.status(500).json({
            success: false,
            code: 500,
            message: "Internal Server Error"
        })
        return;
    }

    res.status(200).json({
        success: true,
        code: 200,
        locations: locationsQuery
    })
})

app.post("/api/settings/locations", rateLimiter.adminGlobalLimiter, authenticateClient, async function(req, res) {
    const name = req.body.name;
    const url = req.body.url;

    if (
        (typeof name !== "string" || typeof url !== "string") ||
        (name.trim().length === 0 || url.trim().length === 0)
    ) {
        res.status(400).json({
            success: false,
            code: 400,
            message: "Bad request"
        })
        return;
    }

    const SQL = await getConnection(req, res);
    if (!SQL) return;

    const [insertSuccess, insertQuery] = await SQL.query("INSERT INTO `"+ db.interview_locations +"` (`name`, `url`) VALUES (?, ?)", [name, url]);
    if (!insertSuccess) {
        SQL.disconnect();
        res.status(500).json({
            success: false,
            code: 500,
            message: "Internal Server Error"
        })
        return;
    } else if (!insertQuery.insertId) {
        SQL.disconnect();
        res.status(500).json({
            success: false,
            code: 500,
            message: "Internal Server Error"
        })
        return;
    }

    const [selectSuccess, selectQuery] = await SQL.query("SELECT * FROM `"+ db.interview_locations +"` ORDER BY `id` ASC;");
    SQL.disconnect();
    if (!selectSuccess) {
        res.status(500).json({
            success: false,
            code: 500,
            message: "Internal Server Error"
        })
        return;
    }

    res.status(200).json({
        success: true,
        code: 200,
        locations: selectQuery
    })
})

app.delete("/api/settings/locations/:id", rateLimiter.adminGlobalLimiter, authenticateClient, async function(req, res) {
    const locationId = isDigit(req.params.id) && parseInt(req.params.id);

    if (locationId == false || locationId < 1 || !Number.isInteger(locationId)) {
        res.status(400).json({
            success: false,
            code: 400,
            message: "Bad request"
        })
        return;
    }

    const SQL = await getConnection(req, res);
    if (!SQL) return;

    const [deleteSuccess, deleteQuery] = await SQL.query("DELETE FROM `"+ db.interview_locations +"` WHERE `id` = ? LIMIT 1;", [locationId]);
    if (!deleteSuccess) {
        SQL.disconnect();
        res.status(500).json({
            success: false,
            code: 500,
            message: "Internal Server Error"
        })
        return;
    } else if (deleteQuery.affectedRows === 0) {
        SQL.disconnect();
        res.status(404).json({
            success: false,
            code: 404,
            message: "Not found"
        })
        return;
    }

    const [locationsSuccess, locationsQuery] = await SQL.query("SELECT * FROM `"+ db.interview_locations +"` ORDER BY `id` ASC;");
    SQL.disconnect();
    if (!locationsSuccess) {
        res.status(500).json({
            success: false,
            code: 500,
            message: "Internal Server Error"
        })
        return;
    }

    res.status(200).json({
        success: true,
        code: 200,
        locations: locationsQuery
    })
})


async function getAllJobs(SQL, res) {
    const columns = "j.`id`, j.`hidden`, j.`title`, ja.`closed`, a.`username` as added_by, a2.`username` as edited_by";
    const queryStr = "SELECT "+ columns +" FROM `"+ db.jobs +"` j LEFT JOIN `"+ db.job_applications +"` ja ON (ja.`job_id` = j.`id` AND ja.`closed` = 0) LEFT JOIN `"+ db.admins +"` a ON (a.`id` = j.`added_by`) LEFT JOIN `"+ db.admins +"` a2 ON (a2.`id` = j.`edited_by`) ORDER BY j.`id` DESC;"
    const [jobsSuccess, jobsQuery] = await SQL.query(queryStr);

    if (!jobsSuccess) {
        console.error(jobsQuery)
        res.status(500).json({
            success: false,
            code: 500,
            message: "Internal Server Error"
        })
        return;
    }

    for (const job of jobsQuery) {
        job.hidden = toBoolean(job.hidden);
        if (job.closed === null) job.closed = true;
        else job.closed = false;


    }

    return jobsQuery
}

app.get("/api/jobs", rateLimiter.adminGlobalLimiter, authenticateClient, async function(req, res) {
    const SQL = await getConnection(req, res);
    if (!SQL) return;

    const jobs = await getAllJobs(SQL, res);
    SQL.disconnect();
    if (!jobs) return;

    res.status(200).json({
        success: true,
        code: 200,
        jobs
    })
})

app.get("/api/jobs/:id", rateLimiter.adminGlobalLimiter, authenticateClient, async function(req, res) {
    const jobId = isDigit(req.params.id) && parseInt(req.params.id);
    if (Number.isNaN(jobId) || !Number.isFinite(jobId) || !Number.isInteger(jobId)) {
        res.status(400).json({
            success: false,
            code: 400,
            message: "Bad request"
        })
        return;
    }

    const SQL = await getConnection(req, res);
    if (!SQL) return;

    const queryStr = "SELECT j.*, ja.`closed` FROM `"+ db.jobs +"` j LEFT JOIN `"+ db.job_applications +"` ja ON (ja.`job_id` = j.`id` AND ja.`closed` = 0) WHERE j.`id` = ? LIMIT 1;"
    const [jobsSuccess, jobsQuery] = await SQL.query(queryStr, [jobId]);
    SQL.disconnect();

    if (!jobsSuccess) {
        console.error(jobsQuery)
        res.status(500).json({
            success: false,
            code: 500,
            message: "Internal Server Error"
        })
        return;
    } else if (jobsQuery.length === 0) {
        res.status(404).json({
            success: false,
            code: 404,
            message: "Not found"
        })
        return;
    }

    const jobInfo = jobsQuery[0]

    jobInfo.hidden = toBoolean(jobInfo.hidden);
    if (jobInfo.closed === null) jobInfo.closed = true;
    else jobInfo.closed = false;

    delete jobInfo.added_by;
    delete jobInfo.edited_by;
    res.status(200).json({
        success: true,
        code: 200,
        jobInfo
    })
})

app.post("/api/jobs", rateLimiter.adminGlobalLimiter, authenticateClient, async function(req, res) {
    const jobTitle = (req.body?.jobTitle && req.body.jobTitle.trim().length > 0 && req.body.jobTitle);
    const jobDescription = (req.body?.jobDescription && req.body.jobDescription.trim().length > 0 && req.body.jobDescription);
    const jobIcon = (req.body?.jobIcon && req.body.jobIcon.trim().length > 0 && req.body.jobIcon);
    const jobResponsibilities = (req.body?.jobResponsibilities && req.body.jobResponsibilities.trim().length > 0 && req.body.jobResponsibilities);
    const jobQualifications = (req.body?.jobQualifications && req.body.jobQualifications.trim().length > 0 && req.body.jobQualifications);


    if (!jobTitle || !jobDescription || !jobIcon || !jobResponsibilities || !jobQualifications) {
        res.status(400).json({
            success: false,
            code: 400,
            message: "Please verify your inputs"
        })
        return;
    }

    const isValidIconUrl = await isImageURL(jobIcon);
    if (!isValidIconUrl) {
        res.status(400).json({
            success: false,
            code: 400,
            message: "Please check the icon url"
        })
        return;
    }

    const SQL = await getConnection(req, res);
    if (!SQL) return;

    const [searchJobSuccess, searchJobQuery] = await SQL.query("SELECT `id` FROM `"+ db.jobs +"` WHERE `title` = ?", [jobTitle]);
    if (!searchJobSuccess) {
        SQL.disconnect();
        res.status(500).json({
            success: false,
            code: 500,
            message: "Internal Server Error"
        })
        return;
    } else if (searchJobQuery.length > 0) {
        SQL.disconnect();
        res.status(403).json({
            success: false,
            code: 403,
            message: "Job title already exist!"
        })
        return;
    }

    const query = "INSERT INTO `"+ db.jobs +"` (`title`, `description`, `icon`, `responsibilities`, `qualifications`, `added_by`) VALUES (?,?,?,?,?,?)"
    const args = [jobTitle, jobDescription, jobIcon, jobResponsibilities, jobQualifications, req.session.id];

    const [insertSuccess, insertQuery] = await SQL.query(query, args);
    if (!insertSuccess) {
        SQL.disconnect();
        res.status(500).json({
            success: false,
            code: 500,
            message: "Internal Server Error"
        })
        return;
    } else if (insertQuery.affectedRows === 0) {
        console.error(insertQuery)
        SQL.disconnect();
        res.status(500).json({
            success: false,
            code: 500,
            message: insertQuery.message
        })
        return;
    }

    const jobs = await getAllJobs(SQL, res);
    SQL.disconnect();
    if (!jobs) return;

    res.status(200).json({
        success: true,
        code: 200,
        jobs
    })
})


async function toggleJobApply(req = app.request, res = app.response) {
    const jobId = parseInt(req.params.id);
    const toggleApply = isDigit(req.body.toggleApply) && parseInt(req.body.toggleApply);
    if (toggleApply !== 0 && toggleApply !== 1) {
        res.status(400).json({
            success: false,
            code: 400,
            message: "Bad request"
        })
        return;
    }

    const SQL = await getConnection(req, res);
    if (!SQL) return;

    const [applicationSuccess, applicationQuery] = await SQL.query("SELECT j.`title`, ja.`id` FROM `"+ db.jobs +"` j LEFT JOIN `"+ db.job_applications +"` ja ON (ja.`job_id` = j.`id` AND ja.`closed` = 0) WHERE j.`id` = ? LIMIT 1;", [jobId]);
    if (!applicationSuccess) {
        console.error(applicationQuery)
        SQL.disconnect();
        res.status(500).json({
            success: false,
            code: 500,
            message: "Internal Server Error"
        })
        return;
    }
    if (applicationQuery.length === 0) {
        SQL.disconnect();
        res.status(404).json({
            success: false,
            code: 404,
            message: "The job you're editing was not found"
        })
        return;
    }

    const isJobAlreadyOpened = applicationQuery[0].id !== null;

    if (toggleApply === 1) { // open job application
        if (isJobAlreadyOpened) {
            SQL.disconnect();
            res.status(403).json({
                success: false,
                code: 403,
                message: "This job is already opened."
            })
            return;
        }
        const [insertSuccess, insertQuery] = await SQL.query("INSERT INTO `"+ db.job_applications +"` (`job_id`, `job_title`) VALUES(?,?)", [jobId, applicationQuery[0].title]);
        if (!insertSuccess) {
            console.error(insertQuery)
            SQL.disconnect();
            res.status(500).json({
                success: false,
                code: 500,
                message: "Internal Server Error"
            })
            return;
        } else if (!insertQuery.insertId) {
            console.error(insertQuery)
            SQL.disconnect();
            res.status(500).json({
                success: false,
                code: 500,
                message: "Couldn't update the database #01."
            })
            return;
        }


    } else { // close job application
        if (!isJobAlreadyOpened) {
            SQL.disconnect();
            res.status(403).json({
                success: false,
                code: 403,
                message: "This job is already closed."
            })
            return;
        }
        const [updateSuccess, updateQuery] = await SQL.query("UPDATE `"+ db.job_applications +"` SET `closed` = 1, `close_date` = CURRENT_TIMESTAMP WHERE `id` = ?", [applicationQuery[0].id]);
        if (!updateSuccess) {
            console.error(updateQuery)
            SQL.disconnect();
            res.status(500).json({
                success: false,
                code: 500,
                message: "Internal Server Error"
            })
            return;
        } else if (updateQuery.affectedRows === 0) {
            console.error(updateQuery)
            SQL.disconnect();
            res.status(500).json({
                success: false,
                code: 500,
                message: "Couldn't update the database #02."
            })
            return;
        }
    }

    const [logSuccess, logQuery] = await SQL.query("UPDATE `"+ db.jobs +"` SET `edited_by` = ? WHERE `id` = ?", [req.session.id, jobId]);
    if (!logSuccess) {
        console.error("log failed");
        console.error(logQuery);
    }
    applications.lastUpdate = 0;

    const jobs = await getAllJobs(SQL, res);
    SQL.disconnect();
    if (!jobs) return;

    res.status(200).json({
        success: true,
        code: 200,
        jobs
    })
}

async function setJobVisible(req = app.request, res = app.response) {
    const jobId = parseInt(req.params.id);
    const setVisible = isDigit(req.body.setVisible) && parseInt(req.body.setVisible);
    console.log("setVisible", setVisible)
    if (setVisible !== 0 && setVisible !== 1) {
        res.status(400).json({
            success: false,
            code: 400,
            message: "Bad request"
        })
        return;
    }

    const SQL = await getConnection(req, res);
    if (!SQL) return;

    const [applicationSuccess, applicationQuery] = await SQL.query("SELECT j.`title`, ja.`id` FROM `"+ db.jobs +"` j LEFT JOIN `"+ db.job_applications +"` ja ON (ja.`job_id` = j.`id` AND ja.`closed` = 0) WHERE j.`id` = ? LIMIT 1;", [jobId]);
    if (!applicationSuccess) {
        console.error(applicationQuery)
        SQL.disconnect();
        res.status(500).json({
            success: false,
            code: 500,
            message: "Internal Server Error"
        })
        return;
    }
    if (applicationQuery.length === 0) {
        SQL.disconnect();
        res.status(404).json({
            success: false,
            code: 404,
            message: "The job you're editing was not found"
        })
        return;
    }

    const isJobApplicationOpened = applicationQuery[0].id !== null;
    if (isJobApplicationOpened) {
        SQL.disconnect();
        res.status(403).json({
            success: false,
            code: 403,
            message: "You can't hide this job because it has an application opened"
        })
        return;
    }

    const [updateSuccess, updateQuery] = await SQL.query("UPDATE `"+ db.jobs +"` SET `hidden` = ? WHERE `id` = ?", [setVisible, jobId])
    if (!updateSuccess) {
        SQL.disconnect();
        res.status(500).json({
            success: false,
            code: 500,
            message: "Couldn't update the database #03."
        })
        return;
    } else if (updateQuery.affectedRows === 0) {
        SQL.disconnect();
        res.status(500).json({
            success: false,
            code: 500,
            message: "Couldn't update the database #04."
        })
        return;
    }

    const jobs = await getAllJobs(SQL, res);
    SQL.disconnect();
    if (!jobs) return;

    res.status(200).json({
        success: true,
        code: 200,
        jobs
    })
}

app.patch("/api/jobs/:id", rateLimiter.adminGlobalLimiter, authenticateClient, async function(req, res) {
    const jobId = isDigit(req.params.id) && parseInt(req.params.id);
    if (Number.isNaN(jobId) || !Number.isFinite(jobId) || !Number.isInteger(jobId)) {
        res.status(400).json({
            success: false,
            code: 400,
            message: "Bad request"
        })
        return;
    }

    if ('toggleApply' in req.body) {
        toggleJobApply(req, res);
        return;
    } else if ('setVisible' in req.body) {
        setJobVisible(req, res);
        return;
    }

    const columns = [];
    const values = [];
    if (req.body.jobTitle) {
        columns.push("title");
        values.push(req.body.jobTitle)
    }
    if (req.body.jobDescription) {
        columns.push("description");
        values.push(req.body.jobDescription)
    }
    if (req.body.jobIcon) {
        const isValidIconUrl = await isImageURL(req.body.jobIcon);
        if (!isValidIconUrl) {
            res.status(400).json({
                success: false,
                code: 400,
                message: "Please check the icon url"
            })
            return;
        }
        columns.push("icon");
        values.push(req.body.jobIcon)
    }
    if (req.body.jobResponsibilities) {
        columns.push("responsibilities");
        values.push(req.body.jobResponsibilities)
    }
    if (req.body.jobQualifications) {
        columns.push("qualifications");
        values.push(req.body.jobQualifications)
    }

    let updateColumnsString = "";
    let count = 0;
    for (const column of columns) {
        count++;
        if (count >= columns.length) {
            updateColumnsString += `\`${column}\` = ?`
        } else {
            updateColumnsString += `\`${column}\` = ?, `
        }
    }

    const SQL = await getConnection(req, res);
    if (!SQL) return;

    values.push(jobId)
    const queryString = "UPDATE `"+ db.jobs +"` SET "+ updateColumnsString +" WHERE `id` = ?"
    const [updateSuccess, updateQuery] = await SQL.query(queryString, values);
    if (!updateSuccess) {
        SQL.disconnect();
        res.status(500).json({
            success: false,
            code: 500,
            message: "Couldn't update the database #03."
        })
        return;
    } else if (updateQuery.affectedRows === 0) {
        SQL.disconnect();
        res.status(500).json({
            success: false,
            code: 500,
            message: "Couldn't update the database #04."
        })
        return;
    }

    const jobs = await getAllJobs(SQL, res);
    SQL.disconnect();
    if (!jobs) return;

    res.status(200).json({
        success: true,
        code: 200,
        jobs
    })
})


app.delete("/api/jobs/:id", rateLimiter.adminGlobalLimiter, authenticateClient, async function(req, res){
    const jobId = isDigit(req.params.id) && parseInt(req.params.id);
    if (Number.isNaN(jobId) || !Number.isFinite(jobId) || !Number.isInteger(jobId)) {
        res.status(400).json({
            success: false,
            code: 400,
            message: "Bad request"
        })
        return;
    }

    const SQL = await getConnection(req, res);
    if (!SQL) return;

    const [selectSuccess, selectQuery] = await SQL.query("SELECT j.`hidden`, j.`title`, ja.`id` FROM `"+ db.jobs +"` j LEFT JOIN `"+ db.job_applications +"` ja ON (ja.`job_id` = j.`id` AND ja.`closed` = 0) WHERE j.`id` = ? LIMIT 1;", [jobId]);
    if (!selectSuccess) {
        console.error(selectQuery)
        SQL.disconnect();
        res.status(500).json({
            success: false,
            code: 500,
            message: "Internal Server Error"
        })
        return;
    }else if (selectQuery.length === 0) {
        SQL.disconnect();
        res.status(404).json({
            success: false,
            code: 404,
            message: "The job you're editing was not found"
        })
        return;
    }

    const isJobApplicationOpened = selectQuery[0].id !== null;
    const isJobVisible = selectQuery[0].hidden === 0;

    if (isJobApplicationOpened) {
        SQL.disconnect();
        res.status(403).json({
            success: false,
            code: 403,
            message: "You can't DELETE this job because it has an application opened"
        })
        return;
    } else if (isJobVisible) {
        SQL.disconnect();
        res.status(403).json({
            success: false,
            code: 403,
            message: "You can't DELETE this job because it's NOT hidden"
        })
        return;
    }

    const [deleteSuccess, deleteQuery] = await SQL.query("DELETE FROM `"+ db.jobs +"` WHERE `id` = ?", [jobId])
    if (!deleteSuccess) {
        console.error(deleteQuery)
        SQL.disconnect();
        res.status(500).json({
            success: false,
            code: 500,
            message: "Internal Server Error"
        })
        return;
    }
    console.log(`Job id ${jobId} title: ${selectQuery[0].title} has been deleted by: ${req.session.username}`)

    const jobs = await getAllJobs(SQL, res);
    SQL.disconnect();
    if (!jobs) return;

    res.status(200).json({
        success: true,
        code: 200,
        jobs
    });
})

function toBoolean(value) {
    return value == true;
}

setInterval(() => {
    const nowDate = Date.now();
    SESSIONS.forEach((session, sessionId) => {
        if ((nowDate - session.lastInteraction) > sessionTimeout) {
            console.log("Timeout the session of " + session.username);
            SESSIONS.delete(sessionId);
        }
    })
}, 60_000);