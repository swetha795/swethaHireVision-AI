// Global auth state - handles login/register/logout and persists the session
import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("hirevision_user");
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const data = res.data.data;
    localStorage.setItem("hirevision_token", data.token);
    localStorage.setItem("hirevision_user", JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (name, email, password, targetRole) => {
    const res = await api.post("/auth/register", { name, email, password, targetRole });
    const data = res.data.data;
    localStorage.setItem("hirevision_token", data.token);
    localStorage.setItem("hirevision_user", JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("hirevision_token");
    localStorage.removeItem("hirevision_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
