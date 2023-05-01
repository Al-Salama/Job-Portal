import React, { useEffect, useState } from "react"
import settings from "../data/settings";
import "./css/Submission.css"
import logo from '../assets/imgs/logo.png'
import { getAdminInfo } from "../App";

let g_submission = {};
let g_serverResponse = {};
let g_showAcceptanceFields = {};
export default function Submission() {
    const [submission, setSubmission] = useState();
    const [serverResponse, setServerResponse] = useState();
    const [showAcceptanceFields, setShowAcceptanceFields] = useState();
    g_submission.get = submission;
    g_serverResponse.get = serverResponse;
    g_showAcceptanceFields.get = showAcceptanceFields;

    useEffect(() => {
        g_submission.set = setSubmission;
        g_serverResponse.set = setServerResponse;
        g_showAcceptanceFields.set = setShowAcceptanceFields;
        onAppLoaded()
    }, [])
    useEffect(submissionStateHandler, [submission])
    useEffect(serverResponseStateHandler, [serverResponse])
    useEffect(acceptanceFieldHandler, [showAcceptanceFields])

    const submissionsStatus = ["جديد", "مقبول", "معلق", "مرفوض"]
    if (submission) {
        return (
            <main className="Submission">
                <section className="top-info">
                    <div className="rows-data">
                        <div>
                            <p><b>تاريخ التقديم:</b> </p>
                            <p><b>رقم التقديم:</b> </p>
                            <p><b>الوظيفة:</b> </p>
                            <p><b>حالة التقديم:</b> </p>
                        </div>
                        <div>
                            <p>{submission.date.toLocaleDateString("ar-US", {dateStyle: "short"})}</p>
                            <p>{submission.id}</p>
                            <p>{submission.jobName}</p>
                            <p>{submissionsStatus[submission.status]}</p>
                        </div>
                    </div>

                    <div className="rows-data logo">
                        <img className="logo" src={logo} alt="Shubra logo" />
                    </div>
                    <div className="rows-data">
                        <div>
                            <p><b>السيرة الذاتية:</b> </p>
                            <p><b>شهادة المؤهل العلمي:</b> </p>
                            <p><b>شهادة التأمينات:</b> </p>
                        </div>
                        <div>
                            <p><a href={submission.files.cv} target="_blank" rel="noopener noreferrer">فتح</a></p>

                            <p><a href={submission.files.certificate} target="_blank" rel="noopener noreferrer">فتح</a></p>
                            <p>{
                                (submission.files.expertiseCertificate && <a href={submission.files.expertiseCertificate} target="_blank" rel="noopener noreferrer">فتح</a>)
                                || "لايوجد"
                            }</p>
                        </div>
                    </div>
                </section>
                {getAcceptanceField()}
                <section className="center">
                    <table className="submission-table">
                        <thead>
                            <tr>
                                <th colSpan="4">المعلومات العامة</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <th colSpan="2">الإسم</th>
                                <th>الجنس</th>
                                <th>رقم الهوية</th>
                            </tr>

                            <tr>
                                <td colSpan="2">{submission.name}</td>
                                <td>{submission.sex}</td>
                                <td>{submission.id_number}</td>
                            </tr>

                            <tr>
                                <th>تاريخ الميلاد</th>
                                <th>الحالة الإجتماعية</th>
                                <th colSpan={2}>رقم الجوال</th>

                            </tr>

                            <tr>
                                <td>{submission.birth_date.toLocaleDateString("ar-US", {dateStyle: "short"})}</td>
                                <td>{submission.marital_status}</td>
                                <td colSpan={2}>{submission.phone}</td>
                            </tr>

                            <tr>
                                <th colSpan={3}>الجنسية</th>
                                <th>المدينة</th>
                            </tr>

                            <tr>
                                <td colSpan={3}>{submission.nationality}</td>
                                <td>{submission.city}</td>
                            </tr>

                            <tr>
                                <th colSpan={3}>العنوان</th>
                                <th>الايميل</th>
                            </tr>

                            <tr>
                                <td colSpan={3}>{submission.address}</td>
                                <td>{submission.email}</td>
                            </tr>
                        </tbody>
                    </table>
                    <table className="submission-table">
                        <thead>
                            <tr>
                                <th colSpan="4">المؤهل العلمي</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <th>الشهادة</th>
                                <th colSpan="2">{(submission.field && "التخصص") || "المعدل"}</th>
                                <th>سنة التخرج</th>
                            </tr>

                            <tr>
                                <td>{submission.degree}</td>
                                <td colSpan="2">{submission.field || submission.gpa}</td>
                                <td>{submission.graduate_date}</td>
                            </tr>
                        </tbody>
                    </table>
                    <table className="submission-table">
                        <thead>
                            <tr>
                                <th colSpan="4">الدورات والخبرات</th>
                            </tr>
                        </thead>

                        {getCourses(submission.courses, submission.files)}
                    </table>

                    <table className="submission-table">
                        <thead>
                            <tr>
                                <th colSpan="5">الخبرة السابقة</th>
                            </tr>
                        </thead>

                        {getExperiences(submission.experiences)}
                    </table>
                    <table className="submission-table">
                        <thead>
                            <tr>
                                <th colSpan="5">التقييم الذاتي</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <th>الحاسب الآلي</th>
                                <th>اللغة الإنجليزية</th>
                                <th>المرونة في العمل</th>
                            </tr>

                            <tr>
                                <td>{submission.computer_rate}</td>
                                <td>{submission.english_rate}</td>
                                <td>{submission.flexibility_rate}</td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                <section className="center">
                    <table className="submission-table">
                        <thead>
                            <tr>
                                <th>تكلم عن نفسك</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td>
                                    {submission.self_talk}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                <section className="center">
                    {getServerResponseText()}

                    {getSubmissionButtons()}
                </section>
            </main>
        )
    } else {
        return (
            <main className="Submission">
                <section className="center">
                    <h2>Loading ...</h2>
                </section>
            </main>
        )
    }
}

