import React, { useEffect, useState } from "react";
import './css/Settings.css'
import deleteIcon from '../assets/imgs/delete.png'
import addIcon from '../assets/imgs/add.png'
import settings from "../data/settings";
import { getAdminInfo } from "../App";

let g_location = {};
export default function Settings() {
    const [location, setLocation] = useState({isAdding: false, list: []});
    g_location.get = location;

    useEffect(() => {
        if (!g_location.set) g_location.set = setLocation;

        fetchAllSettings();
    }, [])

    return (
        <main className="Settings">
            <section className="setting-sec">
                <div className="setting-header">
                    <h3>مواقع المقابلات الشخصية</h3>
                    <span className='add-item'>
                        <button className='add-item-btn' type='button' onClick={
                            function (e) {
                                addItem.call(this, e)
                            }
                        } style={{backgroundImage: `url(${addIcon})`}}></button>
                    </span>
                </div>
                <div className="setting-body">
                    <div className="setting">

                        {getLocationSetting()}
                    </div>
                </div>
            </section>
        </main>
    )
}

function getLocationSetting() {
    if (!g_location.get) return;

    let components;

    if (g_location.get.isAdding) {
        components =
        <>
            <div>
                <label htmlFor="location-name">إسم الموقع</label>
                <input type="text" id="location-name" />
            </div>

            <div>
                <label htmlFor="location-url">رابط الموقع</label>
                <input type="url" name="locationUrl" id="location-url" />
            </div>

            <div style={{ display: "flex", justifyContent: "center" }}>
                <button className='form-button' id="location-save-btn" onClick={
                    function (e) {
                        saveLocationItem.call(this, e)
                    }
                }>
                    <span>حفظ</span>
                    <span className="loading-spinner-button" role="status" aria-hidden="true"></span>
                </button>

                <button className='form-button' id="location-cancel-btn" onClick={
                    function (e) {
                        cancelItem.call(this, e)
                    }
                }>
                    <span>إلغاء</span>
                </button>
            </div>
        </>
    } else {
        components = g_location.get.list.map((location, id) => {
            return (
                <div className='location-item' key={location.id} data-id={location.id}>
                    <div className='item-info'>
                        <div className='item-info-line'>
                            <p>
                                <b>إسم الموقع: </b>
                                <p>{location.name}</p>
                            </p>
                        </div>
                        <div className='item-info-line'>
                            <p>
                                <b>الرابط: </b>
                                <a href={location.url} target="_blank" rel="noopener noreferrer">{location.url}</a>
                            </p>
                        </div>
                    </div>

                    <div className='controls'>
                        <div className='delete-item'>
                            <button className='delete-item-btn' type='button' onClick={
                                function (e) {
                                    deleteItem.call(this, e)
                                }
                            } style={{backgroundImage: `url(${deleteIcon})`}}></button>
                        </div>
                    </div>
                </div>
            )
        })
    }
    return components;
}

function addItem(event) {
    if (g_location.get?.isAdding) return;

    g_location.set((oldValue) => {
        return {
            ...oldValue,
            isAdding: true
        }
    });
}

function cancelItem(event) {
    g_location.set((oldValue) => {
        return {
            ...oldValue,
            isAdding: false
        }
    });
}

async function deleteItem(event) {
    const mainParent = event.target.parentElement.parentElement.parentElement;
    const locationId = mainParent.dataset.id;
    if (typeof locationId !== "string") return;

    event.target.disabled = true;

    let fetchResult;
    const url = `${settings.api}/settings/locations/${locationId}`;
    const body = JSON.stringify({
        csrfToken: getAdminInfo("csrfToken")
    })
    try {
        fetchResult = await fetch(url, {
            method: "DELETE",
            credentials: "include",
            body: body,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    } catch (error) {
        console.error(error);
    } finally {
        if (fetchResult) {
            const response = await fetchResult.json();
            if (fetchResult.ok) {
                g_location.set({
                    isAdding: false,
                    list: response.locations
                })
            }
        }
        event.target.disabled = false;
    }
}

async function saveLocationItem(event) {
    const locationName = document.getElementById("location-name").value;
    const locationURL = document.getElementById("location-url").value;

    event.target.disabled = true;
    if (locationName.length > 0 && locationURL.length > 0) {
        let fetchResult;
        const url = `${settings.api}/settings/locations`;
        const body = JSON.stringify({
            csrfToken: getAdminInfo("csrfToken"),
            name: locationName,
            url: locationURL
        })
        try {
            fetchResult = await fetch(url, {
                method: "POST",
                credentials: "include",
                body: body,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        } catch (error) {
            console.error(error);
        } finally {
            if (fetchResult) {
                const response = await fetchResult.json();
                if (fetchResult.ok) {
                    g_location.set({
                        isAdding: false,
                        list: response.locations
                    })
                }
            }
            event.target.disabled = false;
        }
    }
}

async function fetchAllSettings() {
    let fetchResult;
    const url = `${settings.api}/settings`;
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
                g_location.set({
                    isAdding: false,
                    list: response.settings.locations
                })
            }
        }
    }
}