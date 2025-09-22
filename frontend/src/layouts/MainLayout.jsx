import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MainLayout = () => {
    return (
        <div className="flex flex-col w-screen h-screen">
            <h1>MAIN LAYOUT</h1>
            <Outlet />
            <ToastContainer />
        </div>
    );
};

export default MainLayout;
