import React from 'react';
import { Outlet } from 'react-router-dom';

const AppLayout = () => {
    return (
        <div className="flex h-full w-full flex-col">
            <h1>APP LAYOUT</h1>
            <Outlet />
        </div>
    );
};

export default AppLayout;
