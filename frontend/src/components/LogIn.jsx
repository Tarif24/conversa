import React, { useState, useEffect, use } from 'react';
import { useSocketIO, useSocketIOEvent, useSocketIOState } from '../hooks/useSocketIO';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const LogIn = () => {
    const { isConnected, connectionState, send, user, sendLogin } = useSocketIO();

    const [login, setLogin] = useState({ email: '', password: '' });

    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/conversa');
        }
    }, [user]);

    const textInputStyle =
        'w-full rounded bg-[rgb(59,54,76)] px-3 py-2 text-white shadow-md placeholder:text-[rgb(97,91,110)] focus:ring-2 focus:ring-[rgb(184,169,233)] focus:outline-none';

    const handleSubmit = async e => {
        e.preventDefault();

        sendLogin(login, response => {
            if (response.success) {
                toast.success('Login successful!');
                navigate('/conversa');
                return;
            } else {
                if (!response.exist) {
                    toast.error('User does not exist. Please sign up first.');
                } else {
                    toast.error('Login failed. Incorrect password.');
                }
            }
        });
    };

    return (
        <div className="w-150">
            <h1 className="mb-25 block text-center text-6xl font-medium break-words text-white">
                Welcome back
            </h1>
            <form onSubmit={handleSubmit} className="w-full space-y-6">
                {/* EMAIL */}

                <input
                    type="text"
                    id="email"
                    name="email"
                    className={textInputStyle}
                    placeholder="Email"
                    autoComplete="off"
                    required
                    value={login.email}
                    onChange={e => setLogin({ ...login, email: e.target.value })}
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
                    value={login.password}
                    onChange={e => setLogin({ ...login, password: e.target.value })}
                />

                {/* SUBMIT BUTTON */}

                <button
                    className="focus:shadow-outline mt-15 w-full rounded-md bg-[rgb(110,84,181)] px-4 py-2 font-bold text-white transition duration-300 ease-in-out hover:cursor-pointer hover:bg-[rgb(81,63,131)]"
                    type="submit"
                >
                    Log In
                </button>
            </form>
        </div>
    );
};

export default LogIn;
