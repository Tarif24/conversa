import React, { useState } from 'react';
import AdminLogIn from '../components/AdminPage/AdminLogIn';

const AdminPage = () => {
    return (
        <div className="relative flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#7C77AA] to-[#595C8A] p-15">
            <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[rgb(45,38,56)] shadow-xl/40 backdrop-blur-lg">
                <AdminLogIn />
            </div>
        </div>
    );
};

export default AdminPage;
