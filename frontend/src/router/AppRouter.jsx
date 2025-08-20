import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import ChatPage from "../features/chat/pages/ChatPage";
import PrivateRoute from "./PrivateRoute";

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Private routes */}
        <Route path="/" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
        <Route path="/:room_id" element={<PrivateRoute><ChatPage /></PrivateRoute>} />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
