import React, { useState } from 'react';
import { useSocketIO, useSocketIOEvent, useSocketIOState } from '../../hooks/useSocketIO';
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

    const textInputStyle =
        'w-full rounded bg-[rgb(59,54,76)] px-3 py-2 text-white shadow-sm placeholder:text-[rgb(97,91,110)] focus:ring-2 focus:ring-[rgb(184,169,233)] focus:outline-none';

    const handleSubmit = async e => {
        e.preventDefault();

        sendSignup(user, response => {
            if (response.success) {
                toast.success('Signup successful!');
                navigate('/conversa');
                return;
            } else if (response.exists) {
                toast.error('User already exists. Please log in.');
                return;
            }

            toast.error('Signup failed: Server error');
        });
    };

    return (
        <div className="flex w-full flex-col items-center justify-center p-4 sm:p-0">
            <h1 className="mb-25 block text-center text-4xl font-medium text-white sm:text-5xl">
                Create an account
            </h1>
            <form onSubmit={handleSubmit} className="w-full space-y-4 sm:w-[75%] sm:space-y-6">
                {/* NAME */}
                <div className="flex gap-8">
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        className={textInputStyle}
                        placeholder="First name"
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

                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        className={textInputStyle}
                        placeholder="Last name"
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

                {/* USERNAME */}
                <input
                    type="text"
                    id="username"
                    name="username"
                    className={textInputStyle}
                    placeholder="Username"
                    autoComplete="off"
                    required
                    value={user.username}
                    onChange={e => setUser({ ...user, username: e.target.value })}
                />

                {/* EMAIL */}
                <input
                    type="text"
                    id="email"
                    name="email"
                    className={textInputStyle}
                    placeholder="Email"
                    autoComplete="off"
                    required
                    value={user.email}
                    onChange={e => setUser({ ...user, email: e.target.value })}
                />

                {/* PASSWORD */}
                <input
                    type="text"
                    id="password"
                    name="password"
                    className={textInputStyle}
                    placeholder="Enter your password"
                    autoComplete="off"
                    required
                    value={user.password}
                    onChange={e => setUser({ ...user, password: e.target.value })}
                />

                {/* SUBMIT BUTTON */}
                <button
                    className="focus:shadow-outline mt-15 w-full rounded-md bg-[rgb(110,84,181)] px-4 py-2 font-bold text-white transition duration-300 ease-in-out hover:cursor-pointer hover:bg-[rgb(81,63,131)]"
                    type="submit"
                >
                    Sign Up
                </button>
            </form>
        </div>
    );
};

export default SignUp;
