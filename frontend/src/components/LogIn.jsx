import React, { useState } from 'react';
import { useSocketIO, useSocketIOEvent, useSocketIOState } from '../hooks/useSocketIO';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const LogIn = () => {
    const { isConnected, connectionState, send, sendLogin } = useSocketIO();

    const [login, setLogin] = useState({ email: '', password: '' });

    const navigate = useNavigate();

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
        <div>
            <h1 className="mb-2 block text-center text-4xl font-bold text-gray-700">LOG IN</h1>
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
                        value={login.email}
                        onChange={e => setLogin({ ...login, email: e.target.value })}
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
                        value={login.password}
                        onChange={e => setLogin({ ...login, password: e.target.value })}
                    />
                </div>
                {/* SUBMIT BUTTON */}
                <div>
                    <button
                        className="focus:shadow-outline w-full rounded-full bg-gray-500 px-4 py-2 font-bold text-white hover:cursor-pointer hover:bg-gray-600 focus:outline-none"
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
