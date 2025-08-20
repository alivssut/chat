import axios from 'axios';
import axiosInstance from '../../services/axiosConfig';
import TokenService from '../../utils/tokenService';

export const login = async (credentials) => {
  const response = await axios.post('/api/auth/login/', credentials);
  TokenService.setAccessToken(response.data.access);
  TokenService.setRefreshToken(response.data.refresh);
  return response.data;
};

export const register = async (email, password) => {
    const response = await axios.post('/api/auth/register/', { email, password });
    return response.data;
};

export const logout = async () => {
    const response = await axios.post('/api/auth/logout/');
    TokenService.clearAll();
    return response.data;
};

export const getUser = async () => {
    const response = await axiosInstance.get('/auth/user/');
    return response.data;
};

export const fetchUserDetails = async () => {
    const response = await axiosInstance.get('/user/details/');
    return response.data;
};

export const updateUser = async (user) => {
    const response = await axios.put('/api/auth/user/', user);
    return response.data;
};

export const verifyToken = async () => {
    const response = await axios.post('/api/auth/token/verify/', {
        token: TokenService.getRefreshToken()
    });
    return response.data;
};

export const refreshToken = async () => {
    const response = await axios.post('/api/auth/refresh-token/');
    return response.data;
};

export const changePassword = async (old_password, new_password) => {
    const response = await axios.post('/api/auth/password/change/', { old_password, new_password });
    return response.data;
};

// export const getUserDetails = async () => {
//     const response = await axiosInstance.get('/accounts/api/user/');
//     return response.data;
// };

// export const updateUserDetails = async (user) => {
//     const response = await axios.put('/accounts/api/user/', user);
//     return response.data;
// };