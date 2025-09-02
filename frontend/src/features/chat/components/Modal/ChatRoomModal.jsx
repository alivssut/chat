import React, { useEffect, useRef, useState } from "react";
import styles from "./ChatRoomModal.module.css";
import { FaTimes, FaUsers, FaCamera, FaEllipsisV, FaUserPlus, FaCog } from "react-icons/fa";
import { getChatRoomMembers, getChatRoomDetail, changeRoomAvatar, patchChatRoomDetail, changeRoomDetails, getUserContactsForRoom, addMemberToRoom } from "../../chatSlice";
import { useDispatch, useSelector } from "react-redux";

export default function ChatRoomModal({ isOpen, onClose, chatRoom, room_id, user_role }) {
  const dispatch = useDispatch();
  const { chatRoomMembers, chatRoomDetail, userContactsForRoom } = useSelector((state) => state.chat);
  const fileInputRef = useRef(null);

  const [showDropdown, setShowDropdown] = useState(false);

  const [contactsForRoom, setContactsForRoom] = useState([])
  
  const [modalMode, setModalMode] = useState("info"); // "info" | "settings" | "addMember"
  const [newName, setNewName] = useState(chatRoomDetail?.name || "");
  const [newAvatar, setNewAvatar] = useState(chatRoomDetail?.avatar || "");

  useEffect(() => {
    if (room_id) {
      dispatch(getChatRoomMembers(room_id));
      dispatch(getChatRoomDetail(room_id));
    }
  }, [dispatch, room_id]);

  useEffect(() => {
    if (room_id && modalMode === "addMember") {
      dispatch(getUserContactsForRoom(room_id))
    }
  }, [dispatch, room_id, modalMode]);
  

  useEffect(() => {
    setNewName(chatRoomDetail?.name || "");
    setNewAvatar(chatRoomDetail?.avatar || "");
  }, [chatRoomDetail]);

  const handleClickAvatar = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setNewAvatar(localUrl);
      dispatch(patchChatRoomDetail({ room_id, patch: { avatar: localUrl } }));
      dispatch(changeRoomAvatar({ roomId: room_id, file }));
    }
  };

  const handleSaveChanges = () => {

    dispatch(changeRoomDetails({ roomId: room_id, file: null, name: newName })).unwrap()
    .then((updatedRoom) => {
       dispatch(patchChatRoomDetail({ room_id, patch: updatedRoom }));
          setModalMode("info");
        })
        .catch((err) => {
          console.error("Failed to update room:", err);
        });
    };

  const handleAddMember = (user_id) => {
    dispatch(addMemberToRoom({room_id, user_id}))
  };
    

  if (!isOpen || !chatRoom) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>

        {/* Header Bar */}
        <div className={styles.headerBar}>
          <h3>
            {modalMode === "info" && (
              <>
                {chatRoomDetail?.room_type === "group" && "Group Info"}
                {chatRoomDetail?.room_type === "channel" && "Channel Info"}
                {chatRoomDetail?.room_type === "private" && "Private Info"}
              </>
            )}
            {modalMode === "settings" && "Group Settings"}
          </h3>

          <div className={styles.headerActions}>
            {modalMode === "info" && (
              <div className={styles.dropdownWrapper}>
                <button onClick={() => setShowDropdown((prev) => !prev)} className={styles.dropdownBtn}>
                  <FaEllipsisV />
                </button>
                {showDropdown && (
                  <div className={styles.dropdownMenu}>
                    {chatRoomDetail?.room_type !== "private" && (
                      <button onClick={() => setModalMode("addMember")}>
                        <FaUserPlus style={{ marginRight: "6px" }} /> Add Member
                      </button>
                    )}
                    {user_role === "admin" && (
                      <button onClick={() => setModalMode("settings")}>
                        <FaCog style={{ marginRight: "6px" }} /> Manage Room
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            <button className={styles.closeBtn} onClick={onClose}><FaTimes /></button>
          </div>
        </div>

        {/* Group Info Section */}
        {modalMode === "info" && (
          <>
            <div className={styles.groupInfo}>
              <div className={styles.avatarWrapper}>
                <img
                  src={newAvatar || "/default-avatar.png"}
                  alt={newName}
                  className={styles.groupAvatar}
                />
                {user_role === "admin" && (
                  <>
                    <button onClick={handleClickAvatar} className={styles.changeAvatarBtn}>
                      <FaCamera className={styles.cameraIcon} />
                    </button>
                    <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*" onChange={handleFileChange} />
                  </>
                )}
              </div>

              <div className={styles.groupDetails}>
                <h2>{newName}</h2>
                <p><FaUsers /> {chatRoomDetail?.members.length} Members</p>
              </div>
            </div>

            {chatRoomDetail?.description && (
              <div className={styles.description}>
                <p>{chatRoomDetail?.description}</p>
              </div>
            )}

            <div className={styles.membersSection}>
              <h4>Members</h4>
              <ul className={styles.memberList}>
                {chatRoomMembers.map((member) => (
                  <li key={member.id} className={styles.memberItem}>
                    <img src={member?.profile?.avatar || "/default-avatar.png"} alt={member.username} className={styles.memberAvatar} />
                    <span className={styles.memberName}>{member.username}</span>
                    {member.role === "admin" && <span className={styles.adminBadge}>Admin</span>}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Settings Mode */}
        {modalMode === "settings" && user_role === "admin" && (
          <div className={styles.groupSettings}>
            <div className={styles.avatarWrapper}>
              <img
                src={newAvatar || "/default-avatar.png"}
                alt={newName}
                className={styles.groupAvatar}
              />
              <button onClick={handleClickAvatar} className={styles.changeAvatarBtn}>
                <FaCamera className={styles.cameraIcon} />
              </button>
              <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*" onChange={handleFileChange} />
            </div>

            <div className={styles.groupDetails}>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className={styles.editNameInput}
              />
            </div>

            <div className={styles.editActions}>
              <button className={styles.saveBtn} onClick={handleSaveChanges}>Save</button>
              <button className={styles.cancelBtn} onClick={() => setModalMode("info")}>Cancel</button>
            </div>
          </div>
        )}

        {modalMode === "addMember" && user_role === "admin" && (
          <div className={styles.addMemberSection}>
            <h4>Select Contacts to Add</h4>
            {userContactsForRoom.length === 0 ? (
              <p>No contacts available to add.</p>
            ) : (
              <ul className={styles.memberList}>
                {userContactsForRoom.map(contact => (
                  <li key={contact.id} className={styles.memberItem}>
                    <img src={contact.avatar || "/default-avatar.png"} alt={contact.display_name} className={styles.memberAvatar} />
                    <span className={styles.memberName}>{contact.display_name}</span>
                    
                    {contact.is_member ? (
                      <span className={styles.alreadyMemberBadge}>✔</span>
                    ) : (
                      <button
                        className={styles.addBtn}
                        onClick={() => handleAddMember(contact.contact_user)}
                      >
                        Add
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <button className={styles.cancelBtn} onClick={() => setModalMode("info")}>Back</button>
          </div>
        )}


      </div>
    </div>
  );
}
