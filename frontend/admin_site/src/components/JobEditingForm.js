import React, { useEffect, useState } from "react";
import { getAdminInfo } from "../App";
import settings from "../data/settings";
import { setJobs, setJobsServerResponse } from "../pages/Jobs";
import './css/JobEditingForm.css'

let g_editJob = {};
let g_jobInfo = {};
export default function JobEditingForm() {
    const [editJob, setEditJob] = useState({isEditing: false});
    const [jobInfo, setJobInfo] = useState({});
    g_editJob.get = editJob;
    g_jobInfo.get = jobInfo;

    useEffect(_ => {
        g_editJob.set = setEditJob;
        g_jobInfo.set = setJobInfo;
    }, []);

    useEffect(() => {
        if (!editJob.isEditing) return;

        const title = document.getElementById("job-title");
        const description = document.getElementById("job-description");
        const icon = document.getElementById("job-icon");
        const responsibilities = document.getElementById("job-responsibilities");
        const qualifications = document.getElementById("job-qualifications");
        const editButton = document.getElementById("confirm-edit");

        title.disabled = true;
        description.disabled = true;
        icon.disabled = true;
        responsibilities.disabled = true;
        qualifications.disabled = true;
        editButton.disabled = true;

        fetchJobInfo()
    }, [editJob])

    if (!editJob.isEditing) return null;
    return (
        <div className="editing-fields">
            <section className="editing-top">
                <div className="title">
                    <h3>التعديل على بيانات الوظيفة</h3>
                    <p>ستظهر هذه المعلومات على الموقع الرئيسي، لذا كن دقيقًا.</p>
                </div>

                <div className="action">
                    <button className="form-button" id="delete-job" onClick={deleteJob}>
                        <span>حذف</span>
                        <i className="fas fa-trash delete-job-icon"></i>
                        <span className="loading-spinner-button" role="status" aria-hidden="true"></span>
                    </button>
                </div>
            </section>


            {getJobEditingFormError()}

            <section className="editing-buttons">
                {getJobEditingButtons()}
            </section>

            <section className="editing-body">
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

            <section className="editing-bottom">
                <button className="form-button" id="confirm-edit" onClick={submitJobEdit}>
                    <span>حفظ</span>
                    <span className="loading-spinner-button" role="status" aria-hidden="true"></span>
                </button>

                <button className="form-button" id="cancel-edit" onClick={hideJobEditingForm}>
                    <span>إلغاء</span>
                </button>
            </section>
        </div>
    )
}

