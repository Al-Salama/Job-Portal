import React, { useEffect, useRef } from 'react';
import useArray from '../hooks/useArray';
import './css/Home.css';
import bannerImage from "./imgs/banner.jpg"
const api = "https://career.shubraaltaif.com/api"
// const api = "http://localhost:3100/api"

export function Home() {
    const jobs = useArray([]);

    const fetched = useRef(false);
    useEffect(() => {
        if (fetched.current) return;
        fetched.current = true;

        fetchJobs(jobs.set);
        // eslint-disable-next-line
    }, [])

    return (
        <>
            <main className='HOME'>
                <h1 className="page-title">
                    بوابة التوظيف - شركة شبرا الطائف التجارية
                </h1>
                <section className="banner" style={{backgroundImage: `url(${bannerImage})`}}>
                    <h2>
                        إعمل معنا
                    </h2>
                </section>

                <section className="jobs">
                    <h3 className="jobs-intro-text">
                        إستعراض الوظائف المتاحة
                    </h3>

                    <ul className="jobs-list">
                        {getJobs(jobs.array)}
                    </ul>
                </section>
            </main>
        </>
    )
}

async function fetchJobs(setJobs) {
    let fetchResult;
    try {
        fetchResult = await fetch(`${api}/jobs`, {
            method: "GET"
        })
    } catch (error) {
        console.error(error)
    } finally{
        console.log(fetchResult)
        if (fetchResult && fetchResult.ok) {
            const jsonRes = await fetchResult.json();
            setJobs(jsonRes.jobs);
        }
    }
}

function getJobs(jobsList) {
    return jobsList.map((job) => {
        return(
            <li className="job-item">
                <a href={`/job?id=${job.id}`}>
                    <div className="icon-container">
                        <img className="icon" src={job.icon} alt="أيقونة الوظيفة" />
                    </div>
                    <h3 className="job-title">
                        {job.title}
                    </h3>
                    <pre className="job-desc">
                        {job.description}
                    </pre>
                </a>
            </li>
        )
    })
}