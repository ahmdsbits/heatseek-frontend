import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext.js";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedEmployee = localStorage.getItem("employee");

    if (storedToken && storedEmployee) {
      setToken(storedToken);
      setEmployee(JSON.parse(storedEmployee));
    }
  }, []);

  const login = (token, employee) => {
    setToken(token);
    setEmployee(employee);
    localStorage.setItem("token", token);
    localStorage.setItem("employee", JSON.stringify(employee));
  };

  const logout = () => {
    setToken(null);
    setEmployee(null);
    localStorage.removeItem("token");
    localStorage.removeItem("employee");
  };

  return (
    <AuthContext.Provider value={{ token, employee, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
