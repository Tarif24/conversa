import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

const MainLayout = () => {
    return (
        <div className="flex h-screen w-screen flex-col">
            <Outlet />
            <ToastContainer autoClose={2000} pauseOnFocusLoss={false} />
        </div>
    );
};

export default MainLayout;
