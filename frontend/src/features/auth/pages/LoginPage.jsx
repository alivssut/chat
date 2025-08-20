import React, { useState, useEffect } from "react";
import styles from "./AuthForm.module.css";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../authSlice";
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
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
    dispatch(login(formData));
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username or Phone Number"
            value={formData.username}
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

          <button type="submit">Log In</button>
        </form>

        <p className={styles.switchLink}>
          Don't have an account? <a href="/register">Sign up</a>
        </p>
      </div>
    </div>
  );
}
