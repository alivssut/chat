import React, { useEffect, useState } from "react";
import styles from "./ContactsModal.module.css";
import { getUserContacts } from "../../chatSlice";
import { useDispatch, useSelector } from "react-redux";

export default function ContactsModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { loading, userContacts } = useSelector((state) => state.chat);

  useEffect(() => {
    dispatch(getUserContacts());
  }, [dispatch]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeBtn} onClick={onClose}>
          &times;
        </button>

        <h2 className={styles.modalTitle}>My Contacts</h2>

        <div className={styles.contactsList}>
          {userContacts.length > 0 ? (
            userContacts.map((contact) => (
              <div key={contact.id} className={styles.contactItem}>
                <img
                  src={contact.avatar || "/default-avatar.png"}
                  alt={contact.username}
                  className={styles.contactAvatar}
                />
                <div className={styles.contactInfo}>
                  <strong>{contact.display_name || contact.username}</strong>
                  <span>@{contact.username}</span>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.emptyMsg}>No contacts found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
