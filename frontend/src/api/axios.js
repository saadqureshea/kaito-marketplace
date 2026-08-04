import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  withCredentials: true, // send the httpOnly auth cookie
});

// Fallback: also attach Bearer token from localStorage if present
// (useful for environments where third-party cookies are blocked)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("kaito_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
