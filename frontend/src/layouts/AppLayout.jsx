import React from "react";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
    return (
        <div className="flex flex-col w-full h-full">
            <h1>APP LAYOUT</h1>
            <Outlet />
        </div>
    );
};

export default AppLayout;
