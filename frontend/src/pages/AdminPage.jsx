import React, { useState } from 'react';
import AdminLogIn from '../components/AdminPage/AdminLogIn';
import AdminData from '../components/AdminPage/AdminData';

const AdminPage = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [adminToken, setAdminToken] = useState(null);

    return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#7C77AA] to-[#595C8A]">
            {isLoggedIn ? (
                <AdminData adminToken={adminToken} setIsLoggedIn={setIsLoggedIn} />
            ) : (
                <AdminLogIn setIsLoggedIn={setIsLoggedIn} setAdminToken={setAdminToken} />
            )}
        </div>
    );
};

export default AdminPage;
