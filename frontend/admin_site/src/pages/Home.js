import React, { useEffect, useRef, useState } from "react";
import settings from "../data/settings";
import useArray from "../hooks/useArray";
import './css/Home.css'

function Home({ adminInfo }) {
    const [newSubmissions, setNewSubmissions] = useState();
    const [acceptedSubmissions, setAcceptedSubmissions] = useState();
    const [pendingSubmissions, setPendingSubmissions] = useState();
    const [rejectedSubmissions, setRejectedSubmissions] = useState();

    const applications = useArray(false);
    const fetched = useRef(false);

    useEffect(() => {
        if (fetched.current) return;
        fetched.current = true;

        fetchSubmissions({setNewSubmissions, setAcceptedSubmissions, setPendingSubmissions, setRejectedSubmissions, setApplications: applications.set});
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        if (!Array.isArray(applications.array)) return;

        const applicationsSelector = document.getElementById("applications-select");
        const selectedAppId = applications.array.findIndex(v => v.selected === true);
        console.log(selectedAppId)
        if (typeof selectedAppId == "number") {
            applicationsSelector.selectedIndex = selectedAppId;
        }

        function onApplicationSelectPreChange(event) {
            const numValue = parseInt(this.value)
            console.countReset("app seledct")
            console.count("app seledct")
            if (!isNumber(numValue)) {
                event.preventDefault();
                return;
            }
            console.count("app seledct")

            onApplicationSelectChange.call(this, event, numValue, {setNewSubmissions, setAcceptedSubmissions, setPendingSubmissions, setRejectedSubmissions, setApplications: applications.set});
        }
        applicationsSelector.addEventListener("change", onApplicationSelectPreChange)
        return () => {
            applicationsSelector.removeEventListener("change", onApplicationSelectPreChange)
        }
    }, [applications])
    useEffect(() => {
        if (!(newSubmissions && acceptedSubmissions && pendingSubmissions && rejectedSubmissions && Array.isArray(applications.array))) {
            return;
        }

        const categoryTabs = document.querySelectorAll(".category-tabs button");

        function onTabPreClick(event) {
            if (this.classList.contains("selected")) {
                event.preventDefault();
                return;
            }

            const loopSettings = [
                {getter: newSubmissions, setter: setNewSubmissions},
                {getter: acceptedSubmissions, setter: setAcceptedSubmissions},
                {getter: pendingSubmissions, setter: setPendingSubmissions},
                {getter: rejectedSubmissions, setter: setRejectedSubmissions}
            ]

            onTabClick.call(this, event, loopSettings);
        }

        for (const tab of categoryTabs) {
            tab.addEventListener("click", onTabPreClick);
        }

        // Pages handling..
        function onPageButtonPreClick(event) {
            console.count("select page")
            if (this.classList.contains("selected-page")) {
                event.preventDefault();
                return;
            }
            console.count("select page")
            const categories = {
                getters: [newSubmissions, acceptedSubmissions, pendingSubmissions, rejectedSubmissions],
                setters: [setNewSubmissions, setAcceptedSubmissions, setPendingSubmissions, setRejectedSubmissions]
            };
            onPageButtonClick.call(this, event, categories, applications.array);
        }

        const pagesButtons = document.querySelectorAll(".Home .page-selector button");
        for (const pageButton of pagesButtons) {
            pageButton.addEventListener("click", onPageButtonPreClick)
        }

        const submissionItems = document.querySelectorAll(".submissions tbody tr");
        for (const submission of submissionItems) {
            submission.addEventListener("click", onSubmissionClick)
        }

        return () => {
            for (const tab of categoryTabs) {
                tab.removeEventListener("click", onTabPreClick);
            }

            for (const pageButton of pagesButtons) {
                pageButton.removeEventListener("click", onPageButtonPreClick)
            }

            for (const submission of submissionItems) {
                submission.removeEventListener("click", onSubmissionClick)
            }
        }
    }, [newSubmissions, acceptedSubmissions, pendingSubmissions, rejectedSubmissions, applications.array])

    return (
        <div className="Home">
            <main>
                <section className="controls">
                    {getApplicationsSelect(applications.array)}
                </section>

                <section className="submissions-info">
                    {getSubmissionInfo({
                        applications: applications.array,
                        categories: [newSubmissions, acceptedSubmissions, pendingSubmissions, rejectedSubmissions]
                    })}
                </section>

                <section className="submissions-area">
                    <div className="category-tabs">
                        <button id="category-new" className={newSubmissions?.selected ? "selected" : null}>الجديدة</button>
                        <button id="category-accepted" className={acceptedSubmissions?.selected ? "selected" : null}>المقبولة</button>
                        <button id="category-pending" className={pendingSubmissions?.selected ? "selected" : null}>المعلقة</button>
                        <button id="category-rejected" className={rejectedSubmissions?.selected ? "selected" : null}>المرفوضة</button>
                    </div>

                    <div className="submission-field">
                        {getSelectedSubmissions([newSubmissions, acceptedSubmissions, pendingSubmissions, rejectedSubmissions])}
                    </div>
                </section>
                {
                    getPages({newSubmissions, acceptedSubmissions, pendingSubmissions, rejectedSubmissions})
                }
            </main>
        </div>
    )
}

