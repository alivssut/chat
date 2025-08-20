import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login as loginAPI, register as registerAPI, logout as logoutAPI, getUser as getUserAPI, updateUser as updateUserAPI, changePassword as changePasswordAPI, fetchUserDetails as fetchUserDetailsAPI } from './authAPI';
import TokenService from "../../utils/tokenService";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export const login = createAsyncThunk('auth/login', async (credentials) => {
  return await loginAPI(credentials);
});

export const register = createAsyncThunk('auth/register', async (credentials) => {  
  return await registerAPI(credentials);
});

export const logout = createAsyncThunk('auth/logout', async () => {
  return await logoutAPI();
});

export const getUser = createAsyncThunk('auth/getUser', async () => {
  return await getUserAPI();
});

export const getUserDetails = createAsyncThunk('auth/getUserDetails', async () => {
  return await fetchUserDetailsAPI();
});

export const updateUser = createAsyncThunk('auth/updateUser', async (user) => {
  return await updateUserAPI(user);
});

export const changePassword = createAsyncThunk('auth/changePassword', async (credentials) => {
  return await changePasswordAPI(credentials);
});

// export const getUserDetails = createAsyncThunk('auth/getUserDetails', async () => {
//   return await getUserDetailsAPI();
// });

// export const updateUserDetails = createAsyncThunk('auth/updateUserDetails', async (user) => {
//   return await updateUserDetailsAPI(user);
// });


export const validateOrRefreshToken = createAsyncThunk(
  "auth/validateOrRefreshToken",
  async (_, { dispatch, rejectWithValue }) => {
    const accessToken = TokenService.getAccessToken();
    if (!accessToken) return rejectWithValue("No access token");

    try {
      const decoded = jwtDecode(accessToken);

      if (decoded.exp * 1000 < Date.now()) {
        const refreshToken = TokenService.getRefreshToken();
        if (!refreshToken) {
          dispatch(logout());
          return rejectWithValue("No refresh token");
        }

        try {
          const response = await axios.post("/api/auth/refresh-token/", {
            refresh: refreshToken,
          });

          TokenService.setAccessToken(response.data.access);
          return response.data.access;
        } catch (err) {
          dispatch(logout());
          return rejectWithValue("Refresh token failed");
        }
      }

      return accessToken;
    } catch (err) {
      dispatch(logout());
      return rejectWithValue("Invalid access token");
    }
  }
);


const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    userDetails: null,
    token: null,
    error: null,
    userDetails: null,
    isAuthenticated: false,
    loading:{
      login: false,
      register: false,
      user: false,
      getUserDetails: false,
      updateUser: false,
      changePassword: false,
      logout: false,
      // getUserDetails: false,
      // updateUserDetails: false
    }
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading.login = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading.login = false;
        state.user = action.payload;
        state.token = action.payload.access;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading.login = false;
        state.error = action.error.message;
      })
      .addCase(register.pending, (state) => {
        state.loading.register = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading.register = false;
        state.user = action.payload.user;
        state.token = action.payload.access;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading.register = false;
        state.error = action.error.message;
      })
      .addCase(logout.pending, (state) => {
        state.loading.logout = true;
        state.error = null;
      })  
      .addCase(logout.fulfilled, (state) => {
        state.loading.logout = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading.logout = false;
        state.error = action.error.message;
      })
      .addCase(getUser.pending, (state) => {
        state.loading.getUser = true;
        state.error = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.loading.getUser = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.loading.getUser = false;
        state.error = action.error.message;
      })
      .addCase(updateUser.pending, (state) => {
        state.loading.updateUser = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading.updateUser = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading.updateUser = false;
        state.error = action.error.message;
      })
      .addCase(changePassword.pending, (state) => {
        state.loading.changePassword = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading.changePassword = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading.changePassword = false;
        state.error = action.error.message;
      })

      .addCase(getUserDetails.pending, (state) => {
        state.loading.getUserDetails = true;
        state.error = null;
      })
      .addCase(getUserDetails.fulfilled, (state, action) => {
        state.loading.getUserDetails = false;
        state.userDetails = action.payload;
      })
      .addCase(getUserDetails.rejected, (state, action) => {
        state.loading.getUserDetails = false;
        state.error = action.error.message;
      })

      .addCase(validateOrRefreshToken.fulfilled, (state, action) => {
        state.token = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(validateOrRefreshToken.rejected, (state) => {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
      });
  }
});

export default authSlice.reducer;