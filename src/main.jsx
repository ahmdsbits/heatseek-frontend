import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./styles/index.css";
import { AuthProvider } from "./auth/auth.jsx";
import { ProtectedRoute } from "./auth/ProtectedRoute.jsx";
import App from "./App.jsx";
import LoginPage from "./pages/Login.jsx";
import Dash from "./pages/Dash.jsx";
import LeaveRequests from "./pages/LeaveRequests.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dash />,
      },
      {
        path: "/leave-requests",
        element: <LeaveRequests />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
