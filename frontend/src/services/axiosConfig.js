import axios from 'axios';
import TokenService from '../utils/tokenService';

const axiosInstance = axios.create({
  baseURL: '/api',
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = TokenService.getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refresh = TokenService.getRefreshToken();
        const res = await axios.post('/api/auth/token/refresh/', {
          refresh: refresh,
        });

        const newAccessToken = res.data.access;
        TokenService.setAccessToken(newAccessToken);

        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("🔴 Token refresh failed", refreshError);
        TokenService.clearAll();
        // window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
