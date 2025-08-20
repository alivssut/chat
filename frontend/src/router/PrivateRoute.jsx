import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { validateOrRefreshToken, getUser } from "../features/auth/authSlice";

const PrivateRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await dispatch(validateOrRefreshToken());
        if (result.payload) {
          await dispatch(getUser());
        }
      } catch (err) {
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, [dispatch]);

  if (checkingAuth || loading.user) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
