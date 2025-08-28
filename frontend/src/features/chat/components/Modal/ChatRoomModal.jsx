import React, { useEffect, useRef } from "react";
import styles from "./ChatRoomModal.module.css";
import { FaTimes, FaUsers, FaCamera  } from "react-icons/fa";
import { getChatRoomMembers, getChatRoomDetail, changeRoomAvatar, patchChatRoomDetail } from "../../chatSlice";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

export default function ChatRoomModal({ isOpen, onClose, chatRoom, room_id, user_role }) {
  const dispatch = useDispatch();
  const { loading, chatRoomMembers, chatRoomDetail } = useSelector((state) => state.chat);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (room_id) {
      dispatch(getChatRoomMembers(room_id));
      dispatch(getChatRoomDetail(room_id));
    }
  }, [dispatch]);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      dispatch(patchChatRoomDetail({
        room_id,
        patch: { avatar: localUrl }
      }));
  
      dispatch(changeRoomAvatar({ roomId: room_id, file }));
    }
  };

  if (!isOpen || !chatRoom) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        {/* Header Bar */}
        <div className={styles.headerBar}>
        <h3>
          {chatRoomDetail?.room_type === "group" && "Group Info"}
          {chatRoomDetail?.room_type === "channel" && "Channel Info"}
          {chatRoomDetail?.room_type === "private" && "Private Info"}
        </h3>
            <button className={styles.closeBtn} onClick={onClose}><FaTimes /></button>
        </div>


        {/* Group Info Section */}
        <div className={styles.groupInfo}>
          <div className={styles.avatarWrapper}>
            <img
              src={chatRoomDetail?.avatar || "/default-avatar.png"}
              alt={chatRoomDetail?.name}
              className={styles.groupAvatar}
            />
            {user_role === "admin" && (
              <>
                <button
                  onClick={handleClick}
                className={styles.changeAvatarBtn}
                >
                  <FaCamera style={{ width: "16px", height: "16px", color: "white" }} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </>
            )}
          </div>
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