/*
let selectedCategory;
let categoryName;
if (args.newSubmissions?.selected) {
    selectedCategory = args.newSubmissions;
    categoryName = "new";
} else if (args.acceptedSubmissions?.selected) {
    selectedCategory = args.acceptedSubmissions
    categoryName = "accepted"
} else if (args.pendingSubmissions?.selected) {
    selectedCategory = args.pendingSubmissions
    categoryName = "pending"
} else if (args.rejectedSubmissions?.selected) {
    selectedCategory = args.rejectedSubmissions
    categoryName = "rejected"
}
*/

function isNumber(num = Number.prototype) {
    return !Number.isNaN(num) && Number.isFinite(num);
}

function onSubmissionClick(event) {
    const submissionId = parseInt(this.dataset.id);
    if (!isNumber(submissionId)) {
        event.preventDefault();
        return;
    }

    window.location.href = `/submission?id=${submissionId}`
}

async function onApplicationSelectChange(event, applicationId = 1, states = {}){
    let fetchResult;
    const queries = [{key: "appId", value: applicationId}]
    const query = formatQueryString(queries);

    const url = `${settings.api}/submissions${query}`
    try {
        fetchResult = await fetch(url, {
            method: "GET",
            credentials: "include"
        });
    } catch (error) {
        console.error(error);
    } finally {
        if (fetchResult) {
            const response = await fetchResult.json();
            if (fetchResult.ok) {
                setQueryString(queries);

                states.setNewSubmissions({
                    ...response.submissions.new,
                    buttonId: "category-new"
                })
                states.setAcceptedSubmissions({
                    ...response.submissions.accepted,
                    buttonId: "category-accepted",
                })
                states.setPendingSubmissions({
                    ...response.submissions.pending,
                    buttonId: "category-pending",
                })
                states.setRejectedSubmissions({
                    ...response.submissions.rejected,
                    buttonId: "category-rejected",
                })

                response.applications = response.applications.map((val, ind) => {
                    const toDate = new Date();
                    toDate.setTime(Number(val.startDate))
                    return {
                        ...val,
                        startDate: toDate.toLocaleDateString("ar-US", {year: 'numeric', month: 'long', day: 'numeric' })
                    }
                })
                states.setApplications(response.applications)
            } else {
                if (fetchResult.status === 401) {
                    window.location.href = "/login"
                    return;
                }
                console.error("Error fetching submissions, error code:", fetchResult.status)
                console.error("Response:\n", response)
            }
        }
    }
}

