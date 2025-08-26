import React, { useEffect, useRef, useState } from "react";
import styles from "./ChatRoomPage.module.css";
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "../../auth/authSlice";
import { getChatRoomMessageList, getChatRoomDetail } from "../chatSlice";
import ChatRoomModal from "../components/Modal/ChatRoomModal";
import groupIMG from "../../../assets/images/group_default.png";
import useWebSocket, { ReadyState } from "react-use-websocket";

export default function ChatRoomPage({ room_id, onBack }) {
  const dispatch = useDispatch();
  const { loading: userLoading, user } = useSelector((state) => state.auth);
  const { loading: chatLoading, chatRoomMessageList, chatRoomDetail } = useSelector(
    (state) => state.chat
  );

  const messagesEndRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");

  // ----------------------
  // Dropdown close handler
  // ----------------------
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  // ----------------------
  // Fetch user if not loaded
  // ----------------------
  useEffect(() => {
    if (!user && !userLoading) {
      dispatch(getUser());
    }
  }, [dispatch, user, userLoading]);

  // ----------------------
  // Fetch room detail & messages
  // ----------------------
  useEffect(() => {
    if (room_id) {
      dispatch(getChatRoomDetail(room_id));
      dispatch(getChatRoomMessageList(room_id));
    }
  }, [dispatch, room_id]);

  // ----------------------
  // Sync Redux → local messages
  // ----------------------
  useEffect(() => {
    if (chatRoomMessageList) {
      setMessages(
        chatRoomMessageList.map((msg) => ({
          id: msg.id,
          text: msg.content,
          timestamp: msg.created_at,
          sender: {
            id: msg.user,
            username: null,
            avatar: null,
          },
        }))
      );
    }
  }, [chatRoomMessageList]);

  // ----------------------
  // WebSocket with react-use-websocket
  // ----------------------
  const token = localStorage.getItem("access");
  const { sendJsonMessage, lastMessage, readyState } = useWebSocket(
    token && room_id ? `ws://localhost/ws/room/${room_id}/` : null,
    {
      shouldReconnect: () => true,
      reconnectInterval: 3000,
    }
  );

  // handle incoming message
  useEffect(() => {
    if (lastMessage !== null) {
      try {
        const data = JSON.parse(lastMessage.data);
        console.log("📩 New message:", data);
        const normalized = {
          id: data.id ?? Date.now(),
          text: data.text ?? data.content ?? "",
          timestamp: data.timestamp ?? data.created_at ?? new Date().toISOString(),
          sender: {
            id: data.sender ?? data.user ?? null,
            username: data.username ?? null,
            avatar: data.avatar ?? null,
          },
        };
        setMessages((prev) => [...prev, normalized]);
      } catch (err) {
        console.error("❌ Error parsing WS message:", err);
      }
    }
  }, [lastMessage]);

  // ----------------------
  // Scroll to bottom
  // ----------------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // ----------------------
  // Send message
  // ----------------------
  const sendMessage = () => {
    if (!messageInput.trim()) return;
    sendJsonMessage({ text: messageInput.trim() });
    setMessageInput("");
  };

  if (userLoading.user || chatLoading.getChatRoomMessageList) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.chatContainer}>
      <header className={styles.chatHeader}>
        <button onClick={onBack} className={styles.backButton}>⬅</button>
        <img
          src={chatRoomDetail?.avatar ? chatRoomDetail?.avatar : groupIMG}
          alt="avatar"
          className={styles.avatar}
        />
        <h4
          onClick={() =>
            chatRoomDetail?.room_type === "group" && setShowModal(true)
          }
        >
          {chatRoomDetail?.name}
        </h4>

        <div className={styles.dropdownWrapper} ref={dropdownRef}>
          <button
            className={styles.dropdownBtn}
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            ⋮
          </button>

          {showDropdown && (
            <div className={styles.dropdownMenu}>
              {chatRoomDetail && (
                <button onClick={() => setShowModal(true)}>
                  {({
                    group: "View Group Info",
                    channel: "View Channel Info",
                    private: "View Private Info"
                  }[chatRoomDetail.room_type])}
                </button>
              )}
              {chatRoomDetail?.room_type !== "channel" && (
                <button onClick={() => alert("Mute not implemented yet!")}>
                  Mute
                </button>
              )}
              {chatRoomDetail?.room_type !== "channel" && (
                <button
                  onClick={() =>
                    alert(`Leave ${chatRoomDetail?.room_type} not implemented yet!`)
                  }
                >
                  Leave {chatRoomDetail?.room_type}
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className={styles.messages}>
        {messages.map((msg, index) => {
          const isMine = user && msg.sender?.id === user.pk;
          return (
            <div
              key={msg.id ?? index}
              className={`${styles.message} ${
                isMine ? styles.myMessage : styles.theirMessage
              }`}
            >
              {!isMine && msg.sender?.avatar && (
                <img
                  src={msg.sender.avatar}
                  alt="avatar"
                  className={styles.msgAvatar}
                />
              )}
              <div className={styles.messageContent}>
                <p>{msg.text}</p>
                <span className={styles.time}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input box */}
      {(chatRoomDetail?.room_type !== "channel" ||
        chatRoomDetail?.user_role === "admin") && (
        <footer className={styles.inputContainer}>
          <input
            type="text"
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage} disabled={!messageInput.trim()}>
            ➤
          </button>
        </footer>
      )}

      <ChatRoomModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        chatRoom={chatRoomDetail}
        room_id={room_id}
      />
    </div>
  );
}
