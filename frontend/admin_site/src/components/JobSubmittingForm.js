import React, { useEffect, useState } from "react";
import { getAdminInfo } from "../App";
import settings from "../data/settings";
import { setJobs, setJobsServerResponse } from "../pages/Jobs";
import './css/JobSubmittingForm.css'

let g_addJob = {};
export default function JobSubmittingForm() {
    const [addJob, setAddJob] = useState({isAdding: false});
    g_addJob.get = addJob;

    useEffect(() => {
        g_addJob.set = setAddJob;
    }, [])

    if (!addJob.isAdding) return null;
    return (
        <div className="submitting-fields">
            <section className="submitting-top">
                <h3>يرجى ملء معلومات الوظيفة</h3>
                <p>ستظهر هذه المعلومات على الموقع الرئيسي، لذا كن دقيقًا.</p>
            </section>


            {getJobSubmittingFormError()}
            <section className="submitting-body">
                <div>
                    <label htmlFor="job-title">إسم الوظيفة</label>
                    <input type="text" id="job-title"></input>
                </div>

                <div>
                    <label htmlFor="job-description">وصف الوظيفة</label>
                    <textarea id="job-description"></textarea>
                </div>

                <div>
                    <label htmlFor="job-icon">أيقونة الوظيفة</label>
                    <input type="url" id="job-icon" placeholder="https://..."></input>
                </div>

                <div>
                    <label htmlFor="job-responsibilities">المهام والمسؤوليات</label>
                    <textarea id="job-responsibilities" className="long">

                    </textarea>
                </div>

                <div>
                    <label htmlFor="job-qualifications">المهارات والمؤهلات</label>
                    <textarea id="job-qualifications" className="long">

                    </textarea>
                </div>
            </section>

            <section className="submitting-bottom">
                <button className="form-button" id="confirm-submit" onClick={submitNewJob}>
                    <span>تم</span>
                    <span className="loading-spinner-button" role="status" aria-hidden="true"></span>
                </button>

                <button className="form-button" id="cancel-submit" onClick={hideJobSubmittingForm}>
                    <span>إلغاء</span>
                </button>
            </section>
        </div>
    )
}

async function submitNewJob(event) {
    // job-title    job-description     job-icon    job-responsibilities    job-qualifications
    const jobTitle = document.getElementById("job-title").value;
    const jobDescription = document.getElementById("job-description").value;
    const jobIcon = document.getElementById("job-icon").value;
    const jobResponsibilities = document.getElementById("job-responsibilities").value;
    const jobQualifications = document.getElementById("job-qualifications").value;

    if (jobTitle.trim().length === 0) {
        g_addJob.set(oldVal => {
            return {
                ...oldVal,
                error: "يجب إدخال إسم الوظيفة"
            }
        })
        return;
    } else if (jobDescription.trim().length === 0) {
        g_addJob.set(oldVal => {
            return {
                ...oldVal,
                error: "يجب إدخال وصف الوظيفة"
            }
        })
        return;
    }  else if (jobIcon.trim().length === 0) {
        g_addJob.set(oldVal => {
            return {
                ...oldVal,
                error: "يجب إدخال أيقونة الوظيفة"
            }
        })
        return;
    }  else if (jobResponsibilities.trim().length === 0) {
        g_addJob.set(oldVal => {
            return {
                ...oldVal,
                error: "يجب إدخال مسؤوليات الوظيفة"
            }
        })
        return;
    }  else if (jobQualifications.trim().length === 0) {
        g_addJob.set(oldVal => {
            return {
                ...oldVal,
                error: "يجب إدخال مؤهلات الوظيفة"
            }
        })
        return;
    }

    const spinner = event.target.querySelector(".loading-spinner-button");
    console.log(event.target)
    console.log(event)
    if (spinner) {
        console.log(spinner)
        spinner.style.display = "block";
    }


    const body = JSON.stringify({
        csrfToken: getAdminInfo("csrfToken"),
        jobTitle,
        jobDescription,
        jobIcon,
        jobResponsibilities,
        jobQualifications
    })

    let fetchResult;
    try {
        fetchResult = await fetch(`${settings.api}/jobs`, {
            method: "POST",
            credentials: "include",
            body: body,
            headers: {
                'Content-Type': "application/json"
            }
        });
    } catch (error) {
        console.error(error);
        g_addJob.set(oldVal => {
            return {
                ...oldVal,
                error: "الخادم لايستجيب"
            }
        })
    } finally {
        if (fetchResult) {
            const response = await fetchResult.json();
            if (fetchResult.ok) {
                hideJobSubmittingForm();
                setJobs(response.jobs)
                setJobsServerResponse({
                    success: true,
                    code: 201
                })
            } else {
                if (fetchResult.status === 401) {
                    window.location.href = `/login/?redirect=${window.location.pathname}${window.location.search}`
                    return;
                }
                g_addJob.set(oldVal => {
                    return {
                        ...oldVal,
                        error: `${response.message}`
                    }
                })
            }
        }

        if (spinner) {
            spinner.style.display = "none";
        }
    }
}

function getJobSubmittingFormError() {
    if (!g_addJob?.get?.error) return;

    return (
        <div className="submitting-error">
            <p>{g_addJob.get.error}</p>
        </div>
    )
}

function hideJobSubmittingForm() {
    g_addJob.set({isAdding: false})
}

export function showJobSubmittingForm(event) {
    if (!g_addJob?.get || g_addJob.isAdding) return null;

    g_addJob.set({isAdding: true})
}