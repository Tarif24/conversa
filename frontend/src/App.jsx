import {
    Route,
    createBrowserRouter,
    createRoutesFromElements,
    RouterProvider,
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import AuthenticationLayout from "./layouts/AuthenticationLayout";
import AppLayout from "./layouts/AppLayout";

import AuthenticationPage from "./pages/AuthenticationPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
    const router = createBrowserRouter(
        createRoutesFromElements(
            <Route path="/" element={<MainLayout />}>
                <Route path="/" element={<AuthenticationLayout />}>
                    <Route index element={<AuthenticationPage />} />
                </Route>
                <Route path="/conversa" element={<AppLayout />}>
                    <Route index element={<HomePage />} />
                </Route>
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        )
    );

    return <RouterProvider router={router} />;
}

export default App;
