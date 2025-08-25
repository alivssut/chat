import React, { useState, useEffect } from "react";
import styles from "./ChatPage.module.css";
import ChatRoomPage from "./ChatRoomPage";
import { getChatRoomList, updateChatList } from "../chatSlice";
import { useDispatch, useSelector } from "react-redux";
import HamburgerMenu from "../../ui/Menu/HamburgerMenu";
import { useParams, useNavigate } from "react-router-dom";
import groupIMG from "../../../assets/images/group_default.png";
import useWebSocket, { ReadyState } from "react-use-websocket";

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const dispatch = useDispatch();
  const { chatRoomList } = useSelector((state) => state.chat);
  const [menuOpen, setMenuOpen] = useState(false);
  const { room_id } = useParams();
  const navigate = useNavigate();

  const user = { id: 1, name: "John Doe", username: "johndoe", avatar: "" };

  useEffect(() => {
    if (room_id) {
      setSelectedChat(room_id);
    }
  }, [room_id]);

  // Load initial chat list from API
  useEffect(() => {
    dispatch(getChatRoomList());
  }, [dispatch]);

  // ✅ WebSocket for chat list
  const { lastMessage, readyState } = useWebSocket(`ws://localhost/ws/rooms/`, {
    shouldReconnect: () => true,
    reconnectAttempts: 10,
    reconnectInterval: 3000,
    onOpen: () => console.log("✅ WS connected for chat list"),
    onClose: () => console.log("❌ WS disconnected from chat list"),
    onError: (err) => console.error("Chat list WS error:", err),
  });

  // handle incoming messages
  useEffect(() => {
    if (lastMessage !== null) {
      try {
        const data = JSON.parse(lastMessage.data);
        console.log("📩 Chat list update:", data);
        dispatch(updateChatList(data));
      } catch (e) {
        console.error("Parse error:", e);
      }
    }
  }, [lastMessage, dispatch]);

  const sortedChats = [...chatRoomList].sort((a, b) => {
    const aTime = a.last_message?.created_at
      ? new Date(a.last_message.created_at).getTime()
      : 0;
    const bTime = b.last_message?.created_at
      ? new Date(b.last_message.created_at).getTime()
      : 0;
    return bTime - aTime;
  });

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${
          selectedChat && styles.hideOnMobile
        }`}
      >
        <div className={styles.sidebarHeader}>
          <button
            className={styles.hamburgerBtn}
            onClick={() => setMenuOpen(true)}
          >
            &#9776;
          </button>
          <div className={styles.searchWrapper}>
            <input type="text" placeholder="🔍 Search" />
          </div>
        </div>

        {/* Chat List */}
        <div className={styles.chatList}>
          {sortedChats.map((chat) => {
            let chatIcon = "💬";
            if (chat.room_type === "private") chatIcon = "👤";
            if (chat.room_type === "group") chatIcon = "👥";
            if (chat.room_type === "channel") chatIcon = "📢";

            const lastMsgTime = chat.last_message?.created_at
              ? new Date(chat.last_message.created_at).toLocaleTimeString(
                  [],
                  { hour: "2-digit", minute: "2-digit" }
                )
              : "";

            return (
              <div
                key={chat.id}
                className={`${styles.chatItem} ${
                  selectedChat === chat.id ? styles.active : ""
                }`}
                onClick={() => {
                  if (selectedChat !== chat.id) {
                    setSelectedChat(chat.id);
                    navigate(`/${chat.id}`);
                  }
                }}
              >
                <div className={styles.chatLeft}>
                  <div className={styles.avatarWrapper}>
                    <img
                      src={chat.avatar ? chat.avatar : groupIMG}
                      alt={chat.name || "User"}
                      className={styles.avatar}
                    />
                    {true && <span className={styles.onlineDot}></span>}
                  </div>
                  <div className={styles.chatInfo}>
                    <h4>
                      {chatIcon} {chat.name}
                    </h4>
                    <p>{chat.last_message?.text || "No messages yet"}</p>
                  </div>
                </div>
                <div className={styles.chatRight}>
                  {lastMsgTime && (
                    <span className={styles.lastMsgTime}>{lastMsgTime}</span>
                  )}
                  {chat.unread_count > 0 && (
                    <span className={styles.unreadBadge}>
                      {chat.unread_count}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Chat Room */}
      <main
        className={`${styles.chatRoomWrapper} ${
          !selectedChat && styles.hideOnMobile
        }`}
      >
        {selectedChat ? (
          <ChatRoomPage
            room_id={selectedChat}
            onBack={() => {
              setSelectedChat(null);
              navigate("/");
            }}
          />
        ) : (
          <div className={styles.emptyChat}>
            <p>Select a chat to start messaging</p>
          </div>
        )}
      </main>

      <HamburgerMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        user={user}
      />
    </div>
  );
}
