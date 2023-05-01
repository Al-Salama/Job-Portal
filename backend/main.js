// Alsalamah
import dotenv from "dotenv";
dotenv.config();
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import "./admin_main.js";

import fs from "fs"
import {SqlConnection, getConnection} from "./utils/sql.js"
import formVerifyer from "./utils/formDataVerifyer.js"
import {requestLimiter, submitLimiter} from "./utils/rateLimiter.js";

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    optionsSuccessStatus: 200
}

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.set('trust proxy', "127.0.0.1")

app.listen(process.env.PORT, process.env.HOST, function () {
    console.log("http listening to " + process.env.PORT);
})

app.post('/api/jobs/apply', requestLimiter, formVerifyer, async function (req, res) {
    const fields = req.form.fields;
    const files = req.form.files;

    console.log(fields.jobId)
    if (
        !fields.jobId ||
        !isDigit(fields.jobId)
    ) {
        res.send(400).json({
            success: false,
            code: 400,
            message: "Bad request"
        })
        return;
    }

    const applicationKey = getRandomKey();
    const newDirPath = `${__dirname}/application_files/${applicationKey}`
    if (fs.existsSync(newDirPath)) {
        console.error("The application key already exists!");
        res.status(500)
            .json({
                success: false,
                code: 500,
                message: "Internal Server Error"
            })
        return;
    };
    try {
        fs.mkdirSync(newDirPath, { mode: 0o754 })
    } catch (error) {
        console.error("failed create new dir\n", error);
        res.status(500)
            .json({
                success: false,
                code: 500,
                message: "Internal Server Error"
            })
        return;
    }

    const fileExtensions = {};
    for (const [key, file] of Object.entries(files)) {
        const [_, extension] = file.mimetype.split("/");
        fileExtensions[key] = `${extension}`;
        try {
            fs.copyFileSync(file.filepath, `${newDirPath}/${key}.${extension}`);
        } catch (error) {
            console.error("Failed copy file to new dir\n", error)
            res.status(500)
                .json({
                    success: false,
                    code: 500,
                    message: "Internal Server Error"
                })
            try {
                fs.rmSync(newDirPath, {
                    recursive: true,
                    force: true,
                    maxRetries: 20,
                    retryDelay: 250
                })
            } catch (error) {
                console.error("Failed removing files in dir\n", error)
            }
            return;
        }
    }

    const SQL = new SqlConnection();
    const [success, connection] = await SQL.connect();
    if (!success) {
        console.error("Failed connect to database\n", connection)
        res.status(500)
            .json({
                success: false,
                code: 500,
                message: "Internal Server Error"
            })
        fs.rmSync(newDirPath, {
            recursive: true,
            force: true,
            maxRetries: 20,
            retryDelay: 250
        })
        return;
    }

    const [searchSuccess, searchResult] = await SQL.query("SELECT `jobs`.`id` as jobId, `job_applications`.`id` as appId FROM `jobs` LEFT JOIN `job_applications` ON(`job_applications`.`job_id` = `jobs`.`id` AND `job_applications`.`closed` = 0) WHERE `jobs`.`id` = ? LIMIT 1;", [fields.jobId])
    if (!searchSuccess) {
        console.error("Failed query from database\n", result)
        SQL.disconnect();
        res.status(500)
            .json({
                success: false,
                code: 500,
                message: "Internal Server Error"
            })
        fs.rmSync(newDirPath, {
            recursive: true,
            force: true,
            maxRetries: 20,
            retryDelay: 250
        })
        return;
    } else if (searchResult.length === 0 || searchResult[0].appId === null){
        SQL.disconnect();
        res.status(404)
            .json({
                success: false,
                code: 404,
                message: "Not found"
            })
        fs.rmSync(newDirPath, {
            recursive: true,
            force: true,
            maxRetries: 20,
            retryDelay: 250
        })
        return;
    }

    const canUserSubmitApplication = await submitLimiter(req, res);
    if (!canUserSubmitApplication) {
        SQL.disconnect();
        return;
    };

    const [searchSuccess_2, searchResult_2] = await SQL.query(
        "SELECT `id` FROM `job_submissions` WHERE `name` = ? OR `id_number` = ?",
        [fields.name, fields.idNumber]
    )
    if (!searchSuccess_2) {
        console.error("Failed query from database\n", result)
        SQL.disconnect();
        res.status(500)
            .json({
                success: false,
                code: 500,
                message: "Internal Server Error"
            })
        fs.rmSync(newDirPath, {
            recursive: true,
            force: true,
            maxRetries: 20,
            retryDelay: 250
        })
        return;
    } else if (searchResult_2.length > 0){
        SQL.disconnect();
        res.status(208)
            .json({
                success: false,
                code: 208,
                message: "You've already submited",
                submissionId: searchResult_2[0].id
            })
        fs.rmSync(newDirPath, {
            recursive: true,
            force: true,
            maxRetries: 20,
            retryDelay: 250
        })
        return;
    }


    const [querySuccess, result] = await SQL.query(
        "INSERT INTO `job_submissions` (`application_id`, `application_key`, `status`, `ip`, `name`, `sex`, `id_number`, `birth_date`, `marital_status`, `nationality`, `phone`, `city`, `address`, `email`, `degree`, `graduate_date`, `gpa`, `field`, `courses`, `experiences`, `computer_rate`, `english_rate`, `flexibility_rate`, `self_talk`, `files`)"
        + "VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);",
        [searchResult[0].appId, applicationKey, 0, req.ip, fields.name, fields.sex, fields.idNumber, fields.birthDate, fields.maritalStatus, fields.nationality, fields.phone, fields.city, fields.address, fields.email, fields.degree, fields.graduateDate, fields.gpa, fields.field, fields.courses, fields.experiences, fields.computerRate, fields.englishRate, fields.flexibilityRate, fields.selfTalk, JSON.stringify(fileExtensions, null, 0)]
    )
    SQL.disconnect();

    if (!querySuccess) {
        console.error("Failed upload to database\n", result)
        res.status(500)
            .json({
                success: false,
                code: 500,
                message: "Internal Server Error"
            })
        fs.rmSync(newDirPath, {
            recursive: true,
            force: true,
            maxRetries: 20,
            retryDelay: 250
        })
        return;
    }

    res.status(201)
        .json({
            success: true,
            code: 201,
            submissionId: `${result.insertId}`
        });
})

