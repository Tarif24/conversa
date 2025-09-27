import React, { useState } from "react";
import {
    useSocketIO,
    useSocketIOEvent,
    useSocketIOState,
} from "../hooks/useSocketIO";
import { useNavigate } from "react-router-dom";
import EVENTS from "../../../constants/socketEvents";

const SignUp = () => {
    const { isConnected, connectionState, send } = useSocketIO();

    const [user, setUser] = useState({
        username: "",
        email: "",
        password: "",
        profile: {
            firstName: "",
            lastName: "",
        },
    });
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        send(EVENTS.USER_SIGNUP, user);
    };

    // Listen for signup result
    useSocketIOEvent(EVENTS.USER_SIGNUP_RESULT, (data) => {
        if (data.success) {
            alert("Signup successful!");
            navigate("/conversa");
            return;
        } else if (data.exist) {
            alert("User already exists. Please log in.");
            return;
        }

        alert("Signup failed: Server error");
    });

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
                        value={user.email}
                        onChange={(e) =>
                            setUser({ ...user, email: e.target.value })
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
                        value={user.password}
                        onChange={(e) =>
                            setUser({ ...user, password: e.target.value })
                        }
                    />
                </div>
                {/* USERNAME */}
                <div>
                    <label
                        htmlFor="username"
                        className="block text-gray-700 font-bold mb-2"
                    >
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        className="border rounded w-full py-2 px-3"
                        placeholder="Enter a username"
                        autoComplete="off"
                        required
                        value={user.username}
                        onChange={(e) =>
                            setUser({ ...user, username: e.target.value })
                        }
                    />
                </div>
                {/* FIRSTNAME */}
                <div>
                    <label
                        htmlFor="firstName"
                        className="block text-gray-700 font-bold mb-2"
                    >
                        First Name
                    </label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        className="border rounded w-full py-2 px-3"
                        placeholder="Enter your first name"
                        autoComplete="off"
                        required
                        value={user.profile.firstName}
                        onChange={(e) =>
                            setUser({
                                ...user,
                                profile: {
                                    ...user.profile,
                                    firstName: e.target.value,
                                },
                            })
                        }
                    />
                </div>
                {/* LASTNAME */}
                <div>
                    <label
                        htmlFor="lastName"
                        className="block text-gray-700 font-bold mb-2"
                    >
                        Last Name
                    </label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        className="border rounded w-full py-2 px-3"
                        placeholder="Enter your last name"
                        autoComplete="off"
                        required
                        value={user.profile.lastName}
                        onChange={(e) =>
                            setUser({
                                ...user,
                                profile: {
                                    ...user.profile,
                                    lastName: e.target.value,
                                },
                            })
                        }
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
