import React, { useState } from 'react';
import { useSocketIO, useSocketIOEvent, useSocketIOState } from '../../hooks/useSocketIO';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { EyeOff } from 'lucide-react';

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
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const textInputStyle =
        'w-full rounded bg-[rgb(59,54,76)] px-3 py-2 text-white shadow-sm placeholder:text-[rgb(97,91,110)] focus:ring-2 focus:ring-[rgb(184,169,233)] focus:outline-none';

    // Email format validator
    const isValidEmail = email => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    // Password format validator
    const isValidPassword = password => {
        // Minimum 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);
    };

    const handleSubmit = async e => {
        e.preventDefault();

        // Email and password validation
        if (!isValidEmail(user.email)) {
            toast.error('Please enter a valid email address.');
            return;
        }

        if (!isValidPassword(user.password)) {
            toast.error(
                'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.'
            );
            return;
        }

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
                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        className={textInputStyle}
                        placeholder="Enter your password"
                        autoComplete="off"
                        required
                        value={user.password}
                        onChange={e => setUser({ ...user, password: e.target.value })}
                    />
                    <div
                        className="absolute top-0 right-0 flex h-full w-10 cursor-pointer items-center justify-center rounded-r-md bg-[rgb(59,54,76)] text-gray-400"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <Eye className="" /> : <EyeOff className="" />}
                    </div>
                </div>

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
