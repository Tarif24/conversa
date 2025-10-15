import React, { useState } from 'react';
import { useSocketIO, useSocketIOEvent, useSocketIOState } from '../hooks/useSocketIO';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
    const { isConnected, connectionState, send, sendSignup } = useSocketIO();

    const [user, setUser] = useState({
        username: '',
        email: '',
        password: '',
        profile: {
            firstName: '',
            lastName: '',
        },
    });

    const navigate = useNavigate();

    const handleSubmit = async e => {
        e.preventDefault();

        sendSignup(user, response => {
            if (response.success) {
                toast.success('Signup successful!');
                navigate('/conversa');
                return;
            } else if (response.exist) {
                toast.error('User already exists. Please log in.');
                return;
            }

            toast.error('Signup failed: Server error');
        });
    };

    return (
        <div>
            <h1 className="mb-2 block text-center text-4xl font-bold text-gray-700">SIGN UP</h1>
            <form onSubmit={handleSubmit} className="w-150 space-y-4 rounded-lg border p-6">
                {/* EMAIL */}
                <div>
                    <label htmlFor="email" className="mb-2 block font-bold text-gray-700">
                        Email
                    </label>
                    <input
                        type="text"
                        id="email"
                        name="email"
                        className="w-full rounded border px-3 py-2"
                        placeholder="Enter a email address"
                        autoComplete="off"
                        required
                        value={user.email}
                        onChange={e => setUser({ ...user, email: e.target.value })}
                    />
                </div>
                {/* PASSWORD */}
                <div>
                    <label htmlFor="password" className="mb-2 block font-bold text-gray-700">
                        Password
                    </label>
                    <input
                        type="text"
                        id="password"
                        name="password"
                        className="w-full rounded border px-3 py-2"
                        placeholder="Enter a password"
                        autoComplete="off"
                        required
                        value={user.password}
                        onChange={e => setUser({ ...user, password: e.target.value })}
                    />
                </div>
                {/* USERNAME */}
                <div>
                    <label htmlFor="username" className="mb-2 block font-bold text-gray-700">
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        className="w-full rounded border px-3 py-2"
                        placeholder="Enter a username"
                        autoComplete="off"
                        required
                        value={user.username}
                        onChange={e => setUser({ ...user, username: e.target.value })}
                    />
                </div>
                {/* FIRSTNAME */}
                <div>
                    <label htmlFor="firstName" className="mb-2 block font-bold text-gray-700">
                        First Name
                    </label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        className="w-full rounded border px-3 py-2"
                        placeholder="Enter your first name"
                        autoComplete="off"
                        required
                        value={user.profile.firstName}
                        onChange={e =>
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
                    <label htmlFor="lastName" className="mb-2 block font-bold text-gray-700">
                        Last Name
                    </label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        className="w-full rounded border px-3 py-2"
                        placeholder="Enter your last name"
                        autoComplete="off"
                        required
                        value={user.profile.lastName}
                        onChange={e =>
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
                        className="focus:shadow-outline w-full rounded-full bg-gray-500 px-4 py-2 font-bold text-white hover:cursor-pointer hover:bg-gray-600 focus:outline-none"
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
