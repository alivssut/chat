import React, { useState, useEffect } from "react";
import styles from "./AuthForm.module.css";
import { useDispatch, useSelector } from 'react-redux';
import { register } from "../authSlice";
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);


  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    // dispatch(register(formData));
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <button type="submit">Sign Up</button>
        </form>

        <p className={styles.switchLink}>
          Already have an account? <a href="/login">Log in</a>
        </p>
      </div>
    </div>
  );
}
