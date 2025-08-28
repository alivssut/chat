import axios from "axios";
import axiosInstance from '../../services/axiosConfig';

import { addMessage, setStatus, setSocket, clearMessages } from "./chatSlice";

let ws = null;
let reconnectTimer = null;

export const connectWebSocket = (roomId) => (dispatch) => {
  dispatch(setStatus("connecting"));

  ws = new WebSocket(`ws://localhost/ws/chat/${roomId}/`);

  ws.onopen = () => {
    dispatch(setStatus("connected"));
    dispatch(setSocket(ws));
    console.log("✅ WebSocket connected to room:", roomId);
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
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
      dispatch(addMessage(normalized));
    } catch (err) {
      console.error("Invalid WS message:", event.data);
    }
  };

  ws.onclose = () => {
    dispatch(setStatus("disconnected"));
    console.log("❌ WebSocket disconnected. Reconnecting...");
    reconnectTimer = setTimeout(() => {
      dispatch(connectWebSocket(roomId));
    }, 3000);
  };

  ws.onerror = (err) => {
    console.error("⚠️ WebSocket error:", err);
    ws.close();
  };
};

export const disconnectWebSocket = () => (dispatch) => {
  if (ws) {
    ws.close();
    ws = null;
  }
  if (reconnectTimer) clearTimeout(reconnectTimer);
  dispatch(setStatus("disconnected"));
  dispatch(clearMessages());
};

export const sendMessageWS = (message) => (dispatch, getState) => {
  const { socket } = getState().chat;
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  } else {
    console.warn("⚠️ Cannot send message: socket is not open");
  }
};


export const fetchChatRoomList = async () => {
  const response = await axiosInstance.get("/chat/rooms/");
  return response.data;
};

export const fetchChatRoomMessageList = async (room_id) => {
  const response = await axiosInstance.get(`/chat/room/messages/${room_id}/`);
  return response.data;
};

export const fetchChatRoomDetail = async (room_id) => {
  const response = await axiosInstance.get(`/chat/rooms/${room_id}/`);
  return response.data;
};

export const fetchChatRoomMembers = async (room_id) => {
  const response = await axiosInstance.get(`/chat/rooms/${room_id}/members/`);
  return response.data;
};

export const fetchUserContacts = async () => {
  const response = await axiosInstance.get(`/user/contacts/`);
  return response.data;
};

export const createChatRoom = async (payload) => {
  const response = await axiosInstance.post("/chat/rooms/create-group/", payload);
  return response.data;
};

export const createChannelRoom = async (payload) => {
  const response = await axiosInstance.post("/chat/rooms/create-channel/", payload);
  return response.data;
};

export const fetchUserRoomRole = async (room_id) => {
  const response = await axiosInstance.get(`/chat/room/${room_id}/role/`);
  return response.data;
};

export const updateRoomAvatar = async (roomId, file) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await axiosInstance.patch(`chat/rooms/${roomId}/avatar/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};