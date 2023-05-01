import React, { useEffect, useRef, useState } from 'react';
import './css/Job.css';
import cities from '../data/cities'
import countries from '../data/countries'
import useArray from '../hooks/useArray';
import validateForm from '../utils/validator';
import formIds from '../data/inputs';
import addIcon from './imgs/add.png'
import deleteIcon from './imgs/delete.png'
const api = "https://career.shubraaltaif.com/api"
// const api = "http://localhost:3100/api"

function wait(ms) {
    return new Promise(
        function (resolve) {
            setTimeout(() => {
                resolve(true);
            }, ms)
        }
    )
}

function toggleAllInputs(toggle) {
    const inputs = document.querySelectorAll("input,button");
    for (const input of inputs) {
        input.disabled = (toggle !== undefined && toggle) || !input.disabled;
    }
}

function getFormData() {
    const formData = new FormData();
    let theInput;
    let inputType;
    for (const input of formIds) {
        theInput = document.getElementById(input);
        if (theInput) {
            inputType = `${theInput.getAttribute("type")}`.toLowerCase();
            if (inputType === "radio" && !theInput.checked) continue;

            let inputValue = theInput.value;
            if (inputType === "file") {
                inputValue = theInput.files[0];
            }
            formData.append(theInput.getAttribute("name"), inputValue);
        };
    };
    return formData;
}