function getSubmissionButtons() {
    let buttons = null;
    if (g_submission.get.status === 0) {
        buttons =
        <div className="buttons">
            <button className="form-button" id="accept" disabled={false}>
                <span>قبول</span>
                <span className="loading-spinner-button" role="status" aria-hidden="true"></span>
            </button>

            <button className="form-button" id="pend" disabled={false}>
                <span>تعليق</span>
                <span className="loading-spinner-button" role="status" aria-hidden="true"></span>
            </button>

            <button className="form-button" id="reject" disabled={false}>
                <span>رفض</span>
                <span className="loading-spinner-button" role="status" aria-hidden="true"></span>
            </button>
        </div>
    } else if (g_submission.get.status === 2) {
        buttons =
        <div className="buttons">
            <button className="form-button" id="unpend" disabled={false}>
                <span>إلغاء التعليق</span>
                <span className="loading-spinner-button" role="status" aria-hidden="true"></span>
            </button>
        </div>
    } else if (g_submission.get.status === 3) {
        buttons =
        <div className="buttons">
            <button className="form-button" id="unreject" disabled={false}>
                <span>إلغاء الرفض</span>
                <span className="loading-spinner-button" role="status" aria-hidden="true"></span>
            </button>
        </div>
    }

    return buttons
}

function getAcceptanceFieldError() {
    if (!g_showAcceptanceFields.get.error) return;

    return (
        <div className="error">
            <p>{g_showAcceptanceFields.get.error}</p>
        </div>
    )
}

