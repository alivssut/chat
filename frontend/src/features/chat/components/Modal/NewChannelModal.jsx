// 📂 NewGroupModal.jsx
import React, { useState, useEffect } from "react";
import styles from "./NewGroupModal.module.css";
import { useDispatch, useSelector } from "react-redux";
import { getUserContacts, createChannel } from "../../chatSlice";
import groupIMG from "../../../../assets/images/group_default.png"
import { useNavigate } from 'react-router-dom';

export default function NewGroupModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [channelName, setChannelName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const { loading, userContacts } = useSelector((state) => state.chat);

  useEffect(() => {
    dispatch(getUserContacts());
  }, [dispatch]);

  if (!isOpen) return null;

  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = () => {
    if (!channelName || selectedMembers.length === 0) return;

    const newChannel = {
      name: channelName,
      members: selectedMembers,
    };

    dispatch(createChannel(newChannel))
      .unwrap()
      .then((createdRoom) => {
        console.log("📌 Channel created:", createdRoom);
        navigate(`/${createdRoom.id}`);
        onClose();
      })
      .catch((err) => {
        console.error("❌ Failed to create channel:", err);
      });
};

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {step === 1 && (
          <>
            <h2>Create New Channel</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep(2);
              }}
              className={styles.form}
            >
              <label>
                Group Name
                <input
                  type="text"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder="e.g. University Friends"
                  required
                />
              </label>

              <div className={styles.actions}>
                <button type="button" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit">Next ➡</button>
              </div>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Select Members</h2>
            <div className={styles.userList}>
              {userContacts.map((user) => (
                <div
                  key={user.id}
                  className={`${styles.userItem} ${
                    selectedMembers.includes(user.id) ? styles.selected : ""
                  }`}
                  onClick={() => toggleMember(user.id)}
                >
                  <img
                    src={user.avatar || groupIMG}
                    alt={user.username}
                  />
                  <span>{user.display_name}</span>
                </div>
              ))}
            </div>

            <div className={styles.actions}>
              <button type="button" onClick={() => setStep(1)}>
                ⬅ Back
              </button>
              <button type="button" onClick={handleSubmit}>
                ✅ Create Group
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
