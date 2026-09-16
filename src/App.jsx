import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import MembersPage from "./pages/MembersPage";
import AddMemberPage from "./pages/AddMemberPage";
import MemberDetailPage from "./pages/MemberDetailPage";
import MembershipsPage from "./pages/MembershipsPage";
import PaymentsPage from "./pages/PaymentsPage";
import AttendancePage from "./pages/AttendancePage";
import DuesPage from "./pages/DuesPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected — all inside MainLayout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="members" element={<MembersPage />} />
            <Route path="members/add" element={<AddMemberPage />} />
            <Route path="members/:id" element={<MemberDetailPage />} />
            <Route path="memberships" element={<MembershipsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="dues" element={<DuesPage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
