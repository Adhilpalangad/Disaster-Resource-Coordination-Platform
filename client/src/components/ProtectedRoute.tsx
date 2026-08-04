import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import type { UserRole } from "../types/index.js";

interface ProtectedRouteProps {
  /** If provided, only users with one of these roles can access the route.
   *  If omitted, any authenticated user can access it. */
  allowedRoles?: UserRole[];
}

const ROLE_DASHBOARD: Record<UserRole, string> = {
  citizen: "/dashboard",
  ngo: "/ngo/dashboard",
  volunteer: "/volunteer/dashboard",
  admin: "/admin/dashboard",
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show nothing while auth state is being restored from localStorage
  if (isLoading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--bg, #F8FAFC)",
          color: "var(--secondary, #475569)",
          fontSize: "14px",
          fontWeight: 500,
        }}
      >
        Loading...
      </div>
    );
  }

  // Not logged in → go to login, remember where they wanted to go
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but wrong role → redirect to their own dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_DASHBOARD[user.role]} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
