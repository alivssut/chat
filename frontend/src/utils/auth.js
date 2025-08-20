import { jwtDecode } from "jwt-decode";
import TokenService from "./tokenService";

export function isTokenValid() {
  const token = TokenService.getAccessToken();
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      return false; 
    }
    return true;
  } catch (error) {
    return false; 
  }
}
