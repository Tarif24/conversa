import React, { useState, useEffect } from 'react';
import { useSocketIO } from '../../hooks/useSocketIO';
import { toast } from 'react-toastify';
import { Eye } from 'lucide-react';
import { EyeOff } from 'lucide-react';

const AdminLogIn = ({ setIsLoggedIn, setAdminToken }) => {
    const { sendAdminLogin, isConnected } = useSocketIO();

    const [login, setLogin] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    const textInputStyle =
        'w-full rounded bg-[rgb(59,54,76)] px-3 py-2 text-white shadow-md placeholder:text-[rgb(97,91,110)] focus:ring-2 focus:ring-[rgb(184,169,233)] focus:outline-none';

    const handleSubmit = async e => {
        e.preventDefault();

        sendAdminLogin(login, response => {
            if (response.success) {
                toast.success('Login successful!');
                setIsLoggedIn(true);
                setAdminToken(response.token);
            } else {
                toast.error('Login failed');
            }
        });
    };

    return (
        <div className="flex h-full w-full items-center justify-center p-3 md:p-15">
            <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[rgb(45,38,56)] shadow-xl/40 backdrop-blur-lg">
                <div className="w-fit p-3">
                    <h1 className="mb-25 block text-center text-3xl font-medium text-white sm:text-4xl md:text-6xl">
                        Conversa Admin Panel
                    </h1>
                    <form onSubmit={handleSubmit} className="w-full space-y-6">
                        {/* USERNAME */}

                        <input
                            type="text"
                            id="username"
                            name="username"
                            className={textInputStyle}
                            placeholder="Username"
                            autoComplete="off"
                            required
                            value={login.username}
                            onChange={e => setLogin({ ...login, username: e.target.value })}
                        />

                        {/* PASSWORD */}
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                className={textInputStyle}
                                placeholder="Password"
                                autoComplete="off"
                                required
                                value={login.password}
                                onChange={e => setLogin({ ...login, password: e.target.value })}
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
                            Log In
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLogIn;
