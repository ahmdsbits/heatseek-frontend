import React from "react";
import { useAuth } from "../../auth/useAuth";
import "./styles.css";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const getButtonClass = (path) => {
    return location.pathname === path ? "primary-button" : "secondary-button";
  };

  return (
    <div className="sidebar">
      <ul>
        <li>
          <Link to="/">
            <button className={getButtonClass("/")}>Dashboard</button>
          </Link>
        </li>
        <li>
          <Link to="/leave-requests">
            <button className={getButtonClass("/leave-requests")}>Leave Requests</button>
          </Link>
        </li>
      </ul>
      <div className="logout-container">
        <button className="danger-button" onClick={logout}>Logout</button>
      </div>
    </div>
  );
};

export default Sidebar;
