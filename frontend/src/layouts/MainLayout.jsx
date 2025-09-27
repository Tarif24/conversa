import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MainLayout = () => {
    return (
        <div className="flex flex-col w-screen h-screen">
            <div className="flex justify-center bg-gray-500 text-white p-4">
                <h1 className="text-3xl font-bold">Conversa</h1>
            </div>
            <Outlet />
            <ToastContainer />
        </div>
    );
};

export default MainLayout;
