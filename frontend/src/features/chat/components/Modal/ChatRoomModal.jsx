import React, { useEffect } from "react";
import styles from "./ChatRoomModal.module.css";
import { FaTimes, FaUsers } from "react-icons/fa";
import { getChatRoomMembers, getChatRoomDetail } from "../../chatSlice";
import { useDispatch, useSelector } from "react-redux";

export default function ChatRoomModal({ isOpen, onClose, chatRoom, room_id }) {
  const dispatch = useDispatch();
  const { loading, chatRoomMembers, chatRoomDetail } = useSelector((state) => state.chat);

  useEffect(() => {
    if (room_id) {
      dispatch(getChatRoomMembers(room_id));
      dispatch(getChatRoomDetail(room_id));
    }
  }, [dispatch]);

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
          <img src={chatRoomDetail?.avatar} alt={chatRoomDetail?.name} className={styles.groupAvatar} />
          <div className={styles.groupDetails}>
            <h2>{chatRoomDetail?.name}</h2>
            <p><FaUsers /> {chatRoomDetail?.members.length} Members</p>
          </div>
        </div>

        {/* Optional: Description */}
        {chatRoomDetail?.description && (
          <div className={styles.description}>
            <p>{chatRoomDetail?.description}</p>
          </div>
        )}

        {/* Members List Section */}
        <div className={styles.membersSection}>
            <h4>Members</h4>
            <ul className={styles.memberList}>
                {chatRoomMembers.map((member) => (
                <li key={member.id} className={styles.memberItem}>
                    <img
                    src={member.profile.avatar || "/default-avatar.png"}
                    alt={member.username}
                    className={styles.memberAvatar}
                    />
                    <span className={styles.memberName}>{member.username}</span>
                    {member.role === "admin" && <span className={styles.adminBadge}>Admin</span>}
                </li>
                ))}
            </ul>
        </div>

      </div>
    </div>
  );
}
