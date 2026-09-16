import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    try {
      const stored = localStorage.getItem("gymAdmin");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("gymToken") || null);

  const login = (adminData, authToken) => {
    setAdmin(adminData);
    setToken(authToken);
    localStorage.setItem("gymAdmin", JSON.stringify(adminData));
    localStorage.setItem("gymToken", authToken);
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem("gymAdmin");
    localStorage.removeItem("gymToken");
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ admin, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
