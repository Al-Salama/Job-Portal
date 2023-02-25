// Alsalamah
require("dotenv").config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const fs = require('fs');
const { SqlConnection } = require("./utils/sql");
const {formVerifyer} = require("./utils/formDataVerifyer")
const {requestLimiter, submitLimiter} = require("./utils/rateLimiter")

const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    optionsSuccessStatus: 200
}

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.listen(process.env.PORT, process.env.HOST, function () {
    console.log("http listening to " + process.env.PORT);
})

app.post('/jobs/apply', requestLimiter, formVerifyer, async function (req, res) {
    const fields = req.form.fields;
    const files = req.form.files;

    const applicationKey = getRandomKey();
    const newDirPath = `${__dirname}/application_files/${applicationKey}`
    if (fs.existsSync(newDirPath)) {
        console.error("The application key already exists!");
        res.status(500)
            .json({
                success: false,
                error: 500,
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
                error: 500,
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
                    error: 500,
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

    const canUserSubmitApplication = await submitLimiter(req, res);
    if (!canUserSubmitApplication) {
        return;
    };

    const SQL = new SqlConnection();
    const [success, connection] = await SQL.connect();
    if (!success) {
        console.error("Failed connect to database\n", connection)
        res.status(500)
            .json({
                success: false,
                error: 500,
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
    const [querySuccess, result] = await SQL.query(
        "INSERT INTO `job_applications` (`application_key`, `ip`, `name`, `sex`, `id_number`, `birth_date`, `marital_status`, `nationality`, `phone`, `city`, `address`, `email`, `degree`, `graduate_date`, `gpa`, `field`, `courses`, `experiences`, `computer_rate`, `english_rate`, `flexibility_rate`, `self_talk`, `files`)"
        + "VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);",
        [applicationKey, req.ip, fields.name, fields.sex, fields.idNumber, fields.birthDate, fields.maritalStatus, fields.nationality, fields.phone, fields.city, fields.address, fields.email, fields.degree, fields.graduateDate, fields.gpa, fields.field, fields.courses, fields.experiences, fields.computerRate, fields.englishRate, fields.flexibilityRate, fields.selfTalk, JSON.stringify(fileExtensions, null, 0)]
    )
    SQL.disconnect();

    if (!querySuccess) {
        console.error("Failed upload to database\n", result)
        res.status(500)
            .json({
                success: false,
                error: 500,
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

    res.status(200)
        .json({
            success: true,
            applicationId: `${result.insertId}`
        });
})

app.get("/application_files/:applicationKey/:fileName", async function (req, res) {
    const rootPath = `${__dirname}/application_files/${req.params.applicationKey}/${req.params.fileName}`;
    if (!fs.existsSync(rootPath)) {
        res.sendStatus(404);
        return;
    }

    res.sendFile(rootPath);
})

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomKey() {
    const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
    const random = ("" + Math.random()).substring(2, 8);
    const random_number = timestamp + random;
    return random_number;
}