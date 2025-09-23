import React, { useState } from "react";
import {
    useSocketIO,
    useSocketIOEvent,
    useSocketIOState,
} from "../hooks/useSocketIO";
import EVENTS from "../../../constants/socketEvents";

const SignUp = () => {
    const { isConnected, connectionState, send } = useSocketIO();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = send(EVENTS.USER_SIGNUP, {
            username: "Tom",
            email,
            password,
        });

        console.log(result);
    };

    return (
        <div>
            <h1 className="block text-gray-700 font-bold mb-2 text-4xl text-center">
                SIGN UP
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                {/* SUBMIT BUTTON */}
                <div>
                    <button
                        className="bg-gray-500 hover:bg-gray-600 hover:cursor-pointer text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline"
                        type="submit"
                    >
                        Sign Up
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SignUp;
