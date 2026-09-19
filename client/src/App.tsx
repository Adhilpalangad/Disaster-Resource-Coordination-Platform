import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.js";

// Guards & Layouts
import ProtectedRoute from "./components/ProtectedRoute.js";
import PublicLayout from "./layouts/PublicLayout.js";
import AuthenticatedLayout from "./layouts/AuthenticatedLayout.js";
import AdminLayout from "./layouts/AdminLayout.js";

// ── Public Pages ───────────────────────────────────────────────────────────────
import Home from "./pages/public/Home.js";
import About from "./pages/public/About.js";
import Contact from "./pages/public/Contact.js";
import Login from "./pages/public/Login.js";
import Register from "./pages/public/Register.js";
import ForgotPassword from "./pages/public/ForgotPassword.js";
import ResetPassword from "./pages/public/ResetPassword.js";
import NotFound from "./pages/public/NotFound.js";
import PrivacyPolicy from "./pages/public/PrivacyPolicy.js";
import TermsOfService from "./pages/public/TermsOfService.js";

// ── Shared Authenticated Pages (all roles) ────────────────────────────────────
import Notifications from "./pages/notifications/Notifications.js";
import Profile from "./pages/profile/Profile.js";
import Settings from "./pages/settings/Settings.js";
import HelpCenter from "./pages/help/HelpCenter.js";

// ── Citizen Pages ──────────────────────────────────────────────────────────────
import Dashboard from "./pages/dashboard/Dashboard.js";
import Disasters from "./pages/disasters/Disasters.js";
import DisasterDetails from "./pages/disasters/DisasterDetails.js";
import MyRequests from "./pages/requests/MyRequests.js";
import CreateReliefRequest from "./pages/requests/CreateReliefRequest.js";
import RequestDetails from "./pages/requests/RequestDetails.js";
import ShelterManagement from "./pages/shelter/ShelterManagement.js";

// ── NGO Pages ──────────────────────────────────────────────────────────────────
import NgoDashboard from "./pages/ngo/NgoDashboard.js";
import NgoRequests  from "./pages/ngo/NgoRequests.js";
import NgoProfile   from "./pages/ngo/NgoProfile.js";
import InventoryManagement from "./pages/inventory/InventoryManagement.js";
import Assignments from "./pages/assignments/Assignments.js";
import Reports from "./pages/reports/Reports.js";

// ── Volunteer Pages ────────────────────────────────────────────────────────────
import VolunteerDashboard from "./pages/volunteer/VolunteerDashboard.js";
import VolunteerTasks     from "./pages/volunteer/VolunteerTasks.js";

// ── Admin Pages ────────────────────────────────────────────────────────────────
import AdminDashboard from "./pages/admin/AdminDashboard.js";
import ManageUsers from "./pages/admin/ManageUsers.js";
import ManageNgos from "./pages/admin/ManageNgos.js";
import ManageVolunteers from "./pages/admin/ManageVolunteers.js";
import ManageDisasters from "./pages/admin/ManageDisasters.js";
import ManageResources from "./pages/admin/ManageResources.js";
import Analytics from "./pages/admin/Analytics.js";
import SystemSettings from "./pages/admin/SystemSettings.js";
import ManageDuplicates from "./pages/admin/ManageDuplicates.js";

// ── Root redirect: logged-in users go straight to their dashboard ──────────────
const RootRedirect = () => {
  const { isAuthenticated, getDashboardPath, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated
    ? <Navigate to={getDashboardPath()} replace />
    : <Navigate to="/home" replace />;
};

export function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public Routes ──────────────────────────────────────────────── */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
        </Route>

        {/* ── Citizen Routes ─────────────────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={["citizen"]} />}>
          <Route element={<AuthenticatedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/disasters" element={<Disasters />} />
            <Route path="/disasters/:id" element={<DisasterDetails />} />
            <Route path="/requests" element={<MyRequests />} />
            <Route path="/requests/create" element={<CreateReliefRequest />} />
            <Route path="/requests/:id" element={<RequestDetails />} />
            <Route path="/shelters" element={<ShelterManagement />} />
          </Route>
        </Route>

        {/* ── NGO Routes ─────────────────────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={["ngo"]} />}>
          <Route element={<AuthenticatedLayout />}>
            <Route path="/ngo/dashboard" element={<NgoDashboard />} />
            <Route path="/ngo/requests" element={<NgoRequests />} />
            <Route path="/ngo/profile"  element={<NgoProfile />} />
            <Route path="/inventory" element={<InventoryManagement />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/shelters" element={<ShelterManagement />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
        </Route>

        {/* ── Volunteer Routes ───────────────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={["volunteer"]} />}>
          <Route element={<AuthenticatedLayout />}>
            <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
            <Route path="/volunteer/tasks"     element={<VolunteerTasks />} />
          </Route>
        </Route>

        {/* ── Admin Routes ───────────────────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/ngos" element={<ManageNgos />} />
            <Route path="/admin/volunteers" element={<ManageVolunteers />} />
            <Route path="/admin/disasters" element={<ManageDisasters />} />
            <Route path="/admin/resources" element={<ManageResources />} />
            <Route path="/admin/duplicates" element={<ManageDuplicates />} />
            <Route path="/admin/analytics" element={<Analytics />} />
            <Route path="/admin/settings" element={<SystemSettings />} />
          </Route>
        </Route>

        {/* ── Shared Authenticated Routes (any role) ─────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AuthenticatedLayout />}>
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<HelpCenter />} />
          </Route>
        </Route>

        {/* ── 404 ────────────────────────────────────────────────────────── */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
