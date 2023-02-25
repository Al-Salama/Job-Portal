require("dotenv").config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const { SqlConnection } = require("./utils/sql");

const corsOptions = {
    origin: process.env.Admin_CORS_ORIGIN,
    credentials: true,
    optionsSuccessStatus: 200
}

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.listen(process.env.Admin_PORT, process.env.ADMIN_HOST, function () {
    console.log("admin http listening to " + process.env.Admin_PORT);
})

