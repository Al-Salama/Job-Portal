import React, { useEffect, useState } from 'react';
import './css/Job.css';
import deliveryIcon from './imgs/delivery.svg';
import cities from '../data/cities'
import countries from '../data/countries'

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

async function onFormSubmit(e, courses, experience) {
    e.preventDefault();
    e.stopPropagation();

    const form = document.getElementById("form");
    const formData = new FormData(form);

    const selectedDegree = formData.get("degree");
    if (selectedDegree === "default" || selectedDegree === null) {
        return;
    }
    formData.set("degree", degrees[selectedDegree]);

    const selectedMaritalStatus = formData.get("maritalStatus");
    if (selectedMaritalStatus === "default" || selectedMaritalStatus === null) {
        return;
    }
    {
        let currentMaritalStatus;
        if (selectedMaritalStatus === "2") {
            currentMaritalStatus = formData.get("maritalStatusOther");
            formData.delete("maritalStatusOther");
        } else {
            currentMaritalStatus = maritalStatus[selectedMaritalStatus]
        }
        formData.set("maritalStatus", currentMaritalStatus);
    }

    courses.list.map((course, index) => {
        formData.append(`courseName_${index}`, course.name);
        formData.append(`courseCertificate_${index}`, course.file);
        return null;
    })

    experience.list.map((experience, index) => {
        formData.append(`experienceEmployer_${index}`, experience.employer);
        formData.append(`experienceTitle_${index}`, experience.title);
        formData.append(`experienceYears_${index}`, experience.years);
        formData.append(`experienceQuit_${index}`, experience.quit);
        if (experience.salary) formData.append(`experienceSalary_${index}`, experience.salary);

        return null;
    })

    toggleAllInputs(true);
    document.querySelector(".application-spinner").style.display = "unset";
    try {
        const fetched = await fetch("https://api.alsalamah506.sa/jobs/apply", {
            method: "POST",
            redirect: 'manual',
            body: formData,
        })
        if (!fetched.ok) {
            alert('Unable to send your request')
            return;
        }

        const response = await fetched.json()
        console.log(response)
    } catch (error) {
        alert('Unable to send your request 2')
        console.error(error);
        return;
    } finally {
        toggleAllInputs(false);
        document.querySelector(".application-spinner").style.display = "none";
    }
}

function onDegreeSelect(setDegree) {
    if (this.value === "default") {
        setDegree(this.value);
    } else {
        setDegree(parseInt(this.value));
    }
}

function onMaritalStatusSelect(setMaritalStatus) {
    if (this.value === "default") {
        setMaritalStatus(this.value);
    } else {
        setMaritalStatus(parseInt(this.value));
    }
}

const degrees = [
    "ثانوية",
    "دبلوم",
    "بكالوريوس",
    "دراسات عليا"
]

const maritalStatus = [
    "أعزب/عزباء",
    "متزوج/ة",
    "غير ذلك"
]

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
            <option key={id} value={id}>{degrees[id]}</option>
        )
    }
    return degreeOptions;
}

function getMaritalStatus() {
    const maritalStatusOptions = [];
    for (const id in maritalStatus) {
        maritalStatusOptions.push(
            <option key={id} value={id}>{maritalStatus[id]}</option>
        )
    }
    return maritalStatusOptions;
}

function getMaritalComponent(selectedMarital) {
    if (typeof selectedMarital !== "number" || selectedMarital < 2) return;

    return (
        <>
            <label htmlFor="marital-status-other">الحالة الإجتماعية</label>
            <input required type="text" name="maritalStatusOther" id="marital-status-other" placeholder="يرجى كتابة حالتك الإجتماعية" />
        </>
    );
}

