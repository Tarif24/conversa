import {
    Route,
    createBrowserRouter,
    createRoutesFromElements,
    RouterProvider,
} from "react-router-dom";

import { AuthProvider } from "./contexts/Authentication";

import MainLayout from "./layouts/MainLayout";
import AuthenticationLayout from "./layouts/AuthenticationLayout";
import AppLayout from "./layouts/AppLayout";

import AuthenticationPage from "./pages/AuthenticationPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    const router = createBrowserRouter(
        createRoutesFromElements(
            <Route path="/" element={<MainLayout />}>
                <Route path="/" element={<AuthenticationLayout />}>
                    <Route index element={<AuthenticationPage />} />
                </Route>
                <Route
                    path="/conversa"
                    element={
                        <ProtectedRoute>
                            <AppLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<HomePage />} />
                </Route>
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        )
    );

    return (
        // The Route provider has to wrapped in the AuthProvider or else we cant use the context
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    );
}

export default App;
