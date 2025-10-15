import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthenticationLayout = () => {
    return (
        <div className="flex h-full w-full flex-col">
            <h1>AUTHENTICATION LAYOUT</h1>
            <Outlet />
        </div>
    );
};

export default AuthenticationLayout;