async function deleteJob(event) {
    const gg = window.confirm("هل أنت متأكد من أنك تريد حذف الوظيفة [" + document.getElementById("job-title").getAttribute("value") +"] ؟");
    if (!gg) return;

    const body = {
        csrfToken: getAdminInfo("csrfToken"),
    }

    const spinner = event.target.querySelector(".loading-spinner-button");
    const icon = event.target.querySelector(".delete-job-icon");
    if (spinner) {
        spinner.style.display = "block";
    }
    if (icon) {
        icon.style.display = "none";
    }
    event.target.disabled = true;

    let fetchResult;
    try {
        fetchResult = await fetch(`${settings.api}/jobs/${g_editJob.get.jobId}`, {
            method: "DELETE",
            credentials: "include",
            body: JSON.stringify(body),
            headers: {
                'Content-Type': "application/json"
            }
        });
    } catch (error) {
        console.error(error);
        g_jobInfo.set(oldVal => {
            return {
                ...oldVal,
                error: "الخادم لايستجيب"
            }
        })
    } finally {
        if (fetchResult) {
            const response = await fetchResult.json();
            if (fetchResult.ok) {
                hideJobEditingForm();
                setJobs(response.jobs);
                setJobsServerResponse({
                    success: true,
                    code: 200
                })
            } else {
                if (fetchResult.status === 401) {
                    window.location.href = `/login/?redirect=${window.location.pathname}${window.location.search}`
                    return;
                }
                g_jobInfo.set(oldVal => {
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
        if (icon) {
            icon.style.display = "block";
        }
        event.target.disabled = false;
    }
}

function getJobEditingButtons() {
    if (!('hidden' in g_jobInfo.get) || !('closed' in g_jobInfo.get)) {
        return null;
    }

    return (
        <>
            <button className="form-button" id="toggle-job-apply" onClick={toggleJobApply}>
                <span>{(g_jobInfo.get.closed && "فتح توظيف") || "إغلاق توظيف"}</span>
                <span className="loading-spinner-button" role="status" aria-hidden="true"></span>
            </button>

            <button className="form-button" id="toggle-hide" onClick={setJobVisible}>
                <span>{(g_jobInfo.get.hidden && "إظهار") || "إخفاء"}</span>
                <span className="loading-spinner-button" role="status" aria-hidden="true"></span>
            </button>
        </>
    )
}

async function toggleJobApply(event) {
    const body = {
        csrfToken: getAdminInfo("csrfToken"),
        toggleApply: (g_jobInfo.get.closed && 1) || 0
    }

    const spinner = event.target.querySelector(".loading-spinner-button");
    if (spinner) {
        spinner.style.display = "block";
    }
    event.target.disabled = true;

    let fetchResult;
    try {
        fetchResult = await fetch(`${settings.api}/jobs/${g_editJob.get.jobId}`, {
            method: "PATCH",
            credentials: "include",
            body: JSON.stringify(body),
            headers: {
                'Content-Type': "application/json"
            }
        });
    } catch (error) {
        console.error(error);
        g_jobInfo.set(oldVal => {
            return {
                ...oldVal,
                error: "الخادم لايستجيب"
            }
        })
    } finally {
        if (fetchResult) {
            const response = await fetchResult.json();
            if (fetchResult.ok) {
                hideJobEditingForm();
                setJobs(response.jobs);
                setJobsServerResponse({
                    success: true,
                    code: 200
                })
            } else {
                if (fetchResult.status === 401) {
                    window.location.href = `/login/?redirect=${window.location.pathname}${window.location.search}`
                    return;
                }
                g_jobInfo.set(oldVal => {
                    return {
                        ...oldVal,
                        error: `${response.message}`
                    }
                })
            }
        }

        if (spinner) {
            spinner.style.display = "block";
        }
        event.target.disabled = false;
    }
}

async function setJobVisible(event) {
    const body = {
        csrfToken: getAdminInfo("csrfToken"),
        setVisible: g_jobInfo.get.hidden ? 0 : 1
    }

    const spinner = event.target.querySelector(".loading-spinner-button");
    if (spinner) {
        spinner.style.display = "block";
    }
    event.target.disabled = true;

    let fetchResult;
    try {
        fetchResult = await fetch(`${settings.api}/jobs/${g_editJob.get.jobId}`, {
            method: "PATCH",
            credentials: "include",
            body: JSON.stringify(body),
            headers: {
                'Content-Type': "application/json"
            }
        });
    } catch (error) {
        console.error(error);
        g_jobInfo.set(oldVal => {
            return {
                ...oldVal,
                error: "الخادم لايستجيب"
            }
        })
    } finally {
        if (fetchResult) {
            const response = await fetchResult.json();
            if (fetchResult.ok) {
                hideJobEditingForm();
                setJobs(response.jobs);
                setJobsServerResponse({
                    success: true,
                    code: 200
                })
            } else {
                if (fetchResult.status === 401) {
                    window.location.href = `/login/?redirect=${window.location.pathname}${window.location.search}`
                    return;
                }
                g_jobInfo.set(oldVal => {
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
        event.target.disabled = false;
    }
}

async function submitJobEdit(event) {
    // job-title    job-description     job-icon    job-responsibilities    job-qualifications
    const jobTitle = document.getElementById("job-title");
    const jobDescription = document.getElementById("job-description");
    const jobIcon = document.getElementById("job-icon");
    const jobResponsibilities = document.getElementById("job-responsibilities");
    const jobQualifications = document.getElementById("job-qualifications");

    const jobTitleValue = jobTitle.value.trim();
    const jobDescriptionValue = jobDescription.value.trim();
    const jobIconValue = jobIcon.value.trim();
    const jobResponsibilitiesValue = jobResponsibilities.value.trim();
    const jobQualificationsValue = jobQualifications.value.trim();

    if (jobTitleValue.length === 0) {
        g_jobInfo.set(oldVal => {
            return {
                ...oldVal,
                error: "يجب إدخال إسم الوظيفة"
            }
        })
        return;
    } else if (jobDescriptionValue.length === 0) {
        g_jobInfo.set(oldVal => {
            return {
                ...oldVal,
                error: "يجب إدخال وصف الوظيفة"
            }
        })
        return;
    }  else if (jobIconValue.length === 0) {
        g_jobInfo.set(oldVal => {
            return {
                ...oldVal,
                error: "يجب إدخال أيقونة الوظيفة"
            }
        })
        return;
    }  else if (jobResponsibilitiesValue.length === 0) {
        g_jobInfo.set(oldVal => {
            return {
                ...oldVal,
                error: "يجب إدخال مسؤوليات الوظيفة"
            }
        })
        return;
    }  else if (jobQualificationsValue.length === 0) {
        g_jobInfo.set(oldVal => {
            return {
                ...oldVal,
                error: "يجب إدخال مؤهلات الوظيفة"
            }
        })
        return;
    }

    const body = {}
    if (jobTitleValue !== jobTitle.getAttribute("value").trim()) body.jobTitle = jobTitleValue;
    if (jobDescriptionValue !== jobDescription.getAttribute("value").trim()) body.jobDescription = jobDescriptionValue;
    if (jobIconValue !== jobIcon.getAttribute("value").trim()) body.jobIcon = jobIconValue;
    if (jobResponsibilitiesValue !== jobResponsibilities.getAttribute("value").trim()) body.jobResponsibilities = jobResponsibilitiesValue;
    if (jobQualificationsValue !== jobQualifications.getAttribute("value").trim()) body.jobQualifications = jobQualificationsValue;

    if (Object.values(body).length === 0) {
        g_jobInfo.set(oldVal => {
            return {
                ...oldVal,
                error: "لم يتم رصد أي تعديلات، تأكد من مدخلاتك."
            }
        })
        return;
    }

    const spinner = event.target.querySelector(".loading-spinner-button");
    if (spinner) {
        console.log(spinner)
        spinner.style.display = "block";
    }

    body.csrfToken = getAdminInfo("csrfToken");
    let fetchResult;
    try {
        fetchResult = await fetch(`${settings.api}/jobs/${g_editJob.get.jobId}`, {
            method: "PATCH",
            credentials: "include",
            body: JSON.stringify(body),
            headers: {
                'Content-Type': "application/json"
            }
        });
    } catch (error) {
        console.error(error);
        g_jobInfo.set(oldVal => {
            return {
                ...oldVal,
                error: "الخادم لايستجيب"
            }
        })
    } finally {
        if (fetchResult) {
            const response = await fetchResult.json();
            if (fetchResult.ok) {
                hideJobEditingForm();
                setJobs(response.jobs)
                setJobsServerResponse({
                    success: true,
                    code: 200
                })
            } else {
                if (fetchResult.status === 401) {
                    window.location.href = `/login/?redirect=${window.location.pathname}${window.location.search}`
                    return;
                }
                g_jobInfo.set(oldVal => {
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

function getJobEditingFormError() {
    if (!g_jobInfo?.get?.error) return;

    return (
        <div className="editing-error">
            <p>{g_jobInfo.get.error}</p>
        </div>
    )
}

function hideJobEditingForm() {
    g_editJob.set({isEditing: false})
    g_jobInfo.set({});
}

export function showJobEditingForm(event) {
    if (g_editJob?.get?.isEditing === true) return null;

    let jobId;
    const tagName = event.target.tagName.toLowerCase();
    if (tagName === "td") {
        jobId =  event.target.parentElement.dataset.id
    } else if (tagName === "tr") {
        jobId =  event.target.dataset.id
    } else {
        return;
    }
    g_editJob.set({
        isEditing: true,
        jobId
    })
}

function setJobInfo(jobInfo) {
    const title = document.getElementById("job-title");
    const description = document.getElementById("job-description");
    const icon = document.getElementById("job-icon");
    const responsibilities = document.getElementById("job-responsibilities");
    const qualifications = document.getElementById("job-qualifications");
    const editButton = document.getElementById("confirm-edit");

    title.setAttribute("value", jobInfo.title)
    title.value = jobInfo.title

    description.setAttribute("value", jobInfo.description)
    description.value = jobInfo.description

    icon.setAttribute("value", jobInfo.icon)
    icon.value = jobInfo.icon

    responsibilities.setAttribute("value", jobInfo.responsibilities)
    responsibilities.value = jobInfo.responsibilities

    qualifications.setAttribute("value", jobInfo.qualifications)
    qualifications.value = jobInfo.qualifications

    g_jobInfo.set(oldVal => {
        return {
            ...oldVal,
            hidden: jobInfo.hidden,
            closed: jobInfo.closed
        }
    })

    title.disabled = false;
    description.disabled = false;
    icon.disabled = false;
    responsibilities.disabled = false;
    qualifications.disabled = false;
    editButton.disabled = false;
}

async function fetchJobInfo() {
    let fetchResult;
    const url = `${settings.api}/jobs/${g_editJob.get.jobId}`;
    console.log(url)
    try {
        fetchResult = await fetch(url, {
            method: "GET",
            credentials: "include"
        })
    } catch (error) {
        console.error(error);
        g_jobInfo.set(oldVal => {
            return {
                ...oldVal,
                error: "الخادم لايستجيب"
            }
        })
    } finally {
        if (fetchResult) {
            const response = await fetchResult.json();
            if (fetchResult.ok) {
                setJobInfo(response.jobInfo)
            } else {
                g_jobInfo.set(oldVal => {
                    return {
                        ...oldVal,
                        error: response.message
                    }
                })
            }
        }
    }
}