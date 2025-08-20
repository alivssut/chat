import React from "react";
import styles from "./ChatRoomModal.module.css";
import { FaTimes, FaUsers } from "react-icons/fa";

export default function ChatRoomModal({ isOpen, onClose, chatRoom }) {
  if (!isOpen || !chatRoom) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        {/* Header Bar */}
        <div className={styles.headerBar}>
            <h3>Group Info</h3>
            <button className={styles.closeBtn} onClick={onClose}><FaTimes /></button>
        </div>


        {/* Group Info Section */}
        <div className={styles.groupInfo}>
          <img src={chatRoom.avatar} alt={chatRoom.name} className={styles.groupAvatar} />
          <div className={styles.groupDetails}>
            <h2>{chatRoom.name}</h2>
            <p><FaUsers /> {chatRoom.members.length} Members</p>
          </div>
        </div>

        {/* Optional: Description */}
        {chatRoom.description && (
          <div className={styles.description}>
            <p>{chatRoom.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
