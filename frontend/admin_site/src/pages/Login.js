import React, { useEffect, useRef } from "react";
import settings from "../data/settings";
import './css/Login.css'

function Login() {

    const effected = useRef(false);
    useEffect(() => {
        if (effected.current) return;
        effected.current = true;
        const form = document.querySelector("form");
        form.onsubmit = async function (ev) {
            ev.preventDefault();

            let response;
            const body = JSON.stringify({
                username: form.querySelector("#username").value,
                password: form.querySelector("#password").value
            })
            document.querySelector(".loading-spinner-button").style.display = "unset";
            try {
                response = await fetch(`${settings.api}/login`, {
                    method: "POST",
                    body: body,
                    credentials: "include",
                    headers: {
                        'Content-Type': "application/json"
                    },
                    redirect: "manual"
                })
            } finally {
                console.log(response)
                document.querySelector(".loading-spinner-button").style.display = "none";
                const isOk = response? response.ok : null;
                if (isOk) {
                    window.location.replace("/");
                    return;
                } else if (isOk === null) {
                    document.getElementById("message").innerText = "error";
                    return;
                }

                const responseJson = await response.json()
                if (response.status === 429) {
                    responseJson.message = "Too many logins! You have been blocked for a while"
                }

                document.getElementById("message").innerText = responseJson.message;
            }
        }
    }, [])

    return (
        <div className="Login">
            <h1>تسجيل الدخول</h1>

            <div className="login-container">
                <form className="login-form">
                    <div className="form-block">
                        <label htmlFor="username">Username:</label>
                        <input type={"text"} id="username" name="username"></input>
                    </div>

                    <div className="form-block">
                        <label htmlFor="password">Password:</label>
                        <input type={"password"} id="password" name="password"></input>
                    </div>

                    <button type={"submit"} id="submit" className="form-button">
                        <span>Login</span>
                        <span className="loading-spinner-button" role="status" aria-hidden="true"></span>
                    </button>

                    <p id="message"></p>
                </form>
            </div>
        </div>
    )
}

export default Login;