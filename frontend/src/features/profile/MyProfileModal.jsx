import React, { useState, useEffect } from "react";
import styles from "./MyProfileModal.module.css";
import defaultAvatar from "../../assets/images/group_default.png";
import { useDispatch, useSelector } from "react-redux";
import { getUserDetails } from "../auth/authSlice";

export default function ProfileModal({ isOpen, onClose, onSave }) {
  const dispatch = useDispatch();
  const { loading, userDetails } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    if (isOpen) {
      dispatch(getUserDetails());
      setIsEditing(false);
    }
  }, [dispatch, isOpen]);

  useEffect(() => {
    if (userDetails) {
      setName(userDetails.name || "");
      setUsername(userDetails.username || "");
      setAvatar(userDetails.avatar || null);
    }
  }, [userDetails]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    onSave({ name, username, avatar });
    setIsEditing(false);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2>Profile</h2>
          {!isEditing ? (
            <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
              ✏️ Edit
            </button>
          ) : (
            <button className={styles.cancelEditBtn} onClick={() => setIsEditing(false)}>
              ❌ Cancel
            </button>
          )}
        </div>

        {/* Avatar */}
        <div className={styles.avatarWrapper}>
          <img src={avatar || defaultAvatar} alt="Avatar" className={styles.avatar} />
          {isEditing && <input type="file" accept="image/*" onChange={handleAvatarChange} />}
        </div>

        {/* Fields */}
        <div className={styles.field}>
          <label>Name</label>
          {!isEditing ? (
            <p className={styles.readonlyText}>{name}</p>
          ) : (
            <input value={name} onChange={(e) => setName(e.target.value)} />
          )}
        </div>

        <div className={styles.field}>
          <label>Username</label>
          {!isEditing ? (
            <p className={styles.readonlyText}>@{username}</p>
          ) : (
            <input value={username} onChange={(e) => setUsername(e.target.value)} />
          )}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {!isEditing ? (
            <button className={styles.closeBtn} onClick={onClose}>Close</button>
          ) : (
            <>
              <button className={styles.cancelBtn} onClick={() => setIsEditing(false)}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleSave}>Save</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
