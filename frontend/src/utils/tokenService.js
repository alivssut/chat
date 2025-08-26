
const TokenService = {
  getAccessToken: () => localStorage.getItem('access'),

  setAccessToken: (token) => localStorage.setItem('access', token),

  clearAccessToken: () => localStorage.removeItem('access'),

  getRefreshToken: () => localStorage.getItem('refresh'),

  setRefreshToken: (token) => localStorage.setItem('refresh', token),

  clearRefreshToken: () => localStorage.removeItem('refresh'),

  logout: () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
  },
};

export default TokenService;
