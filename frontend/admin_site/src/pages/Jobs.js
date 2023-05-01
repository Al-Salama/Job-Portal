import React, { useEffect, useState } from "react";
import JobEditingForm, { showJobEditingForm } from "../components/JobEditingForm";
import JobSubmittingForm, { showJobSubmittingForm } from "../components/JobSubmittingForm";
import settings from "../data/settings";
import useArray from "../hooks/useArray";
import './css/Jobs.css'

let g_jobs = {};

let g_serverResponse = {};
export default function Jobs() {
    const jobs = useArray([]);

    const [serverResponse, setServerResponse] = useState();
    g_jobs = jobs;
    g_serverResponse.get = serverResponse;

    useEffect(() => {
        g_serverResponse.set = setServerResponse;

        fetchAllJobs();
    }, [])


    return (
        <div className="Jobs">
            <main>
                <JobSubmittingForm />
                <JobEditingForm />
                <section className="controls">
                    <button className="form-button" id="add-job" onClick={showJobSubmittingForm}>
                        إضافة وظيفة
                    </button>
                </section>

                <section className="info">
                    {getServerResponseText()}
                </section>

                <section className="jobs-area">
                    <div className="jobs-field">
                        {getJobs()}
                    </div>
                </section>
            </main>
        </div>
    )
}

const responseMessages = {
    "201": {
        message: "تمت العملية بنجاح، قد تأخذ التغييرات بضع لحظات حتى تظهر على الموقع الرئيسي.",
        className: "alert-green"
    },
    "200": {
        message: "تمت العملية بنجاح، قد تأخذ التغييرات بضع لحظات حتى تظهر على الموقع الرئيسي.",
        className: "alert-green"
    }
}

function hideServerResponseText(event) {
    g_serverResponse.set(undefined)
}

function getServerResponseText() {
    if (!g_serverResponse?.get) return null;

    let className;
    let message;

    const responseSettings = responseMessages[g_serverResponse.get.code];
    if (responseSettings) {
        className = responseSettings.className;
        message = responseSettings.message;
    } else {
        if (g_serverResponse.get.code >= 500) {
            className = "alert-red";
        } else {
            className = "alert-orange";
        }
        message = g_serverResponse.get.message || "لايمكن تنفيذ طلبك حاليًا، يرجى المحاولة لاحقًا"
    }

    return (
        <div className={`alert ${className}`}>
            <button className="alert-close" onClick={hideServerResponseText}>
                <i class="fas fa-times"></i>
            </button>
            <pre>
                {message}
            </pre>
        </div>
    )
}

export function setJobs(jobs) {
    g_jobs.set(jobs)
}

export function setJobsServerResponse(response){
    g_serverResponse.set(response)
}

function getJobs() {
    if (!g_jobs.array || g_jobs.array.length <= 0) return;

    const jobs = g_jobs.array.map((value, index) => {
        return (
            <tr key={index} data-id={value.id} onClick={showJobEditingForm}>
                <td>{value.id}</td>
                <td className="spacing-cell"></td>
                <td>{value.title}</td>
                <td className="spacing-cell"></td>
                <td>{(value.hidden && "مخفي") || (value.closed && "مغلق") || "مفتوح"}</td>
                <td className="spacing-cell"></td>
                <td>{value.added_by}</td>
                <td className="spacing-cell"></td>
                <td>{value.edited_by ? value.edited_by : "لا أحد"}</td>
            </tr>
        )
    })

    return (
        <table className="jobs">
            <thead>
                <tr>
                    <th>الرقم</th>
                    <th className="spacing-cell"></th>
                    <th>إسم الوظيفة</th>
                    <th className="spacing-cell"></th>
                    <th>الحالة</th>
                    <th className="spacing-cell"></th>
                    <th>أُنشئت من قبل</th>
                    <th className="spacing-cell"></th>
                    <th>عُدلت من قبل</th>
                </tr>
            </thead>
            <tbody>
                {jobs}
            </tbody>
        </table>
    );
}

async function fetchAllJobs() {
    let fetchResult;
    const url = `${settings.api}/jobs`;
    try {
        fetchResult = await fetch(url, {
            method: "GET",
            credentials: "include"
        })
    } catch (error) {
        console.error(error);
    } finally {
        if (fetchResult) {
            const response = await fetchResult.json();
            if (fetchResult.ok) {
                setJobs(response.jobs)
            }
        }
    }
}