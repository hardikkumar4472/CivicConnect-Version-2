// CreateCitizen.jsx
import React, { useState } from "react";
import axios from "axios";

export default function CreateCitizen({ sectorName, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    houseNumber: ""
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    const token = localStorage.getItem("token");
    try {
      const res = await axios.post(
        "https://civicconnect-backend.onrender.com/api/citizen/register",
        {
          ...formData,
          sector: sectorName
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccessMessage(res.data.message || "Citizen created successfully!");
      setFormData({
        name: "",
        email: "",
        phone: "",
        houseNumber: ""
      });
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || "An error occurred during registration."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Create Citizen in {sectorName}</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="text"
            name="houseNumber"
            placeholder="House Number"
            value={formData.houseNumber}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Registering..." : "Create Citizen"}
          </button>

          {successMessage && <p style={styles.success}>{successMessage}</p>}
          {errorMessage && <p style={styles.error}>{errorMessage}</p>}
        </form>

        <button onClick={onClose} style={styles.closeBtn}>
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },
  modal: {
    backgroundColor: "#112240",
    color: "#ccd6f6",
    padding: "30px",
    borderRadius: "8px",
    width: "90%",
    maxWidth: "450px",
    position: "relative"
  },
  title: {
    marginBottom: "20px",
    textAlign: "center"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  },
  input: {
    padding: "10px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#0a192f",
    color: "#fff"
  },
  button: {
    padding: "10px",
    borderRadius: "4px",
    backgroundColor: "#64ffda",
    color: "#0a192f",
    fontWeight: "bold",
    cursor: "pointer",
    border: "none"
  },
  closeBtn: {
    position: "absolute",
    top: "15px",
    right: "15px",
    background: "none",
    border: "none",
    color: "#ccd6f6",
    fontSize: "1.2rem",
    cursor: "pointer"
  },
  success: {
    color: "#32CD32",
    textAlign: "center"
  },
  error: {
    color: "#FF6B6B",
    textAlign: "center"
  }
};