app.get("/api/imgs/:fileName", async function (req, res) {
    const rootPath = `${__dirname}/imgs/${req.params.fileName}`;
    if (!fs.existsSync(rootPath)) {
        res.sendStatus(404);
        return;
    }

    res.sendFile(rootPath);
})

const jobs = {
    lastUpdate: 0,
    list: []
}

async function getJobs(res, SQL) {
    if ((Date.now() - jobs.lastUpdate) > 30_000) {
        const queryStr = "SELECT `jobs`.*, `job_applications`.`id` as appId, `job_applications`.`closed` FROM `jobs` LEFT JOIN `job_applications` ON(`job_applications`.`job_id` = `jobs`.`id` AND `job_applications`.`closed` = 0) WHERE `jobs`.`hidden` = 0 ORDER BY `jobs`.`id` DESC;"
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

        let isClosed;
        jobs.list = queryResult.map((value, index) => {
            isClosed = value.closed === null;
            delete value.closed
            delete value.added_by
            return {
                ...value,
                isClosed
            }
        })
        jobs.lastUpdate = Date.now();
    }

    return jobs.list;
}

app.get('/api/jobs', requestLimiter, async function (req, res) {
    const SQL = await getConnection(req, res);
    if (!SQL) return;

    const jobs = await getJobs(res, SQL);
    SQL.disconnect();
    if (!Array.isArray(jobs)) return;

    const sendJobs = jobs.map(value => {
        return {
            id: value.id,
            title: value.title,
            description: value.description,
            icon: value.icon
        }
    })

    res.status(200).json({
        success: true,
        code: 200,
        jobs: sendJobs
    })
})

app.get('/api/jobs/:id', requestLimiter, async function (req, res) {
    if (!isDigit(req.params.id)) {
        res.status(400).json({
            success: false,
            code: 400,
            message: "Bad request"
        })
        return;
    }
    const jobId = parseInt(req.params.id)

    const SQL = await getConnection(req, res);
    if (!SQL) return;

    const jobs = await getJobs(res, SQL);
    SQL.disconnect();
    if (!Array.isArray(jobs)) return;

    const sendJob = jobs.find(value => value.id === jobId);
    if (!sendJob) {
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
        job: sendJob
    })
})

function getRandomKey() {
    const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
    const random = ("" + Math.random()).substring(2, 8);
    const random_number = timestamp + random;
    return random_number;
}

function isDigit(digit) {
    return /^\d+$/.test(digit)
}