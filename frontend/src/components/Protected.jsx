import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function PublicOnly({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (isAuthenticated) {
    return <Navigate to={location.state?.from ?? "/"} replace />;
  }
  return children;
}

export function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}

export function RequireOwner({ children }) {
  const { isOwner, loading } = useAuth();
  if (loading) return null;
  if (!isOwner) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export function RequireStaff({ children }) {
  const { isStaff, loading } = useAuth();
  if (loading) return null;
  if (!isStaff) {
    return <Navigate to="/" replace />;
  }
  return children;
}