import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MainLayout = () => {
    return (
        <div className="flex h-screen w-screen flex-col">
            <Outlet />
            <ToastContainer />
        </div>
    );
};

export default MainLayout;