async function onPageButtonClick(event, categories = [], applications = []) {
    const selectedApplication = applications.find(value => value.selected === true);
    const selectedCategory = categories.getters.findIndex(value => value.selected === true);
    const requestedPage = parseInt(this.dataset.pageNumber);
    if (!isNumber(requestedPage)) return;

    let fetchResult;
    const url = `${settings.api}/submissions/${selectedApplication.id}/${selectedCategory}/pages/${requestedPage}`
    try {
        fetchResult = await fetch(url, {
            method: "GET",
            credentials: "include"
        });
    } catch (error) {
        console.error(error);
    } finally {
        if (fetchResult) {
            const response = await fetchResult.json();
            if (fetchResult.ok) {
                categories.setters[selectedCategory]({
                    ...categories.getters[selectedCategory],
                    ...response.submissions
                })

                const params = new Proxy(new URLSearchParams(window.location.search), {
                    get: (searchParams, prop) => searchParams.get(prop),
                });

                const queriesList = [];
                if (params.appId) {
                    queriesList.push({key: "appId", value: selectedApplication.id});
                }
                if (params.category) {
                    queriesList.push({key: "category", value: selectedCategory});
                }
                if (requestedPage > 1) {
                    queriesList.push({key: "page", value: requestedPage});
                }
                setQueryString(queriesList);
            } else {
                if (fetchResult.status === 401) {
                    window.location.href = "/login"
                    return;
                }
                console.error("Error fetching submissions, error code:", fetchResult.status)
                console.error("Response:\n", response)
            }
        }
    }
}

function onTabClick(event, loopSettings) {
    let selectedTab
    let theState;
    for (const categoryId in loopSettings) {
        theState = loopSettings[categoryId];

        if (theState.getter?.buttonId === this.id) {
            this.classList.add("selected")
            selectedTab = categoryId;
            theState.setter({
                ...theState.getter,
                selected: true
            })
        } else if (theState.getter?.selected) {
            delete theState.getter.selected;
            theState.setter({
                ...theState.getter
            })
        }
    }

    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
    const appId = params.appId;

    const queriesList = [];
    if (appId) {
        queriesList.push({key: "appId", value: appId});
    }
    queriesList.push({key: "category", value: selectedTab});
    setQueryString(queriesList);
}

function getPages(args) {
    let selectedCategory;
    if (args.newSubmissions?.selected) {
        selectedCategory = args.newSubmissions;
    } else if (args.acceptedSubmissions?.selected) {
        selectedCategory = args.acceptedSubmissions
    } else if (args.pendingSubmissions?.selected) {
        selectedCategory = args.pendingSubmissions
    } else if (args.rejectedSubmissions?.selected) {
        selectedCategory = args.rejectedSubmissions
    }
    if (!selectedCategory) return;

    let prevPage =
        <button className="prev-page" data-page-number={selectedCategory.currentPage - 1} disabled={selectedCategory.currentPage <= 1}>
            السابق
        </button>
    ;
    let firstPage;
    if (selectedCategory.currentPage > 1) {
        prevPage =
            <button className="prev-page" data-page-number={selectedCategory.currentPage - 1}>
                السابق
            </button>
        ;

        firstPage =
            <button data-page-number="1">
                1
            </button>
        ;
    }

    let nextPage =
        <button className="next-page" data-page-number={selectedCategory.currentPage + 1} disabled={selectedCategory.currentPage >= selectedCategory.totalPages}>
            التالي
        </button>
    ;
    let lastPage;
    if (selectedCategory.currentPage < selectedCategory.totalPages) {
        lastPage =
            <button data-page-number={selectedCategory.totalPages}>
                {selectedCategory.totalPages}
            </button>
        ;
    }

    return (
        <section className="page-selector">
            {prevPage}
            {firstPage}
            <button data-page-number={selectedCategory.currentPage} className="selected-page">
                {selectedCategory.currentPage}
            </button>
            {lastPage}
            {nextPage}
        </section>
    )
}

function getSubmissionInfo(args) {
    const {applications, categories} = args;
    if (applications.length <= 0 || !categories[0] || !('rows' in categories[0])) {
        return null;
    }

    const submissionsCount = {
        total: applications.find(v => v.selected === true).totalSubmissions,
        selectedCategory: categories.find(v => v.selected === true).count
    }
    return (
        <>
            <div><p>
                <b>إجمالي عدد التقديمات:</b> {submissionsCount.total}
            </p></div>

            <div><p>
                <b>عدد التقديمات في القسم المحدد:</b> {submissionsCount.selectedCategory}
            </p></div>
        </>
    )
}

