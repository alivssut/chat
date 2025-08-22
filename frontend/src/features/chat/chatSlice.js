import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchChatRoomList, fetchChatRoomMessageList, fetchChatRoomDetail, fetchChatRoomMembers, fetchUserContacts, createChatRoom, createChannelRoom } from './chatAPI';

export const getChatRoomList = createAsyncThunk("chat/rooms", async () => {
  return await fetchChatRoomList();
});

export const getChatRoomMessageList = createAsyncThunk("chat/getChatRoomMessageList", async (room_id) => {
  return await fetchChatRoomMessageList(room_id);
});

export const getChatRoomDetail = createAsyncThunk("chat/getChatRoomDetailList", async (room_id) => {
  return await fetchChatRoomDetail(room_id);
});

export const getChatRoomMembers = createAsyncThunk("chat/getChatRoomMemberlList", async (room_id) => {
  return await fetchChatRoomMembers(room_id);
});

export const getUserContacts = createAsyncThunk("chat/getUserContacts", async () => {
  return await fetchUserContacts();
});

export const createRoom = createAsyncThunk("chat/createRoom", async (payload) => {
  return await createChatRoom(payload);
});

export const createChannel = createAsyncThunk("chat/createChannelRoom", async (payload) => {
  return await createChannelRoom(payload);
});

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [],
    status: "disconnected",
    socket: null,
    chatRoomList: [],
    chatRoomMessageList: [],
    chatRoomMembers: [],
    chatRoomDetail: null,
    userContacts: false,
    loading: {
        getChatRoomList: false,
        getChatRoomMessageList: false,
        getChatRoomDetail: false,
        getChatRoomMembers: false,
        getUserContacts: false,
        createRoom: false,
        createChannelRoom: false,
    },
    error: {
        getChatRoomList: null,
        getChatRoomMessageList: null,
        getChatRoomDetail: null,
        getChatRoomMembers: null,
        getUserContacts: null,
        createRoom: null,
        createChannelRoom: null,
    },
  },
  reducers: {
    setSocket(state, action) {
      state.socket = action.payload;
    },
    setStatus(state, action) {
      state.status = action.payload;
    },
    addMessage(state, action) {
      state.chatRoomMessageList.push(action.payload);
    },
    clearMessages(state) {
      state.chatRoomMessageList = [];
    },
    updateChatList(state, action) {
      const updatedRoom = action.payload;
      const index = state.chatRoomList.findIndex(room => room.id === updatedRoom.room_id);
    
      if (index !== -1) {
        state.chatRoomList[index] = { ...state.chatRoomList[index], ...updatedRoom };
    
        const [room] = state.chatRoomList.splice(index, 1);
        state.chatRoomList.unshift(room);
      } else {
        state.chatRoomList.unshift(updatedRoom);
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(getChatRoomList.pending, (state) => {
      state.loading.getChatRoomList = true;
    });
    builder.addCase(getChatRoomList.fulfilled, (state, action) => {
      state.chatRoomList = action.payload;
      state.loading.getChatRoomList = false;
    });
    builder.addCase(getChatRoomList.rejected, (state, action) => {
      state.loading.getChatRoomList = false;
      state.error.getChatRoomList = action.error.message;
    });

    builder.addCase(getChatRoomMessageList.pending, (state) => {
      state.loading.getChatRoomMessageList = true;
    });
    builder.addCase(getChatRoomMessageList.fulfilled, (state, action) => {
      state.chatRoomMessageList = action.payload;
      state.loading.getChatRoomMessageList = false;
    });
    builder.addCase(getChatRoomMessageList.rejected, (state, action) => {
      state.loading.getChatRoomMessageList = false;
      state.error.getChatRoomMessageList = action.error.message;
    });

    builder.addCase(getChatRoomDetail.pending, (state) => {
      state.loading.getChatRoomDetail = true;
    });
    builder.addCase(getChatRoomDetail.fulfilled, (state, action) => {
      state.chatRoomDetail = action.payload;
      state.loading.getChatRoomDetail = false;
    });
    builder.addCase(getChatRoomDetail.rejected, (state, action) => {
      state.loading.getChatRoomDetail = false;
      state.error.getChatRoomDetail = action.error.message;
    });

    builder.addCase(getChatRoomMembers.pending, (state) => {
      state.loading.getChatRoomMembers = true;
    });
    builder.addCase(getChatRoomMembers.fulfilled, (state, action) => {
      state.chatRoomMembers = action.payload;
      state.loading.getChatRoomMembers = false;
    });
    builder.addCase(getChatRoomMembers.rejected, (state, action) => {
      state.loading.getChatRoomMembers = false;
      state.error.getChatRoomMembers = action.error.message;
    });

    builder.addCase(getUserContacts.pending, (state) => {
      state.loading.getUserContacts = true;
    });
    builder.addCase(getUserContacts.fulfilled, (state, action) => {
      state.userContacts = action.payload;
      state.loading.getUserContacts = false;
    });
    builder.addCase(getUserContacts.rejected, (state, action) => {
      state.loading.getUserContacts = false;
      state.error.getUserContacts = action.error.message;
    });

    builder.addCase(createRoom.pending, (state) => {
      state.loading.createRoom = true;
    });
    builder.addCase(createRoom.fulfilled, (state, action) => {
      state.loading.createRoom = false;
      // state.chatRoomList.unshift(action.payload);
    });
    builder.addCase(createRoom.rejected, (state, action) => {
      state.loading.createRoom = false;
      state.error.createRoom = action.error.message;
    });


    builder.addCase(createChannel.pending, (state) => {
      state.loading.createChannelRoom = true;
    });
    builder.addCase(createChannel.fulfilled, (state, action) => {
      state.loading.createChannelRoom = false;
      // state.chatRoomList.unshift(action.payload);
    });
    builder.addCase(createChannel.rejected, (state, action) => {
      state.loading.createChannelRoom = false;
      state.error.createChannelRoom = action.error.message;
    });

  },
});

export const { setSocket, setStatus, addMessage, clearMessages, updateChatList  } = chatSlice.actions;
export default chatSlice.reducer;