function getAcceptanceField() {
    if (!g_showAcceptanceFields.get) return null;

    const options = g_showAcceptanceFields.get.locations.map((value, index) => {
        return <option key={value.id} value={`${value.id}`}>{`${value.name}`}</option>
    })

    return (
        <div className="acceptance-field">
            <section className="acceptance-top">
                <h3>يرجى ملء معلومات القبول</h3>
                <p>سيتم إرسال هذه المعلومات على الواتساب إلى الشخص المتقدم، كن دقيقًا</p>
            </section>

            <section className="acceptance-body">
                {getAcceptanceFieldError()}
                <div>
                    <label htmlFor="intrvu-time">موعد المقابلة</label>
                    <input type={"datetime-local"} id="intrvu-time"></input>
                </div>

                <div>

                    <label htmlFor="intrvu-location">موقع المقابلة</label>
                    <select id="intrvu-location" defaultValue="default">
                        <option value={`default`} disabled>يرجى إختيار موقع المقابلة</option>
                        {options}
                    </select>
                </div>

                <div>
                    <label htmlFor="intrvu-notes">ملاحظات أخرى</label>
                    <textarea id="intrvu-notes" placeholder="إختياري">

                    </textarea>
                </div>
            </section>

            <section className="acceptance-bottom">
                <button className="form-button" id="confirm-accept">
                    <span>تم</span>
                    <span className="loading-spinner-button" role="status" aria-hidden="true"></span>
                </button>

                <button className="form-button" id="cancel-accept">
                    <span>إلغاء</span>
                </button>
            </section>
        </div>
    )
}

function onAppLoaded() {
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
    const submitId = parseInt(params.id);
    if (!isNumber(submitId) || submitId <= 0) {
        window.location.replace("/")
        return;
    };

    fetchSubmissionData(submitId)
}

function submissionStateHandler() {
    if (!g_submission.get) return;

    const buttons = document.querySelectorAll(".buttons button")
    for (const button of buttons) {
        button.addEventListener("click", onButtonClick)
    }

    return () => {
        for (const button of buttons) {
            button.removeEventListener("click", onButtonClick)
        }
    }
}

function serverResponseStateHandler() {
    if (!g_serverResponse.get) return;

    const alertElement = document.querySelector(".alert");
    if (alertElement) {
        alertElement.scrollIntoView({
            behavior: "smooth",
            block: "center"
        })
    }
}

function acceptanceFieldHandler() {
    if (!g_showAcceptanceFields.get) return;

    const acceptanceWindow = document.querySelector(".acceptance-field");
    acceptanceWindow.scrollIntoView({
        behavior: "smooth",
        block: "center"
    })
    const acceptButton = document.getElementById("confirm-accept");
    const cancelButton = document.getElementById("cancel-accept");

    acceptButton.addEventListener("click", onAcceptanceFieldConfirm);
    cancelButton.addEventListener("click", onAcceptanceFieldCancel);
}

function isValidDateInput(dateInput){
    const timestamp = Date.parse(dateInput);
    return isNaN(timestamp) === false;
}

