import React, { useEffect, useState } from "react";
import styles from "./HamburgerMenu.module.css";
import { useDispatch, useSelector } from "react-redux";
import { getUserDetails, logout  } from "../../auth/authSlice";
import NewGroupModal from "../../chat/components/Modal/NewGroupModal";
import NewChannelModal from "../../chat/components/Modal/NewChannelModal";
import ContactsModal from "../../chat/components/Modal/ContactsModal";
import MyProfileModal from "../../profile/MyProfileModal";
import TokenService from "../../../utils/tokenService"

export default function HamburgerMenu({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { loading, userDetails } = useSelector((state) => state.auth);
  const [openGroupModal, setOpenGroupModal] = useState(false);
  const [openChannelModal, setOpenChannelModal] = useState(false);
  const [openMyProfileModal, setOpenMyProfileModal] = useState(false);
  const [openContactsModal, setOpenContactsModal] = useState(false);

  useEffect(() => {
    if(!userDetails)
    dispatch(getUserDetails());
  }, [dispatch, isOpen]);


  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
    } catch (err) {
      console.error("Logout error:", err);
    }
    onClose();
  };


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
            src={userDetails?.avatar || ""}
            alt={userDetails?.username}
            className={styles.profileAvatar}
          />
          <div>
            <h3>{userDetails?.username}</h3>
            <p>@{userDetails?.username}</p>
          </div>
        </div>

        <nav className={styles.drawerMenu}>
          <a onClick={() => setOpenGroupModal(true)}>➕ New Group</a>
          <a onClick={() => setOpenChannelModal(true)}>➕ New Channel</a>
          <a onClick={() => setOpenMyProfileModal(true)}>My Profile</a>
          <a onClick={() => setOpenContactsModal(true)}>Contacts</a>
          <a href="#">Settings</a>
          <a onClick={handleLogout}>🚪 Log Out</a>
        </nav>
      </div>

      {openGroupModal && (
        <NewGroupModal
          isOpen={openGroupModal}
          onClose={() => setOpenGroupModal(false)}
        />
      )}

      {openChannelModal && (
        <NewChannelModal
          isOpen={openChannelModal}
          onClose={() => setOpenChannelModal(false)}
        />
      )}

      {openMyProfileModal && (
        <MyProfileModal
          isOpen={openMyProfileModal}
          onClose={() => setOpenMyProfileModal(false)}
        />
      )}

      {openContactsModal && (
        <ContactsModal
          isOpen={openContactsModal}
          onClose={() => setOpenContactsModal(false)}
        />
      )}

    </div>
  );
}
