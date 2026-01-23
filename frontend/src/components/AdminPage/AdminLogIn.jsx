import React, { useState } from 'react';
import { useSocketIO } from '../../hooks/useSocketIO';
import { toast } from 'react-toastify';

const AdminLogIn = () => {
    const { sendAdminLogin } = useSocketIO();

    const [login, setLogin] = useState({ username: '', password: '' });

    const textInputStyle =
        'w-full rounded bg-[rgb(59,54,76)] px-3 py-2 text-white shadow-md placeholder:text-[rgb(97,91,110)] focus:ring-2 focus:ring-[rgb(184,169,233)] focus:outline-none';

    const handleSubmit = async e => {
        e.preventDefault();

        sendAdminLogin(login, response => {
            if (response.success) {
                toast.success('Login successful!');
            } else {
                toast.error('Login failed');
            }
        });
    };

    return (
        <div className="w-fit">
            <h1 className="mb-25 block text-center text-6xl font-medium text-white">
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

                <input
                    type="text"
                    id="password"
                    name="password"
                    className={textInputStyle}
                    placeholder="Password"
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

export default AdminLogIn;