async function onFormSubmit(e, courses, experience, setFormErrors, setServerRequestStatus, job) {
    e.preventDefault();
    e.stopPropagation();

    if (!job || job.isLoading) {
        return;
    }

    const formErrors = validateForm();
    if (formErrors.length > 0) {
        let inputParent = document.getElementById(formErrors[0].id).parentElement;
        if (inputParent.classList.contains("tooltip-container")) {
            inputParent = inputParent.parentElement;
        }
        inputParent.scrollIntoView({behavior: 'smooth', block: 'center'})

        await wait(600);
        setFormErrors(formErrors);
        return;
    };

    const form = document.getElementById("form");
    const formData = getFormData();

    const martialStatusInput = form.querySelector("select#marital-status")
    {
        let currentMaritalStatus = martialStatusInput.value;
        const martialStatusOther = formData.get("maritalStatusOther");
        if (martialStatusOther) {
            currentMaritalStatus = martialStatusOther;
            formData.delete("maritalStatusOther");
        }
        formData.set("maritalStatus", currentMaritalStatus);
    }

    if (courses.list.length > 0) {
        const sendCourseList = JSON.stringify(
            courses.list.map((course, index) => {
                const newServerList = {name: course.name}; // to be sent to the server.

                if (course.file) {
                    formData.append(`courseCertificate_${index}`, course.file);
                }
                return newServerList;
            }), null, 4
        )
        formData.append("courses", sendCourseList);
    }

    if (experience.list.length > 0) {
        const sendExperienceList = JSON.stringify(experience.list);
        formData.append("experiences", sendExperienceList);
    }

    formData.append("jobId", job.id);

    toggleAllInputs(true);
    setFormErrors([])
    document.querySelector(".loading-spinner-button").style.display = "unset";
    let fetched;
    try {
        console.time("fetch")
        fetched = await fetch(`${api}/jobs/apply`, {
            method: "POST",
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        console.timeEnd("fetch");
    } catch (error) {
        console.error(error);
    } finally {
        toggleAllInputs(false);
        document.querySelector(".loading-spinner-button").style.display = "none";

        if (!fetched) {
            setServerRequestStatus({
                success: false,
                error: 503,
                message: "Service Unavailable"
            });
            return;
        }

        const response = await fetched.json();
        setServerRequestStatus(response)
    }
}

const degrees = [
    "ثانوية",
    "دبلوم",
    "بكالوريوس",
    "دراسات عليا"
]

const maritalStatus = {
    unMarried: "أعزب/عزباء",
    married: "متزوج/ة",
    other: "غير ذلك"
}

function getCities() {
    const options = [];
    for (const city of cities) {
        options.push(
            <option key={city.en} value={city.ar}>{city.ar}</option>
        )
    }
    return options
}

function getCountries() {
    const options = [];
    for (const country of countries) {
        options.push(
            <option key={country.en} value={country.ar}>{country.ar}</option>
        )
    }
    return options
}

function getDegrees() {
    const degreeOptions = [];
    for (const id in degrees) {
        degreeOptions.push(
            <option key={id} value={degrees[id]}>{degrees[id]}</option>
        )
    }
    return degreeOptions;
}

function getMaritalStatus() {
    const maritalStatusOptions = [];
    for (const [key, value] of Object.entries(maritalStatus)) {
        maritalStatusOptions.push(
            <option key={key} value={value}>{value}</option>
        )
    }
    return maritalStatusOptions;
}

function getMaritalComponent(selectedMarital, formErrorsArray) {
    if (selectedMarital !== 3) return;

    return (
        <>
            <label htmlFor="marital-status-other">الحالة الإجتماعية</label>
            <div className='tooltip-container'>
            <input type="text" name="maritalStatusOther" id="marital-status-other" placeholder="يرجى كتابة حالتك الإجتماعية" />
                {getErrorForm("marital-status-other", formErrorsArray, "tooltip-below")}
            </div>
        </>
    );
}

function getDegreeComponent(selectedDegree, formErrorsArray) {
    if (selectedDegree === 0)
        return;
    else if (selectedDegree === 1) {
        return (
            <div className="form-block">
                <label htmlFor="gpa">المعدل التراكمي</label>
                <div className='tooltip-container'>
                    <input type="text" name="gpa" id="gpa" placeholder="المعدل التراكمي من 100%" />
                    {getErrorForm("gpa", formErrorsArray, "tooltip-below")}
                </div>
            </div>
        )
    } else {
        return (
            <div className="form-block">
                <div className='tooltip-container'>
                    <label htmlFor="field">التخصص</label>
                    {getErrorForm("field", formErrorsArray)}
                </div>
                <input type="text" name="field" id="field" placeholder="التخصص الجامعي" />
            </div>
        )
    }
}

function addItem(event, courses, setCourses) {
    if (courses.isAdding) return;

    const newCourses = { isAdding: true, list: courses.list };
    setCourses(newCourses);
}

function cancelItem(event, courses, setCourses) {
    const newCourses = { isAdding: false, list: courses.list };
    setCourses(newCourses)
}

async function deleteItem(event, courses, setCourses) {
    const mainParent = this.parentElement.parentElement.parentElement;
    const courseId = mainParent.dataset.id;
    if (typeof courseId !== "string") return;
    event.srcElement.disabled = true;
    await wait(150);
    event.srcElement.disabled = false;

    const newCourses = { isAdding: courses.isAdding, list: courses.list }
    newCourses.list.splice(courseId, 1);
    setCourses(newCourses);
}

async function saveCourseItem(event, courses, setCourses, setFormErrors) {
    const formErrors = validateForm(".course-inputs");
    if (formErrors.length > 0) {
        let inputParent = document.getElementById(formErrors[0].id).parentElement;
        if (inputParent.classList.contains("tooltip-container")) {
            inputParent = inputParent.parentElement;
        }
        inputParent.scrollIntoView({behavior: 'smooth', block: 'center'})
        await wait(250);
        setFormErrors(formErrors);
        return;
    };

    const courseName = document.getElementById("course-name").value;
    const courseCertificate = document.getElementById("course-certificate").files[0];

    const newCourses = { isAdding: false, list: courses.list };
    newCourses.list.push({ name: courseName, file: courseCertificate })
    setCourses(newCourses)
}

async function saveExperienceItem(event, experiences, setExperiences, setFormErrors) {
    const formErrors = validateForm(".experience-inputs");
    if (formErrors.length > 0) {
        let inputParent = document.getElementById(formErrors[0].id).parentElement;
        if (inputParent.classList.contains("tooltip-container")) {
            inputParent = inputParent.parentElement;
        }
        inputParent.scrollIntoView({behavior: 'smooth', block: 'center'})
        await wait(250);
        setFormErrors(formErrors);
        return;
    };

    const experienceEmployer = document.getElementById("experience-employer");
    const experienceTitle = document.getElementById("experience-title");
    const experienceYears = document.getElementById("experience-years");
    const experienceQuit = document.getElementById("experience-quit");
    const experienceSalary = document.getElementById("experience-salary");
    const salaryNumber = parseInt(experienceSalary.value);
    const isRealNumber = isFinite(salaryNumber) && !isNaN(salaryNumber);

    const newExperiences = { isAdding: false, list: experiences.list };
    newExperiences.list.push({
        employer: experienceEmployer.value,
        title: experienceTitle.value,
        years: experienceYears.value,
        quit: experienceQuit.value,
        salary:  isRealNumber? salaryNumber : null
    })
    setExperiences(newExperiences)
}

function getCoursesComponents(courses, formErrorsArray) {
    let components;

    if (courses.isAdding) {
        components =
            <>
                <div className="form-block tight">
                    <div className='tooltip-container'>
                        <label htmlFor="course-name">إسم الدورة</label>
                        {getErrorForm("course-name", formErrorsArray)}
                    </div>
                    <input type="text" name="courseName" id="course-name" />
                </div>

                <div className="form-block tight">
                    <label htmlFor="course-certificate">شهادة الدورة</label>
                    <div className='tooltip-container'>
                        <input type="file" name="courseCertificate" id="course-certificate" accept='.png, .jpeg, .jpg, .pdf' />
                        {getErrorForm("course-certificate", formErrorsArray, "tooltip-below")}
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "center" }}>
                    <button className='form-button course-save-btn' type="button">
                        <span>حفظ</span>
                    </button>
                    <button className='form-button course-cancel-btn' type="button">
                        <span>إلغاء</span>
                    </button>
                </div>
            </>
    } else {
        components = [];
        courses.list.map((course, id) => {
            components.push(
                <div className='course-item' key={course.name} data-id={id}>
                    <div className='item-info'>
                        <div className='item-info-line'>
                            <b>إسم الدورة: </b>
                            <p>{course.name}</p>
                        </div>
                        <div className='item-info-line'>
                            <b>المرفق: </b>
                            <p>{course.file?.name || "لايوجد"}</p>
                        </div>
                    </div>

                    <div className='controls'>
                        <div className='delete-item'>
                            <button className='delete-item-btn' type='button' style={{backgroundImage: `url(${deleteIcon})`}}></button>
                        </div>
                    </div>
                </div>
            )
            return null;
        })
    }
    return components;
}

