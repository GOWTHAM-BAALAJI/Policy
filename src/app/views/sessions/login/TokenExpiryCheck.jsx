import { jwtDecode } from "jwt-decode";

export const isTokenExpired = (token) => {
  if (!token) return true; // If no token, treat as expired
  try {
    const { exp } = jwtDecode(token); // Decode token to get expiration
    return Date.now() >= exp * 1000;  // Check if the current time is past expiration
  } catch (error) {
    return true; // If decoding fails, treat as expired
  }
};