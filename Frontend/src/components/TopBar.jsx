import React from "react";
import { useNavigate } from "react-router-dom";

function TopBar() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={{ display: "flex", justifyContent: "space-between", background: "#333", color: "#fff", padding: "10px" }}>
      <h3>CivicConnect</h3>
      <div>
        <span style={{ marginRight: "20px" }}>Welcome, {name}</span>
        <button onClick={handleLogout} style={{ background: "#ff4444", color: "#fff", border: "none", padding: "6px 10px", cursor: "pointer" }}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default TopBar;
