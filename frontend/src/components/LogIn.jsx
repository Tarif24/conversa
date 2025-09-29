import React, { useState } from "react";
import {
    useSocketIO,
    useSocketIOEvent,
    useSocketIOState,
} from "../hooks/useSocketIO";
import EVENTS from "../../../constants/socketEvents";
import { useNavigate } from "react-router-dom";

const LogIn = () => {
    const { isConnected, connectionState, send } = useSocketIO();

    const [login, setLogin] = useState({ email: "", password: "" });

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        send(EVENTS.USER_LOGIN, login, (response) => {
            if (response.success) {
                alert("Login successful!");
                navigate("/conversa");
                return;
            } else {
                if (!response.exist) {
                    alert("User does not exist. Please sign up first.");
                } else {
                    alert("Login failed. Incorrect password.");
                }
            }
        });
    };

    return (
        <div>
            <h1 className="block text-gray-700 font-bold mb-2 text-4xl text-center">
                LOG IN
            </h1>
            <form
                onSubmit={handleSubmit}
                className="space-y-4 p-6 w-150 border rounded-lg"
            >
                {/* EMAIL */}
                <div>
                    <label
                        htmlFor="email"
                        className="block text-gray-700 font-bold mb-2"
                    >
                        Email
                    </label>
                    <input
                        type="text"
                        id="email"
                        name="email"
                        className="border rounded w-full py-2 px-3"
                        placeholder="Enter a email address"
                        autoComplete="off"
                        required
                        value={login.email}
                        onChange={(e) =>
                            setLogin({ ...login, email: e.target.value })
                        }
                    />
                </div>
                {/* PASSWORD */}
                <div>
                    <label
                        htmlFor="password"
                        className="block text-gray-700 font-bold mb-2"
                    >
                        Password
                    </label>
                    <input
                        type="text"
                        id="password"
                        name="password"
                        className="border rounded w-full py-2 px-3"
                        placeholder="Enter a password"
                        autoComplete="off"
                        required
                        value={login.password}
                        onChange={(e) =>
                            setLogin({ ...login, password: e.target.value })
                        }
                    />
                </div>
                {/* SUBMIT BUTTON */}
                <div>
                    <button
                        className="bg-gray-500 hover:bg-gray-600 hover:cursor-pointer text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline"
                        type="submit"
                    >
                        Log In
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LogIn;