async function onAcceptanceFieldConfirm(event){
    const interviewDateInput = document.getElementById("intrvu-time").value;
    const interviewLocationInput = document.getElementById("intrvu-location");
    const interviewNotesInput = document.getElementById("intrvu-notes").value;

    if (interviewDateInput.length === 0) {
        g_showAcceptanceFields.set(oldVal => {
            const checkedOldValue = (typeof oldVal === "object" && oldVal) || {};
            return {
                ...checkedOldValue,
                error: "يجب إدخال موعد المقابلة"
            }
        })
        return;
    } else if (interviewLocationInput.selectedIndex < 1) {
        g_showAcceptanceFields.set(oldVal => {
            const checkedOldValue = (typeof oldVal === "object" && oldVal) || {};
            return {
                ...checkedOldValue,
                error: "يجب إدخال موقع المقابلة"
            }
        })
        return;
    } else if (!isValidDateInput(interviewDateInput)) {
        g_showAcceptanceFields.set(oldVal => {
            const checkedOldValue = (typeof oldVal === "object" && oldVal) || {};
            return {
                ...checkedOldValue,
                error: "يجب إدخال تاريخ مقابلة صالح"
            }
        })
        return;
    }

    const nowDate = Date.now()
    const interviewDate = Date.parse(interviewDateInput);

    if ((interviewDate - nowDate) <= 0) {
        g_showAcceptanceFields.set(oldVal => {
            const checkedOldValue = (typeof oldVal === "object" && oldVal) || {};
            return {
                ...checkedOldValue,
                error: "يجب أن يكون تاريخ المقابلة في المستقبل!"
            }
        })
        return;
    }

    const spinner = this.querySelector(".loading-spinner-button");
    if (spinner) {
        spinner.style.display = "block";
    }

    const body = JSON.stringify({
        csrfToken: getAdminInfo("csrfToken"),
        id: g_submission.get.id,
        status: 1,

        interviewDate: interviewDate,
        interviewLocation: interviewLocationInput.value,
        interviewNotes: interviewNotesInput
    })

    let fetchResult;
    try {
        fetchResult = await fetch(`${settings.api}/submissions`, {
            method: "PATCH",
            credentials: "include",
            body: body,
            headers: {
                'Content-Type': "application/json"
            }
        });
    } catch (error) {
        console.error(error);
    } finally {
        if (fetchResult) {
            const response = await fetchResult.json();
            if (fetchResult.ok) {
                g_submission.set(oldValue => {
                    return {
                        ...oldValue,
                        status: response.newStatus
                    }
                })
                g_serverResponse.set(response)
                g_showAcceptanceFields.set(false);
            } else {
                if (fetchResult.status === 401) {
                    window.location.href = `/login/?redirect=${window.location.pathname}${window.location.search}`
                    return;
                }
                g_showAcceptanceFields.set(oldVal => {
                    const checkedOldValue = (typeof oldVal === "object" && oldVal) || {};
                    return {
                        ...checkedOldValue,
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

function onAcceptanceFieldCancel(event){
    g_showAcceptanceFields.set(false);
}

async function fetchLocations(){
    let fetchResult;
    let locations;
    try {
        fetchResult = await fetch(`${settings.api}/locations`, {
            method: "GET",
            credentials: "include"
        })
    } catch (error) {
        console.error(error);
    } finally {
        if (fetchResult) {
            const response = await fetchResult.json();
            if (fetchResult.ok) {
                locations = response;
            } else {
                g_serverResponse.set(response)
            }
        }
    }

    return locations;
}

async function onButtonClick(event) {
    if (g_submission.get.status === 1) return;

    let newStatus;

    if (this.id === "unpend" || this.id === "unreject") newStatus = 0;
    else if (this.id === "accept") newStatus = 1;
    else if (this.id === "pend") newStatus = 2;
    else if (this.id === "reject") newStatus = 3;
    else {
        event.preventDefault();
        return;
    }

    if (newStatus === g_submission.get.status) {
        g_serverResponse.set({
            success: false,
            code: "409",
            message: `إن هذا الطلب ${newStatus === 0 ? "بحالته الأصلية" : newStatus === 1 ? "مقبول" : newStatus === 2 ? "معلق" : "مرفوض"} بالفعل!`
        })

        event.preventDefault();
        return;
    }

    const spinner = this.querySelector(".loading-spinner-button");
    if (spinner) {
        spinner.style.display = "block";
    }

    if (newStatus === 1) {
        const locations = await fetchLocations();
        if (locations) {
            g_showAcceptanceFields.set(locations);
        }
        spinner.style.display = "none";
        return;
    }

    const body = JSON.stringify({
        csrfToken: getAdminInfo("csrfToken"),
        id: g_submission.get.id,
        status: newStatus
    })
    let fetchResult;
    try {
        fetchResult = await fetch(`${settings.api}/submissions`, {
            method: "PATCH",
            credentials: "include",
            body: body,
            headers: {
                'Content-Type': "application/json"
            },
        })
    } catch (error) {
        console.error(error);
    } finally {
        if (fetchResult) {
            const response = await fetchResult.json();
            if (fetchResult.ok) {
                g_submission.set(oldValue => {
                    return {
                        ...oldValue,
                        status: response.newStatus
                    }
                })
            } else {
                if (fetchResult.status === 401) {
                    window.location.href = `/login/?redirect=${window.location.pathname}${window.location.search}`
                    return;
                }
            }
            g_serverResponse.set(response)
        }

        if (spinner) {
            spinner.style.display = "none";
        }
    }
}

const responseMessages = {
    "200": {
        message: "لقد تم تنفيذ الطلب بنجاح",
        className: "alert-green"
    },
    "400": {
        message: "يرجى التأكد من المعلومات المدخله",
        className: "alert-orange"
    },
    "401": {
        message: "أنت غير مصرح بعمل هذا الإجراء، يرجى تسجيل الدخول",
        className: "alert-orange"
    },
    "403": {
        message: "صلاحية الدخول غير معترف بها، يرجى إعادة تسجيل الدخول",
        className: "alert-orange"
    },
    "404": {
        message: "إن التقديم الذي تحاول تعديله غير معروف، يرجى إعادة تحديث الصفحة",
        className: "alert-orange"
    },
    "429": {
        message: "أنت تقوم بعمليات كثيرة جدًا، يرجى الإنتظار لوهلة قبل إجراء عملية أخرى.",
        className: "alert-orange"
    },
    "500": {
        message: "حدث خطأ مع الخادم، يرجى المحاولة في وقتٍ لاحق أو إتصل بالمسؤولين",
        className: "alert-red"
    },
    "503": {
        message: "هذه الخدمة غير متاحة حاليًا، يرجى المحاولة لاحقًا",
        className: ""
    }
}

function getServerResponseText() {
    if (typeof g_serverResponse.get === "object") {
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
                <pre>
                    {message}
                </pre>
            </div>
        )
    }
    return null;
}

function getCourses(courses, files) {
    let coursesTable;
    if (courses) {
        coursesTable =
        <tbody>
            <tr>
                <th colSpan="3">إسم الدورة</th>
                <th>المرفق</th>
            </tr>
            {courses.map((value, index) => {
                return (
                    <tr key={`data${index}`}>
                        <td colSpan="3">{value.name}</td>
                        <td>{
                            (files[`courseCertificate_${index}`] && <a href={files[`courseCertificate_${index}`]} target="_blank" rel="noopener noreferrer">فتح</a>)
                            || "لايوجد"
                        }</td>
                    </tr>
                )
            })}
        </tbody>
    }
    return coursesTable;
}

function getExperiences(experiences) {
    let experiencesTable;
    if (experiences) {
        experiencesTable =
        <tbody>
            <tr>
                <th>جهة العمل</th>
                <th>المسمى الوظيفي</th>
                <th>سنوات الخدمة</th>
                <th>سبب الترك</th>
                <th>الراتب</th>
            </tr>
            {experiences.map((value, index) => {
                return (
                    <tr key={`data${index}`}>
                        <td>{value.employer}</td>
                        <td>{value.title}</td>
                        <td>{value.years}</td>
                        <td>{value.quit}</td>
                        <td>{
                            (typeof value.salary === "number" && value.salary)
                            || "N/A"
                        }</td>
                    </tr>
                )
            })}
        </tbody>
    }
    return experiencesTable;
}

async function fetchSubmissionData(submissionId) {
    let fetchResult;
    const url = `${settings.api}/submissions/${submissionId}`
    try {
        fetchResult = await fetch(url, {
            method: "GET"
        })
    } catch (error) {
        console.error(error)
        window.location.replace("/");
        return;
    } finally{
        if (fetchResult && fetchResult.ok) {
            const response = await fetchResult.json();
            response.submission.date = new Date(response.submission.date);
            response.submission.birth_date = new Date(response.submission.birth_date);
            g_submission.set(response.submission);
        } else {
            window.location.replace("/");
        }
    }
}

function isNumber(num = Number.prototype) {
    return !Number.isNaN(num) && Number.isFinite(num);
}