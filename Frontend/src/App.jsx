
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import SectorHeadHome from "./pages/SectorHead/Sector-Home";
import BroadcastPage from "./pages/SectorHead/BroadcastPage";
import CitizenDashboard from "./pages/citizenDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import SectorHeadResetPassword from "./pages/SectorHeadResetPassword";
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
};
const CitizenPrivateRoute = ({ children }) => {
  const token = localStorage.getItem("citizenToken"); 
  return token ? children : <Navigate to="/" />;
};



export default function App() {
  return (
    
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/sector-head/reset-password/:token" element={<SectorHeadResetPassword />} />
          <Route
            path="/admin-dashboard"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/sectorHead-dashboard"
            element={
              <PrivateRoute>
                <SectorHeadHome />
              </PrivateRoute>
            }
          />
          <Route
            path="/send-broadcast"
            element={
              <PrivateRoute>
                <BroadcastPage />
              </PrivateRoute>
            }
          />
<Route
  path="/citizen-dashboard"
  element={
    <PrivateRoute>
      <CitizenDashboard />
    </PrivateRoute>
  }
/>
        </Routes>
      </Router>
    </div>
  );
} 