function getDegreeComponent(selectedDegree) {
    let degreeComponent;
    if (typeof selectedDegree === "number") {
        if (selectedDegree === 0) {
            degreeComponent =
                <div className="form-block">
                    <label htmlFor="gpa">المعدل التراكمي</label>
                    <input required type="text" name="gpa" id="gpa" placeholder="المعدل التراكمي من 100%" />
                </div>
                ;
        } else {
            degreeComponent =
                <div className="form-block">
                    <label htmlFor="field">التخصص</label>
                    <input required type="text" name="field" id="field" placeholder="التخصص الجامعي" />
                </div>
                ;
        }
    }
    return degreeComponent;
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
    this.disabled = true;
    await wait(150);
    this.disabled = false;

    const newCourses = { isAdding: courses.isAdding, list: courses.list }
    newCourses.list.splice(courseId, 1);
    setCourses(newCourses);

    return true
}

function saveCourseItem(event, courses, setCourses) {
    const courseName = document.getElementById("course-name").value;
    const courseCertificate = document.getElementById("course-certificate").files[0];

    const newCourses = { isAdding: false, list: courses.list };
    newCourses.list.push({ name: courseName, file: courseCertificate })
    setCourses(newCourses)
}

function saveExperienceItem(event, experiences, setExperiences) {
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

function getCoursesComponents(courses) {
    let components;

    if (courses.isAdding) {
        components =
            <>
                <div className="form-block tight">
                    <label htmlFor="course-name">إسم الدورة</label>
                    <input required type="text" name="courseName" id="course-name" />
                </div>

                <div className="form-block tight">
                    <label htmlFor="course-certificate">شهادة الدورة</label>
                    <input type="file" name="courseCertificate" id="course-certificate" accept='.png, .jpeg, .jpg, .pdf' />
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
                            <p>{course.file.name}</p>
                        </div>
                    </div>

                    <div className='controls'>
                        <div className='delete-item'>
                            <button className='delete-item-btn' type='button'></button>
                        </div>
                    </div>
                </div>
            )
            return null;
        })
    }
    return components;
}

