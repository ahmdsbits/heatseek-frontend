import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth.js";

export const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};
