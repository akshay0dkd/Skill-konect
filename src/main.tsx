import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import App from "./App";
import ProtectedRoute from "./components/ProtectedRoute";
import { ROUTES } from "./constants/routes";
import "./index.css";

const HomePage = lazy(() => import("./pages/Home"));
const LoginPage = lazy(() => import("./pages/Login"));
const RegisterPage = lazy(() => import("./pages/Register"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const EditProfilePage = lazy(() => import("./pages/EditProfile"));
const RequestsPage = lazy(() => import("./pages/Requests"));
const ChatPage = lazy(() => import("./pages/Messages"));
const TasksPage = lazy(() => import("./pages/Tasks"));
const DashboardPage = lazy(() => import("./pages/Dashboard"));
const ProfileRedirect = lazy(() => import("./pages/ProfileRedirect"));
const ErrorPage = lazy(() => import("./pages/ErrorPage"));

const router = createBrowserRouter([
  {
    path: ROUTES.ROOT,
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: ROUTES.LOGIN,
        element: <LoginPage />,
      },
      {
        path: ROUTES.REGISTER,
        element: <RegisterPage />,
      },
      {
        path: ROUTES.DASHBOARD,
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.PROFILE,
        element: (
          <ProtectedRoute>
            <ProfileRedirect />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.PROFILE_PARAM,
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.EDIT_PROFILE,
        element: (
          <ProtectedRoute>
            <EditProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.REQUESTS,
        element: (
          <ProtectedRoute>
            <RequestsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.CHAT,
        element: (
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.TASKS,
        element: (
          <ProtectedRoute>
            <TasksPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

const container = document.getElementById('root');

// This check prevents the root from being created multiple times in development.
if (container && !container.hasChildNodes()) {
  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <Provider store={store}>
        <Suspense fallback={<div className="flex justify-center items-center h-screen w-full"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div></div>}>
          <RouterProvider router={router} />
        </Suspense>
      </Provider>
    </React.StrictMode>
  );
}
