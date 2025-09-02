import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  fetchChatRoomList, fetchChatRoomMessageList, fetchChatRoomDetail,
   fetchChatRoomMembers, fetchUserContacts, createChatRoom,
    createChannelRoom, fetchUserRoomRole, updateRoomAvatar,
     updateRoomDetails, fetchUserContactsForRoom, addUserToRoom } from './chatAPI';

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

export const getUserRoomRole = createAsyncThunk(
  "chat/getUserRoomRole",
  async (room_id) => {
    return await fetchUserRoomRole(room_id);
  }
);

export const changeRoomAvatar = createAsyncThunk(
  "chat/changeRoomAvatar",
  async ({ roomId, file }) => {
    return await updateRoomAvatar(roomId, file);
  }
);

export const changeRoomDetails = createAsyncThunk(
  "chat/changeRoomDetails",
  async ({ roomId, file, name, description }) => {
    return await updateRoomDetails(roomId, { file, name, description });
  }
);

export const getUserContactsForRoom = createAsyncThunk(
  "chat/getUserContactsForRoom",
  async (room_id) => {
    return await fetchUserContactsForRoom(room_id);
  }
);

export const addMemberToRoom = createAsyncThunk(
  "chat/addMemberToRoom",
  async ({ room_id, user_id }) => {
    return await addUserToRoom({room_id, user_id});
  }
);

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
    userRoomRole: null,
    userContacts: false,
    userContactsForRoom: [],
    loading: {
        getChatRoomList: false,
        getChatRoomMessageList: false,
        getChatRoomDetail: false,
        getChatRoomMembers: false,
        getUserContacts: false,
        createRoom: false,
        createChannelRoom: false,
        getUserRoomRole: false,
        changeRoomDetails: false,
        getUserContactsForRoom: false,
        addMemberToRoom: false,
    },
    error: {
        getChatRoomList: null,
        getChatRoomMessageList: null,
        getChatRoomDetail: null,
        getChatRoomMembers: null,
        getUserContacts: null,
        createRoom: null,
        createChannelRoom: null,
        getUserRoomRole: null,
        changeRoomDetails: null,
        getUserContactsForRoom: null,
        addMemberToRoom: null,
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
      console.log(updatedRoom)
      const index = state.chatRoomList.findIndex(room => room.id === updatedRoom.room_id);
    
      if (index !== -1) {
        state.chatRoomList[index] = { ...state.chatRoomList[index], ...updatedRoom };
    
        const [room] = state.chatRoomList.splice(index, 1);
        state.chatRoomList.unshift(room);
      } else {
        state.chatRoomList.unshift(updatedRoom);
      }
    },
    patchChatRoomDetail(state, action) {
      // payload: { room_id, patch: { avatar?, name?, updated_at?, ... } }
      const { room_id, patch } = action.payload || {};
      if (!room_id || !patch) return;
      if (
        state.chatRoomDetail &&
        String(state.chatRoomDetail.id) === String(room_id)
      ) {
        state.chatRoomDetail = { ...state.chatRoomDetail, ...patch };
      }

      // const idx = state.chatRoomList.findIndex(
      //   (r) => String(r.id) === String(room_id)
      // );
      // if (idx !== -1) {
      //   state.chatRoomList[idx] = { ...state.chatRoomList[idx], ...patch };
      // }
    },
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


    builder.addCase(getUserRoomRole.pending, (state) => {
      state.loading.getUserRoomRole = true;
    });
    builder.addCase(getUserRoomRole.fulfilled, (state, action) => {
      state.userRoomRole = action.payload.role;
      state.loading.getUserRoomRole = false;
    });
    builder.addCase(getUserRoomRole.rejected, (state, action) => {
      state.userRoomRole = null;
      state.loading.getUserRoomRole = false;
      state.error.getUserRoomRole = action.error.message;
    });


    builder.addCase(changeRoomDetails.pending, (state) => {
      state.loading.changeRoomDetails = true;
    });
    builder.addCase(changeRoomDetails.fulfilled, (state, action) => {
      state.loading.changeRoomDetails = false;
      state.chatRoomDetail = action.payload;
    });
    builder.addCase(changeRoomDetails.rejected, (state, action) => {
      state.loading.changeRoomDetails = false;
      state.error.changeRoomDetails = action.error.message;
    });

    builder.addCase(getUserContactsForRoom.pending, (state) => {
      state.loading.getUserContactsForRoom = true;
    });
    builder.addCase(getUserContactsForRoom.fulfilled, (state, action) => {
      state.userContactsForRoom = action.payload;
      state.loading.getUserContactsForRoom = false;
    });
    builder.addCase(getUserContactsForRoom.rejected, (state, action) => {
      state.loading.getUserContactsForRoom = false;
      state.error.getUserContactsForRoom = action.error.message;
    });

    builder.addCase(addMemberToRoom.pending, (state) => {
      state.loading.addMemberToRoom = true;
    });
    builder.addCase(addMemberToRoom.fulfilled, (state, action) => {
      state.loading.addMemberToRoom = false;
      
      const userId = action.payload.member.user_id;
      const contactIdx = state.userContactsForRoom.findIndex(
        (contact) => contact.user_id === userId
      );
      if (contactIdx !== -1) {
        state.userContactsForRoom[contactIdx].is_member = true;
      }
    });
    builder.addCase(addMemberToRoom.rejected, (state, action) => {
      state.loading.addMemberToRoom = false;
      state.error.addMemberToRoom = action.error.message;
    });

  },
});

export const { setSocket, setStatus, addMessage, clearMessages, updateChatList, patchChatRoomDetail } = chatSlice.actions;
export default chatSlice.reducer;
