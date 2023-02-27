import React from 'react';
import './css/Home.css';
import cashierIcon from './imgs/cashier.svg';
import deliveryIcon from './imgs/delivery.svg';

const jobs = [
    {
        jobTitle: 'موصل بضائع',
        jobDesc: 'يستلم مندوب التوصيل السلع والطلبات من المنشأة كما يحصل على توجيهات مكان التوصيل وملاحظات العميل، ثم ينطلق ليوصلها إلى من طلبها.\nكلام يتجاوز الحدود كلام يتجاوز الحدود كلام يتجاوز الحدود كلام يتجاوز الحدود كلام يتجاوز الحدود كلام يتجاوز الحدود كلام يتجاوز الحدود كلام يتجاوز الحدود كلام يتجاوز الحدود كلام يتجاوز الحدود كلام يتجاوز الحدود كلام يتجاوز الحدود كلام يتجاوز الحدود كلام يتجاوز الحدود كلام يتجاوز الحدود كلام يتجاوز الحدود كلام يتجاوز الحدود',
        icon: deliveryIcon
    },
    {
        jobTitle: 'كاشير',
        jobDesc: 'يقوم الكاشير بإدارة صندوق المصروفات ومحاسبة العملاء.',
        icon: cashierIcon
    },
    {
        jobTitle: 'موصل بضائع',
        jobDesc: 'يستلم مندوب التوصيل السلع والطلبات من المنشأة كما يحصل على توجيهات مكان التوصيل وملاحظات العميل، ثم ينطلق ليوصلها إلى من طلبها.',
        icon: deliveryIcon
    },
    {
        jobTitle: 'كاشير',
        jobDesc: 'يقوم الكاشير بإدارة صندوق المصروفات ومحاسبة العملاء.',
        icon: cashierIcon
    },
    {
        jobTitle: 'موصل بضائع',
        jobDesc: 'يستلم مندوب التوصيل السلع والطلبات من المنشأة كما يحصل على توجيهات مكان التوصيل وملاحظات العميل، ثم ينطلق ليوصلها إلى من طلبها.',
        icon: deliveryIcon
    }
]

function getJobs() {
    const html_jobs = [];
    jobs.map((job) => {
        html_jobs.push(
            <li className="job-item">
                <a href="/job">
                    <div className="icon-container">
                        <img className="icon" src={job.icon} alt="أيقونة الوظيفة" />
                    </div>
                    <h3 className="job-title">
                        {job.jobTitle}
                    </h3>
                    <pre className="job-desc">
                        {job.jobDesc}
                    </pre>
                </a>
            </li>
        )
        return null;
    })
    return html_jobs
}

export function Home() {
    return (
        <>
            <main className='HOME'>
                <h1 className="page-title">
                    بوابة التوظيف - شركة شبرا الطائف التجارية
                </h1>
                <section className="banner">
                    <h2>
                        إعمل معنا
                    </h2>
                </section>

                <section className="jobs">
                    <h3 className="jobs-intro-text">
                        إستعراض الوظائف المتاحة
                    </h3>

                    <ul className="jobs-list">
                        {getJobs()}
                    </ul>
                </section>
            </main>
        </>
    )
}