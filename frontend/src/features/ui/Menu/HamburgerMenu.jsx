import React, {useEffect} from "react";
import styles from "./HamburgerMenu.module.css";
import { useDispatch, useSelector } from "react-redux";
import { getUserDetails } from "../../auth/authSlice";

export default function HamburgerMenu({ isOpen, onClose, user }) {
  const dispatch = useDispatch();
  const { loading, userDetails } = useSelector((state) => state.auth);

  useEffect(() => {
    if(!userDetails)
    dispatch(getUserDetails());
  }, [dispatch, isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.drawerOverlay} onClick={onClose}>
      <div
        className={styles.drawer}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeBtn} onClick={onClose}>
          &times;
        </button>

        <div className={styles.drawerHeader}>
          <img
            src={userDetails?.avatar || "https://via.placeholder.com/60"}
            alt={userDetails?.username}
            className={styles.profileAvatar}
          />
          <div>
            <h3>{userDetails?.username}</h3>
            <p>@{userDetails?.username}</p>
          </div>
        </div>

        <nav className={styles.drawerMenu}>
          <a href="#">New Group</a>
          <a href="#">Contacts</a>
          <a href="#">Calls</a>
          <a href="#">Settings</a>
          <a href="#">Night Mode</a>
          <a href="#">Log Out</a>
        </nav>
      </div>
    </div>
  );
}