function getSelectedSubmissions(states) {
    let submissions;
    for (const categorySubmissions of states) {
        if (categorySubmissions && categorySubmissions.selected) {
            submissions = categorySubmissions.rows.map((value, index) => {
                return (
                    <tr key={index} data-id={value.id}>
                        <td>{value.id}</td>
                        <td className="spacing-cell"></td>
                        <td>{value.name}</td>
                        <td className="spacing-cell"></td>
                        <td>{value.id_number}</td>
                    </tr>
                )
            })
            break;
        }
    }

    return (
        <table className="submissions">
            <thead>
                <tr>
                    <th>الرقم</th>
                    <th className="spacing-cell"></th>
                    <th>الإسم</th>
                    <th className="spacing-cell"></th>
                    <th>رقم الهوية</th>
                </tr>
            </thead>
            <tbody>
                {submissions}
            </tbody>
        </table>
    );
}

function getApplicationsSelect(applications) {
    let options;
    let select;

    if (applications) {
        options = applications.map((value, index) => {
            return <option key={value.id} value={`${value.id}`}>{`${value.jobName} | ${value.startDate}${(value.closed && " [Closed]") || ""}`}</option>
        })
        select =
            <select id="applications-select">
                {options}
            </select>
    } else {
        select =
        <select id="applications-select" defaultValue={"default"}>
            <option value={"default"} disabled>Loading ...</option>
        </select>
    }
    return (
        <div>
            <label htmlFor="applications-select">قائمة التقديمات المسجلة</label>
            {select}
        </div>
    );
}

async function fetchSubmissions(states) {
    let fetchResult;
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
    const appId = params.appId;
    const selectedCategory = params.category;
    const page = params.page;
    const queriesList = [];
    if (appId) {
        queriesList.push({key: "appId", value: appId});
    }
    if (selectedCategory) {
        queriesList.push({key: "category", value: selectedCategory});
    }
    if (page) {
        queriesList.push({key: "page", value: page});
    }
    const query = formatQueryString(queriesList);
    const url = `${settings.api}/submissions${query}`;
    try {
        fetchResult = await fetch(url, {
            method: "GET",
            credentials: "include"
        })
    } catch (error) {
        console.error(error)
    } finally{
        if (fetchResult) {
            const response = await fetchResult.json();
            if (fetchResult.ok) {
                states.setNewSubmissions({
                    ...response.submissions.new,
                    buttonId: "category-new"
                })
                states.setAcceptedSubmissions({
                    ...response.submissions.accepted,
                    buttonId: "category-accepted",
                })
                states.setPendingSubmissions({
                    ...response.submissions.pending,
                    buttonId: "category-pending",
                })
                states.setRejectedSubmissions({
                    ...response.submissions.rejected,
                    buttonId: "category-rejected",
                })

                response.applications = response.applications.map((val, ind) => {
                    const toDate = new Date();
                    toDate.setTime(Number(val.startDate))
                    return {
                        ...val,
                        startDate: toDate.toLocaleDateString("ar-US", {year: 'numeric', month: 'long', day: 'numeric' })
                    }
                })
                states.setApplications(response.applications)
            } else {
                if (fetchResult.status === 401) {
                    window.location.href = "/login"
                    return;
                }
                console.error("Error fetching submissions, error code:", fetchResult.status)
                console.error("Response:\n", response)
            }
        }
    }
}


function formatQueryString(queries) {
    let queryString = '';
    let firstQuery = true;
    for (const query of queries) {
        queryString = queryString
        .concat((firstQuery && "?") || "&")
        .concat(query.key)
        .concat("=")
        .concat(query.value);

        if (firstQuery) firstQuery = false;
    }
    return queryString
}
function setQueryString(queries) {
    const queryString = formatQueryString(queries);
    const fullPath = window.location.origin + window.location.pathname + queryString
    window.history.pushState({
        path: fullPath,
    }, '', fullPath);

    return queryString;
}

export default Home;