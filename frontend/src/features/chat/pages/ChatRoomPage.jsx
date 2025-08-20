import React, { useEffect, useRef, useState } from "react";
import styles from "./ChatRoomPage.module.css";
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "../../auth/authSlice";
import { getChatRoomMessageList, getChatRoomDetail } from "../chatSlice";
import ChatRoomModal from "../components/Modal/ChatRoomModal";

export default function ChatRoomPage({ room_id, onBack }) {
  const dispatch = useDispatch();
  const { loading: userLoading, user } = useSelector((state) => state.auth);
  const { loading: chatLoading, chatRoomMessageList, chatRoomDetail } = useSelector(
    (state) => state.chat
  );

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [showModal, setShowModal] = useState(false);

  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");

  const chatRoom = {
    id: room_id,
    name: "Chat Room Example",
    avatar: "https://via.placeholder.com/60",
    members: ["Ali", "Sara", "John"],
    description: "این یک چت روم تستی است",
    createdAt: "2025-08-17"
  };

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
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);
  

  // Fetch user if not loaded
  useEffect(() => {
    if (!user && !userLoading) {
      dispatch(getUser());
    }
  }, [dispatch, user, userLoading]);

  // Fetch previous messages
  useEffect(() => {
    if (room_id) {
      // dispatch(connectWebSocket(room_id));
      dispatch(getChatRoomDetail(room_id));
      dispatch(getChatRoomMessageList(room_id));
    }
    // return () => {
    //   dispatch(disconnectWebSocket());
    // };
  }, [dispatch, room_id]);

  // Sync messages from Redux to local state
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

  // WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token || !room_id) return;

    const ws = new WebSocket(`ws://localhost/ws/room/${room_id}/`);
    socketRef.current = ws;

    ws.onopen = () => console.log("WebSocket connected");
    ws.onclose = () => console.log("WebSocket disconnected");
    ws.onerror = (err) => console.error("WebSocket error:", err);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data)
      // normalize
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
    };

    return () => {
      ws.close();
    };
  }, [room_id]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const sendMessage = () => {
    if (!messageInput.trim()) return;

    const payload = { text: messageInput.trim() };
    socketRef.current?.send(JSON.stringify(payload));
    setMessageInput("");
  };

  // const sendMessage = () => {
  //   if (!messageInput.trim()) return;
  //   dispatch(sendMessageWS({ text: messageInput.trim() }));
  //   setMessageInput("");
  // };

  if (userLoading.user || chatLoading.getChatRoomMessageList) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.chatContainer}>
      <header className={styles.chatHeader}>
        <button onClick={onBack} className={styles.backButton}>⬅</button>
        <img src={chatRoomDetail?.avatar} alt="avatar" className={styles.avatar} />
        <h4 onClick={() => chatRoomDetail?.room_type === "group" && setShowModal(true)}>
          {chatRoomDetail?.name}
        </h4>

        <div className={styles.dropdownWrapper} ref={dropdownRef}>
          <button className={styles.dropdownBtn} onClick={() => setShowDropdown(prev => !prev)}>⋮</button>

          {showDropdown && (
            <div className={styles.dropdownMenu}>
              {chatRoomDetail?.room_type === "group" && <button onClick={() => setShowModal(true)}>Group info</button>}
              {chatRoomDetail?.room_type !== "channel" && <button onClick={() => alert("Mute not implemented yet!")}>Mute</button>}
              {chatRoomDetail?.room_type !== "channel" && <button onClick={() => alert("Leave not implemented yet!")}>Leave {chatRoomDetail?.room_type}</button>}
            </div>
          )}
        </div>
      </header>


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
                <img src={msg.sender.avatar} alt="avatar" className={styles.msgAvatar} />
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

      {(chatRoomDetail?.room_type !== "channel" || chatRoomDetail?.user_role === "admin") && (
        <footer className={styles.inputContainer}>
          <input
            type="text"
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={!messageInput.trim()}
          >
            ➤
          </button>
        </footer>
      )}



      <ChatRoomModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        chatRoom={chatRoom}
        room_id={room_id}
      />
    </div>
  );
}