function getExperienceComponents(experiences, formErrorsArray) {
    let components;

    if (experiences.isAdding) {
        components =
            <div className='experience-inputs'>
                <div className="form-block tight">
                    <div className='tooltip-container'>
                        <label htmlFor="experience-employer">جهة العمل</label>
                        {getErrorForm("experience-employer", formErrorsArray)}
                    </div>
                    <input type="text" name="experienceEmployer" id="experience-employer" />
                </div>

                <div className="form-block tight">
                    <div className='tooltip-container'>
                        <label htmlFor="experience-title">المسمى الوظيفي</label>
                        {getErrorForm("experience-title", formErrorsArray)}
                    </div>
                    <input type="text" name="experienceTitle" id="experience-title" />
                </div>

                <div className="form-block tight">
                    <div className='tooltip-container'>
                        <label htmlFor="experience-years">سنوات الخدمة</label>
                        {getErrorForm("experience-years", formErrorsArray)}
                    </div>
                    <input type="number" name="experienceYears" id="experience-years" />
                </div>


                <div className="form-block tight">
                    <label htmlFor="experience-quit">سبب ترك العمل</label>
                    <div className='tooltip-container'>
                        <input type="text" name="experienceQuit" id="experience-quit" />
                        {getErrorForm("experience-quit", formErrorsArray, "tooltip-below")}
                    </div>
                </div>


                <div className="form-block tight">
                    <div className='tooltip-container'>
                        <label htmlFor="experience-salary">الراتب</label>
                        {getErrorForm("experience-salary", formErrorsArray)}
                    </div>
                    <input type="number" name="experienceSalary" id="experience-salary" min={0} max={999999} />
                </div>


                <div style={{ display: "flex", justifyContent: "center" }}>
                    <button className='form-button experience-save-btn' type="button">
                        <span>حفظ</span>
                    </button>
                    <button className='form-button experience-cancel-btn' type="button">
                        <span>إلغاء</span>
                    </button>
                </div>
            </div>
    } else {
        const expertiseCertificate = experiences.list.length > 0 &&
            <div className="form-block" key={"experience-certificate"}>
                <label htmlFor="experience-certificate">شهادة التأمينات</label>
                <div className='tooltip-container'>
                    <input type="file" name="expertiseCertificate" id="experience-certificate" accept='.png, .jpeg, .jpg, .pdf' />
                    {getErrorForm("experience-certificate", formErrorsArray, "tooltip-below")}
                </div>
            </div>
            ;

        components =
            <>
                <div className="form-block">
                    {
                        experiences.list.map((experience, id) => {
                            const salaryLine =
                            experience.salary?
                                <div className='item-info-line'>
                                    <b>الراتب: </b>
                                    <p>{experience.salary.toLocaleString("en-us")}</p>
                                </div>
                            : null;

                            return (
                                <div className='experience-item' key={id} data-id={id}>
                                    <div className='item-info'>
                                        <div className='item-info-line'>
                                            <b>جهة العمل: </b>
                                            <p>{experience.employer}</p>
                                        </div>

                                        <div className='item-info-line'>
                                            <b>المسمى الوظيفي: </b>
                                            <p>{experience.title}</p>
                                        </div>

                                        <div className='item-info-line'>
                                            <b>سنوات الخدمة: </b>
                                            <p>{experience.years}</p>
                                        </div>

                                        <div className='item-info-line'>
                                            <b>سبب ترك العمل: </b>
                                            <p>{experience.quit}</p>
                                        </div>

                                        {salaryLine}
                                    </div>

                                    <div className='controls'>
                                        <div className='delete-item'>
                                            <button className='delete-item-btn' type='button' style={{backgroundImage: `url(${deleteIcon})`}}></button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>

                {expertiseCertificate}
            </>
    }
    return components;
}


function getErrorForm(inputId, formErrorsArray = [], errorType = "tooltip-right") {
    /*
        errorType can be one of the two:
        • tooltip-right
        • tooltip-below

        Note: each one must be in specific circumstances
     */

    const errorInfo = formErrorsArray.find((error) => {
        return error.id === inputId;
    })
    let errorForm;
    if (errorInfo) {
        errorForm =
        <aside className={`s-tooltip ${errorType}`}>{errorInfo.reason}</aside>
    }

    return errorForm;
}

function getRateOptions() {
    const options = [];
    for (let rate = 1; rate <= 10; rate++) {
        options.push(
            <option value={rate} key={rate}>{rate}</option>
        )
    }
    return options;
}

const responseMessages = {
    "201": {
        message: "لقد تم إرسال طلبك بنجاح، رقم الطلب هو: {submissionId}.\nسنرسل لك رسالة في الواتس اب في حال قبولك.",
        className: "alert-green"
    },
    "208": {
        message: "لقد قمت بالفعل بالتقديم على هذه الوظيفة مسبقًا\nورقم تقديمك هو: {submissionId}",
        className: ""
    },
    "400": {
        message: "يرجى التأكد من ملئ النموذج بشكلٍ صحيح",
        className: "alert-orange"
    },
    "404": {
        message: "لايمكنك التقديم على هذه الوظيفة لأنها مغلقة",
        className: "alert-orange"
    },
    "429": {
        message: "أنت تقوم بطلبات كثيرة جدًا، يرجى الإنتظار لوهلة قبل إجراء طلب آخر.",
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

function getServerRequestStatus(serverRequestStatus) {
    if (typeof serverRequestStatus === "object") {
        let className;
        let message;

        const code = serverRequestStatus.code
        const failureSettings = responseMessages[code];
        if (failureSettings) {
            className = failureSettings.className;
            if (code === 201) message = failureSettings.message.replace("{submissionId}", serverRequestStatus.submissionId);
            else if (code === 208) message = failureSettings.message.replace("{submissionId}", serverRequestStatus.submissionId);
            else message = failureSettings.message;
        } else {
            className = "alert-red";
            message = "لايمكن تنفيذ طلبك حاليًا، يرجى المحاولة لاحقًا"
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

function getApplyJobBg(job) {
    return job.isClosed ? null : (
        <div className='apply-job-bg'>
            <p>
                قم بالتقدم للوظيفة
            </p>
            <button className='apply-job-btn' onClick={(() => {
                document.querySelector(".application-section").scrollIntoView({behavior: "smooth", block: "start"})
            })}>
                تقدم للوظيفة
            </button>
        </div>
    )
}

function getApplicationSection(job, args) {
    return job.isClosed ? null : (
        <aside className='application-section'>
            <form id="form" method="POST" encType="multipart/form-data" style={{ direction: "rtl" }}>
                <section className='form-section'>
                    <h3>
                        البيانات الشخصية
                    </h3>
                    <div className="form-block">
                        <div className='tooltip-container'>
                            <label htmlFor="name">الإسم</label>
                            {getErrorForm("name", args.formErrors.array)}
                        </div>
                        <input type="text" name="name" id="name" placeholder="الإسم الرباعي" />
                    </div>

                    <div className="form-block">
                        <div className='tooltip-container' >
                            <p id='sex'>الجنس</p>
                            {getErrorForm("sex", args.formErrors.array)}
                        </div>

                        <div className='radio-choice'>
                            <input type="radio" name="sex" id="male" value={'ذكر'} />
                            <label htmlFor="male">ذكر</label>
                        </div>

                        <div className='radio-choice'>
                            <input type="radio" name="sex" id="female" value={'أنثى'} />
                            <label htmlFor="female">أنثى</label>
                        </div>
                    </div>

                    <div className="form-block">
                        <label htmlFor="id-number">رقم الهوية/الإقامة</label>

                        <div className='tooltip-container'>
                            <input type="number" name="idNumber" id="id-number"/>
                            {getErrorForm("id-number", args.formErrors.array, "tooltip-below")}
                        </div>
                    </div>

                    <div className="form-block">
                            <label htmlFor="birthDate">تاريخ الميلاد</label>
                        <div className='tooltip-container'>
                            <input type="date" name="birthDate" id="birthDate" />
                            {getErrorForm("birthDate", args.formErrors.array, "tooltip-below")}
                        </div>
                    </div>

                    <div className="form-block">
                        <label htmlFor="marital-status">الحالة الإجتماعية</label>
                        <div className='tooltip-container'>
                            <select name="maritalStatus" id="marital-status" defaultValue={"default"}>
                                <option value="default" disabled>يرجى الإختيار</option>
                                {getMaritalStatus()}
                            </select>
                            {getErrorForm("marital-status", args.formErrors.array, "tooltip-below")}
                        </div>
                        {getMaritalComponent(args.selectedMarital, args.formErrors.array)}
                    </div>

                    <div className="form-block">
                        <div className='tooltip-container'>
                            <label htmlFor="nationality">الجنسية</label>
                            {getErrorForm("nationality", args.formErrors.array)}
                        </div>
                        <select name="nationality" id="nationality" defaultValue={"default"}>
                            <option value="default" disabled>يرجى الإختيار</option>
                            {getCountries()}
                        </select>
                    </div>

                    <div className="form-block">
                        <label htmlFor="phone">رقم الجوال</label>
                        <div className='tooltip-container'>
                            <input type="tel" name="phone" id="phone" placeholder='مثال: 05xxxxxxxx' />
                            {getErrorForm("phone", args.formErrors.array, "tooltip-below")}
                        </div>
                    </div>

                    <div className="form-block">
                        <div className='tooltip-container'>
                            <label htmlFor="city">المدينة</label>
                            {getErrorForm("city", args.formErrors.array)}
                        </div>
                        <select name="city" id="city" defaultValue={"default"}>
                            <option value="default" disabled>يرجى الإختيار</option>
                            {getCities()}
                        </select>
                    </div>

                    <div className="form-block">
                        <div className='tooltip-container'>
                            <label htmlFor="address">العنوان</label>
                            {getErrorForm("address", args.formErrors.array)}
                        </div>
                        <input type="text" name="address" id="address" placeholder="العنوان" />
                    </div>

                    <div className="form-block">
                        <label htmlFor="email">البريد الإلكتروني</label>
                        <div className='tooltip-container'>
                            <input type="email" name="email" id="email" placeholder="example@shubra.com" />
                            {getErrorForm("email", args.formErrors.array, "tooltip-below")}
                        </div>
                    </div>

                    <div className="form-block">
                        <label htmlFor="cv">السيرة الذاتية</label>
                        <div className='tooltip-container'>
                            <input type="file" name="cv" id="cv" placeholder="أدخل سيرتك الذاتية" accept='.png, .jpeg, .jpg, .pdf' />
                            {getErrorForm("cv", args.formErrors.array, "tooltip-below")}
                        </div>
                    </div>
                </section>

                <section className='form-section'>
                    <h3>المؤهل العلمي</h3>

                    <div className="form-block">
                        <label htmlFor="degree">الشهادة الحاصل عليها</label>
                        <div className='tooltip-container'>
                            <select name="degree" id="degree" defaultValue={"default"}>
                                <option value="default" disabled>يرجى الإختيار</option>
                                {getDegrees()}
                            </select>
                            {getErrorForm("degree", args.formErrors.array, "tooltip-below")}
                        </div>
                    </div>
                    {getDegreeComponent(args.selectedDegree, args.formErrors.array)}

                    <div className="form-block">
                        <div className='tooltip-container'>
                            <label htmlFor="graduate-date">سنة التخرج</label>
                            {getErrorForm("graduate-date", args.formErrors.array)}
                        </div>
                        <input type="number" name="graduateDate" id="graduate-date" step="1" placeholder="سنة التخرج" />
                    </div>

                    <div className="form-block">
                        <label htmlFor="certificate">صورة الشهادة</label>
                        <div className='tooltip-container'>
                            <input type="file" name="certificate" id="certificate" placeholder="رفع ملف أو صورة الشهادة" accept='.png, .jpeg, .jpg, .pdf' />
                            {getErrorForm("certificate", args.formErrors.array, "tooltip-below")}
                        </div>
                    </div>
                </section>

                <section className='form-section'>
                    <div>
                        <h3>الدورات التدريبية</h3>
                        <span className='add-item'>
                            <button className='add-item-btn' type='button' onClick={
                                function (e) {
                                    addItem.call(this, e, args.courses, args.setCourses)
                                }
                            } style={{backgroundImage: `url(${addIcon})`}}></button>
                        </span>
                    </div>

                    <div className="form-block course-inputs">
                        {getCoursesComponents(args.courses, args.formErrors.array)}
                    </div>
                </section>

                <section className='form-section'>
                    <div>
                        <h3>الخبرة السابقة</h3>
                        <span className='add-item'>
                            <button className='add-item-btn' type='button' onClick={
                                function (e) {
                                    addItem.call(this, e, args.experiences, args.setExperiences)
                                }
                            } style={{backgroundImage: `url(${addIcon})`}}></button>
                        </span>
                    </div>
                    {getExperienceComponents(args.experiences, args.formErrors.array)}
                </section>

                <section className='form-section'>
                    <h3>بتقييم من 0 إلى 10 حيث أن 10 تعني ممتاز جدًا و 0 تعني سيء جدًا</h3>

                    <div className="form-block">
                        <label htmlFor="computer-rate">كم تقيم نفسك في إستعمال الحاسب الآلي</label>
                        <div className='tooltip-container'>
                            <select name="computerRate" id="computer-rate" defaultValue={"default"}>
                                <option value="default" disabled>يرجى الإختيار</option>
                                {getRateOptions()}
                            </select>
                            {getErrorForm("computer-rate", args.formErrors.array, "tooltip-below")}
                        </div>
                    </div>

                    <div className="form-block">
                        <label htmlFor="english-rate">كم تقيم نفسك في اللغة الإنجليزية</label>
                        <div className='tooltip-container'>
                            <select name="englishRate" id="english-rate" defaultValue={"default"}>
                                <option value="default" disabled>يرجى الإختيار</option>
                                {getRateOptions()}
                            </select>
                            {getErrorForm("english-rate", args.formErrors.array, "tooltip-below")}
                        </div>
                    </div>

                    <div className="form-block">
                        <label htmlFor="flexibility-rate">كم تقيم نفسك في المرونة في العمل</label>
                        <div className='tooltip-container'>
                            <select name="flexibilityRate" id="flexibility-rate" defaultValue={"default"}>
                                <option value="default" disabled>يرجى الإختيار</option>
                                {getRateOptions()}
                            </select>
                            {getErrorForm("flexibility-rate", args.formErrors.array, "tooltip-below")}
                        </div>
                    </div>

                    <div className="form-block">
                        <div className='tooltip-container'>
                            <label htmlFor="self-talk">تكلم عن نفسك</label>
                            {getErrorForm("self-talk", args.formErrors.array)}
                        </div>
                        <textarea name='selfTalk' id='self-talk'></textarea>
                    </div>
                </section>

                <div className="form-block">
                    {getSubmitButton(job)}

                    {getServerRequestStatus(args.serverRequestStatus)}
                </div>

            </form>
        </aside>
    )
}

export function Job() {
    const [selectedMarital, setSelectedMarital] = useState(false);
    const [selectedDegree, setSelectedDegree] = useState(false);
    const [courses, setCourses] = useState({ isAdding: false, list: [] });
    const [experiences, setExperiences] = useState({ isAdding: false, list: [] });
    const formErrors = useArray([]);
    const [serverRequestStatus, setServerRequestStatus] = useState(false);
    const hasFetched = useRef(false)
    const [job, setJob] = useState(false);
    if (!job) {
        setJob({
            id: 0,
            title: "Loading ...",
            description: "Loading ...",
            icon: "Loading ...",
            responsibilities: "Loading ...",
            qualifications: "Loading ...",
            isClosed: true,
            isLoading: true
        })
    }

    useEffect(() => {
        if (!hasFetched.current) {
            const params = new Proxy(new URLSearchParams(window.location.search), {
                get: (searchParams, prop) => searchParams.get(prop),
            });
            if (typeof params.id !== "string") {
                window.location.replace("/")
                return;
            };

            fetchJobDetails(params.id, setJob)
            hasFetched.current = true;
        }

        if (!job.isClosed) {
            function onDegreeChange() {
                setSelectedDegree(this.selectedIndex)
            };

            const degree = document.getElementById("degree")
            degree.addEventListener("change", onDegreeChange)


            function onMaritalStatusChange() {
                setSelectedMarital(this.selectedIndex);
            };
            const maritalStatus = document.getElementById("marital-status")
            maritalStatus.addEventListener("change", onMaritalStatusChange)


            const spinner = document.querySelector(".loading-spinner-button");
            spinner.style.display = "none";
            return () => {
                degree.removeEventListener("change", onDegreeChange)
                maritalStatus.removeEventListener("change", onMaritalStatusChange)
            }
        }
    }, [job])

    useEffect(() => {
        if (courses.isAdding) {
            function doCancelCourse(e) {
                cancelItem.call(this, e, courses, setCourses)
            }

            const cancelCourseButton = document.querySelector(".course-cancel-btn");
            cancelCourseButton.addEventListener("click", doCancelCourse)

            return () => {
                cancelCourseButton.removeEventListener("click", doCancelCourse)
            }
        } else {
            if (!job.isClosed) {
                const deleteButtons = document.querySelectorAll(".course-item .delete-item-btn");
                function doDeleteCourse(e) {
                    deleteItem.call(this, e, courses, setCourses);
                }

                for (const button of deleteButtons) {
                    button.addEventListener("click", doDeleteCourse)
                }

                return () => {
                    for (const button of deleteButtons) {
                        button.removeEventListener("click", doDeleteCourse)
                    }
                }
            }
        }
    }, [courses, job])

    useEffect(() => {
        if (experiences.isAdding) {
            function doCancelExperience(e) {
                cancelItem.call(this, e, experiences, setExperiences)
            }

            const cancelExperienceButton = document.querySelector(".experience-cancel-btn");
            cancelExperienceButton.addEventListener("click", doCancelExperience)

            return () => {
                cancelExperienceButton.removeEventListener("click", doCancelExperience)
            }
        } else {
            if (!job.isClosed){
                const deleteButtons = document.querySelectorAll(".experience-item .delete-item-btn");
                function doDeleteExperience(e) {
                    deleteItem.call(this, e, experiences, setExperiences);
                }

                for (const button of deleteButtons) {
                    button.addEventListener("click", doDeleteExperience)
                }

                return () => {
                    for (const button of deleteButtons) {
                        button.removeEventListener("click", doDeleteExperience)
                    }
                }
            }
        }
    }, [experiences, job])

    useEffect(() => {
        if (!job.isClosed) {
            function doFormSubmit(e) {
                onFormSubmit.call(this, e, courses, experiences, formErrors.set, setServerRequestStatus, job)
            };
            const form = document.getElementById("form")
            form.addEventListener("submit", doFormSubmit);

            let saveCourseButton;
            let doSaveCourse;
            if (courses.isAdding) {
                saveCourseButton = document.querySelector(".course-save-btn");
                doSaveCourse = function(e) {
                    saveCourseItem.call(this, e, courses, setCourses, formErrors.set)
                }
                saveCourseButton.addEventListener("click", doSaveCourse)
            }

            let saveExperienceButton;
            let doSaveExperience;
            if (experiences.isAdding) {
                saveExperienceButton = document.querySelector(".experience-save-btn");
                doSaveExperience = function(e) {
                    saveExperienceItem.call(this, e, experiences, setExperiences, formErrors.set)
                }
                saveExperienceButton.addEventListener("click", doSaveExperience)
            }

            return () => {
                form.removeEventListener("submit", doFormSubmit)

                if (courses.isAdding) {
                    saveCourseButton.removeEventListener("click", doSaveCourse)
                }

                if (experiences.isAdding) {
                    saveExperienceButton.removeEventListener("click", doSaveExperience)
                }
            }
        }
    }, [courses, experiences, formErrors, job])

    return (
        <div className='JOB'>
            <main>
                <section className='introduction'>
                    <div className='job-info'>
                        <div className='job-info-top'>
                            <img src={job.icon} alt='أيقونة الوظيفة' />
                            <h1>
                                {job.title}
                            </h1>
                        </div>
                        <div className='job-info-middle'>
                            <p>
                                {job.description}
                            </p>
                        </div>

                        <div className='job-info-bottom'>
                            <p className='job-status'>
                                حالة الوظيفة: <span className={`job-status-${(job.isClosed && "closed") || "opened"}`}>{(job.isClosed && "مغلق") || "مفتوح"}</span>
                            </p>
                        </div>
                    </div>

                    {getApplyJobBg(job)}
                </section>

                <section className='job-details'>
                    <ol className='details-list'>
                        <li>
                            <h3>المهام والمسؤوليات</h3>
                            <pre>
                               {job.responsibilities}
                            </pre>
                        </li>

                        <li>
                            <h3>المهارات والمؤهلات</h3>
                            <pre>
                               {job.qualifications}
                            </pre>
                        </li>
                    </ol>
                </section>
            </main>

            {getApplicationSection(job, {selectedMarital, selectedDegree, courses, setCourses, experiences, setExperiences, formErrors, serverRequestStatus})}
        </div>
    )
}

function getSubmitButton(job) {
    if (!job || job.isLoading) {
        return (
            <button id='submitBtn' className='form-button' type="submit" disabled>
                <span>تقديم</span>
                <span className="loading-spinner-button" role="status" aria-hidden="true"></span>
            </button>
        )
    } else {
        return (
            <button id='submitBtn' className='form-button' type="submit">
                <span>تقديم</span>
                <span className="loading-spinner-button" role="status" aria-hidden="true"></span>
            </button>
        )
    }
}

async function fetchJobDetails(id, setJob) {
    let fetchResult;
    try {
        fetchResult = await fetch(`${api}/jobs/${id}`, {
            method: "GET"
        })
    } catch (error) {
        console.error(error)
        window.location.replace("/");
        return;
    } finally{
        if (fetchResult && fetchResult.ok) {
            const jsonRes = await fetchResult.json();
            setJob(jsonRes.job);
        } else {
            window.location.replace("/");
        }
    }
}