function getExperienceComponents(experiences) {
    let components;

    if (experiences.isAdding) {
        components =
            <>
                <div className="form-block tight">
                    <div className='tooltip-container'>
                        <label htmlFor="experience-employer">جهة العمل</label>
                    </div>
                    <input required type="text" name="experienceEmployer" id="experience-employer" />
                </div>

                <div className="form-block tight">
                    <div className='tooltip-container'>
                        <label htmlFor="experience-title">المسمى الوظيفي</label>
                    </div>
                    <input required type="text" name="experienceTitle" id="experience-title" />
                </div>

                <div className="form-block tight">
                    <div className='tooltip-container'>
                        <label htmlFor="experience-years">سنوات الخدمة</label>
                    </div>
                    <input required type="number" name="experienceYears" id="experience-years" />
                </div>


                <div className="form-block tight">
                    <div className='tooltip-container'>
                        <label htmlFor="experience-quit">سبب ترك العمل</label>
                    </div>
                    <input required type="text" name="experienceQuit" id="experience-quit" />
                </div>


                <div className="form-block tight">
                    <div className='tooltip-container'>
                        <label htmlFor="experience-salary">الراتب</label>
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
            </>
    } else {
        const expertiseCertificate = experiences.list.length > 0 &&
            <div className="form-block" key={"experience-certificate"}>
                <label htmlFor="experience-certificate">شهادة التأمينات</label>
                <input required type="file" name="expertiseCertificate" id="experience-certificate" accept='.png, .jpeg, .jpg, .pdf' />
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
                                            <button className='delete-item-btn' type='button'></button>
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

export function Job() {
    const [selectedMarital, setSelectedMarital] = useState(false);
    const [selectedDegree, setSelectedDegree] = useState(false);
    const [courses, setCourses] = useState({ isAdding: false, list: [] });
    const [experiences, setExperiences] = useState({ isAdding: false, list: [] });

    useEffect(() => {
        function onDegreeChange() {
            onDegreeSelect.call(this, setSelectedDegree)
        };
        const degree = document.getElementById("degree")
        degree.addEventListener("change", onDegreeChange)


        function onMaritalStatusChange() {
            onMaritalStatusSelect.call(this, setSelectedMarital)
        };
        const maritalStatus = document.getElementById("marital-status")
        maritalStatus.addEventListener("change", onMaritalStatusChange)


        const spinner = document.querySelector(".application-spinner");
        spinner.style.display = "none";

        return () => {
            degree.removeEventListener("change", onDegreeChange)
            maritalStatus.removeEventListener("change", onMaritalStatusChange)
        }
    }, [])

    useEffect(() => {
        if (courses.isAdding) {
            function doSaveCourse(e) {
                saveCourseItem.call(this, e, courses, setCourses)
            }

            function doCancelCourse(e) {
                cancelItem.call(this, e, courses, setCourses)
            }

            const saveCourseButton = document.querySelector(".course-save-btn");
            const cancelCourseButton = document.querySelector(".course-cancel-btn");
            saveCourseButton.addEventListener("click", doSaveCourse)
            cancelCourseButton.addEventListener("click", doCancelCourse)

            return () => {
                saveCourseButton.removeEventListener("click", doSaveCourse)
                cancelCourseButton.removeEventListener("click", doCancelCourse)
            }
        } else {
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
    }, [courses])

    useEffect(() => {
        if (experiences.isAdding) {
            function doSaveExperience(e) {
                saveExperienceItem.call(this, e, experiences, setExperiences)
            }

            function doCancelExperience(e) {
                cancelItem.call(this, e, experiences, setExperiences)
            }

            const saveExperienceButton = document.querySelector(".experience-save-btn");
            const cancelExperienceButton = document.querySelector(".experience-cancel-btn");
            saveExperienceButton.addEventListener("click", doSaveExperience)
            cancelExperienceButton.addEventListener("click", doCancelExperience)

            return () => {
                saveExperienceButton.removeEventListener("click", doSaveExperience)
                cancelExperienceButton.removeEventListener("click", doCancelExperience)
            }
        } else {
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
    }, [experiences])

    useEffect(() => {
        function doFormSubmit(e) {
            onFormSubmit.call(this, e, courses, experiences)
        };
        const form = document.getElementById("form")
        form.addEventListener("submit", doFormSubmit);

        return () => {
            form.removeEventListener("submit", doFormSubmit)
        }
    }, [courses, experiences])

    return (
        <>
            <main>
                <section className='introduction'>
                    <div className='job-info'>
                        <div className='job-info-top'>
                            <img src={deliveryIcon} alt='أيقونة الوظيفة' />
                            <h1>
                                موصل بضائع
                            </h1>
                        </div>
                        <div className='job-info-middle'>
                            <p>
                                يستلم مندوب التوصيل السلع والطلبات من المنشأة كما يحصل على توجيهات مكان التوصيل وملاحظات العميل، ثم ينطلق ليوصلها إلى من طلبها
                            </p>
                        </div>

                        <div className='job-info-bottom'>
                            <p className='job-status'>
                                حالة الوظيفة: <span className='job-status-closed'>مغلق</span>
                            </p>
                            <p className='job-status'>
                                حالة الوظيفة: <span className='job-status-opened'>مفتوح</span>
                            </p>
                        </div>
                    </div>

                    <div className='apply-job-bg'>
                        <p>
                            قم بالتقدم للوظيفة
                        </p>
                        <button className='apply-job-btn'>
                            تقدم للوظيفة
                        </button>
                    </div>
                </section>

                <section className='job-details'>
                    <ol className='details-list'>
                        <li>
                            <h3>المهام والمسؤوليات</h3>
                            <p>
                                • اتخاذ القرارات بخصوص إدارة المدن، والقرى، والبلدات،  والأرياف
                                <br />
                                • العمل من أجل تحقيق التوازن في الأحياء السكنية وتحسين المستوى المعيشي عن طريق إجراء التحديثات والتطويرات المناسبة•
                                <br />
                                • تحليل البيانات
                                <br />
                                • تطوير الوعي البيئي
                                <br />
                                • تصميم المخططات والخرائط
                                <br />
                                • إيجاد حلول وخطط إبداعية تصلح لجميع أجزاء المدن
                                <br />
                                • التشاور والتفاوض مع الجهات والأشخاص المعنية، وقد يكون بعضهم من أرباب الحصص والمطورين الآخرين مثل المسَّاحين ومهندس العمارة
                                <br />
                                • تقييم تطبيق الخطط وتنفيذها والإشراف على النتائج
                                <br />
                                • الإلمام بالقوانين المتعلقة باستخدام الأراضي والإطلاع عليها من حين لآخر
                                <br />
                                • عندما يبدأ المشروع، يبدأ مخططي المدن في العمل مع المسؤولين الحكوميين، وأعضاء مجتمع معتمدين على البحث العلمي، واستراتيجيات تحليل البيانات
                                <br />
                                • تقديم وعرض المشاريع للجهات المعنية
                                <br />
                                • القيام بالزيارات الميدانية للمدن وتفحصها
                                <br />
                                • مراجعة مخططات المواقع التي أعدها المطورين
                                <br />
                                • الاجتماع مع موظفي الحكومة والجهات المعنية والمطورين لمناقشة مشاريع التخطيط الحضري
                                <br />
                                • تعديل المخططات وإجراء بعض الاقتراحات عليها جمع وتحليل البيانات الاقتصادية والبيئية وإجراء الدراسات على سوق العمل
                            </p>
                        </li>

                        <li>
                            <h3>المهارات والمؤهلات</h3>
                            <p>
                                يُعد معظم مخططي المدن البارزين من حملة شهادة الماجستير، لكن هذا لا يعني عدم إمكانية العمل في المجال بشهادة البكالوريوس بل يعني الحاجة الملحة إلى اكتساب خبرة عمل واسعة خاصةً في التخطيط، والسياسة العامة، أو أي حقل علمي ذات صلة. فكل ما عليك هو أنْ تُحضِّر نفسك جيدًا، بادر باكتساب معرفة جيدة في بعض المجالات الهامة ذات الصلة مثل:
                                <br />
                                • الإدارة العامة
                                <br />
                                • الهندسة المعمارية
                                <br />
                                • هندسة المناظر الطبيعية
                                <br />
                                أما بالنسبة للدراسات العليا، يُمكن لحاملي شهادة البكالوريوس في تخصص الجغرافيا، أو الاقتصاد، أو العلوم السياسية، وعلم البيئة، أو هندسة العمارة.
                            </p>
                        </li>
                    </ol>
                </section>
            </main>

            <aside className='application-section'>
                <form id="form" action="https://api.alsalamah506.sa/jobs/apply" method="POST" encType="multipart/form-data" style={{ direction: "rtl" }}>


                    <section className='form-section'>
                        <h3>
                            البيانات الشخصية
                        </h3>
                        <div className="form-block">
                            <div className='tooltip-container'>
                                <label htmlFor="name">الإسم</label>
                            </div>
                            <input required type="text" name="name" id="name" placeholder="الإسم الرباعي" />
                        </div>

                        <div className="form-block">

                            <div className='tooltip-container' >
                                <p>الجنس</p>
                            </div>


                            <div className='radio-choice'>
                                <input required type="radio" name="sex" id="male" value={'ذكر'} />
                                <label htmlFor="male">ذكر</label>
                            </div>

                            <div className='radio-choice'>
                                <input required type="radio" name="sex" id="female" value={'أنثى'} />
                                <label htmlFor="female">أنثى</label>
                            </div>
                        </div>

                        <div className="form-block">
                            <div className='tooltip-container'>
                                <label htmlFor="id-number">رقم الهوية/الإقامة</label>
                            </div>

                            <input required type="number" name="idNumber" id="id-number"/>
                        </div>

                        <div className="form-block">
                            <div className='tooltip-container'>
                                <label htmlFor="birthDate">تاريخ الميلاد</label>
                            </div>
                            <input required type="date" name="birthDate" id="birthDate" />
                        </div>

                        <div className="form-block">
                            <div className='tooltip-container'>
                                <label htmlFor="marital-status">الحالة الإجتماعية</label>
                            </div>
                            <select name="maritalStatus" id="marital-status" defaultValue={"default"}>
                                <option value="default" disabled>يرجى الإختيار</option>
                                {getMaritalStatus()}
                            </select>

                            {getMaritalComponent(selectedMarital)}
                        </div>

                        <div className="form-block">
                            <div className='tooltip-container'>
                                <label htmlFor="country">الجنسية</label>
                            </div>
                            <select name="nationality" id="country" defaultValue={"default"}>
                                <option value="default" disabled>يرجى الإختيار</option>
                                {getCountries()}
                            </select>
                        </div>

                        <div className="form-block">
                            <div className='tooltip-container'>
                                <label htmlFor="phone">رقم الجوال</label>
                            </div>
                            <input required type="tel" name="telephone" id="phone" placeholder='مثال: 05xxxxxxxx' />
                        </div>

                        <div className="form-block">
                            <div className='tooltip-container'>
                                <label htmlFor="city">المدينة</label>
                            </div>
                            <select name="city" id="city" defaultValue={"default"}>
                                <option value="default" disabled>يرجى الإختيار</option>
                                {getCities()}
                            </select>
                        </div>

                        <div className="form-block">
                            <div className='tooltip-container'>
                                <label htmlFor="address">العنوان</label>
                            </div>
                            <input required type="text" name="address" id="address" placeholder="العنوان" />
                        </div>

                        <div className="form-block">
                            <div className='tooltip-container'>
                                <label htmlFor="email">البريد الإلكتروني</label>
                            </div>
                            <input required type="email" name="email" id="email" placeholder="example@shubra.com" />
                        </div>

                        <div className="form-block">
                            <div className='tooltip-container'>
                                <label htmlFor="cv">السيرة الذاتية</label>
                            </div>
                            <input required type="file" name="cv" id="cv" placeholder="أدخل سيرتك الذاتية" accept='.png, .jpeg, .jpg, .pdf' />
                        </div>
                    </section>

                    <section className='form-section'>
                        <h3>المؤهل العلمي</h3>

                        <div className="form-block">
                            <div className='tooltip-container'>
                                <label htmlFor="degree">الشهادة الحاصل عليها</label>
                            </div>
                            <select name="degree" id="degree" defaultValue={"default"}>
                                <option value="default" disabled>يرجى الإختيار</option>
                                {getDegrees()}
                            </select>
                        </div>

                        {getDegreeComponent(selectedDegree)}

                        <div className="form-block">
                            <div className='tooltip-container'>
                                <label htmlFor="graduate-date">سنة التخرج</label>
                            </div>
                            <input required type="number" name="graduateDate" id="graduate-date" min="1900" max="2099" step="1" placeholder="سنة التخرج" />
                        </div>

                        <div className="form-block">
                            <div className='tooltip-container'>
                                <label htmlFor="certificate">صورة الشهادة</label>
                            </div>
                            <input required type="file" name="certificate" id="certificate" placeholder="رفع ملف أو صورة الشهادة" accept='.png, .jpeg, .jpg, .pdf' />
                        </div>

                    </section>

                    <section className='form-section'>
                        <div>
                            <h3>الدورات التدريبية</h3>
                            <span className='add-item'>
                                <button className='add-item-btn' type='button' onClick={
                                    function (e) {
                                        addItem.call(this, e, courses, setCourses)
                                    }
                                }></button>
                            </span>
                        </div>

                        <div className="form-block">
                            {getCoursesComponents(courses)}
                        </div>
                    </section>

                    <section className='form-section'>
                        <div>
                            <h3>الخبرة السابقة</h3>
                            <span className='add-item'>
                                <button className='add-item-btn' type='button' onClick={
                                    function (e) {
                                        addItem.call(this, e, experiences, setExperiences)
                                    }
                                }></button>
                            </span>
                        </div>

                        {getExperienceComponents(experiences)}
                    </section>

                    <div className="form-block">
                        <p className='uploading-progress'>
                            تقدم التحميل: 0%
                        </p>
                    </div>


                    <div className="form-block">
                        <button id='submitBtn' className='form-button' type="submit">
                            <span>تقديم</span>
                            <span class="application-spinner" role="status" aria-hidden="true"></span>
                        </button>
                    </div>

                </form>
            </aside>
        </>
    )
}