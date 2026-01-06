import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { SearchProvider } from "./context/SearchContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import SalesModule from "./pages/SalesModule";
import SupportModule from "./pages/SupportModule";
import FinanceModule from "./pages/FinanceModule";
import OperationsModule from "./pages/OperationsModule";
import DocumentsPage from "./pages/DocumentsPage";

import AdminLayout from "./components/layout/AdminLayout";

// Protected Route Component
// Role Protected Route Component
const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return null;
  if (!user) return <Navigate to="/" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their allowed home based on role
    if (user.role === 'sales') return <Navigate to="/sales" />;
    if (user.role === 'ops') return <Navigate to="/ops" />;
    if (user.role === 'finance') return <Navigate to="/finance" />;
    if (user.role === 'tech') return <Navigate to="/support" />;
    return <Navigate to="/" />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <SearchProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />

            {/* Main App Layout for Authenticated Users */}
            <Route element={<AdminLayout />}>
              {/* Dashboard: ADMIN ONLY */}
              <Route path="/dashboard" element={
                <RoleRoute allowedRoles={['admin']}>
                  <Dashboard />
                </RoleRoute>
              } />

              {/* Sales: SALES & ADMIN */}
              <Route path="/sales" element={
                <RoleRoute allowedRoles={['sales', 'admin']}>
                  <SalesModule />
                </RoleRoute>
              } />

              {/* Ops: OPS & ADMIN */}
              <Route path="/ops" element={
                <RoleRoute allowedRoles={['ops', 'admin']}>
                  <OperationsModule />
                </RoleRoute>
              } />

              {/* Support: TECH & ADMIN */}
              <Route path="/support" element={
                <RoleRoute allowedRoles={['tech', 'admin']}>
                  <SupportModule />
                </RoleRoute>
              } />

              {/* Finance: FINANCE & ADMIN */}
              <Route path="/finance" element={
                <RoleRoute allowedRoles={['finance', 'admin']}>
                  <FinanceModule />
                </RoleRoute>
              } />

              {/* Documents: ALL AUTHENTICATED */}
              <Route path="/documents" element={<DocumentsPage />} />
            </Route>

            {/* Redirect old routes to dashboard for now */}
            <Route path="/admin" element={<Navigate to="/dashboard" />} />

          </Routes>
        </BrowserRouter>
      </SearchProvider>
    </AuthProvider >
  );
}

export default App;