import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.DEV
    ? "http://localhost:5000/api"
    : "https://thass-chat.onrender.com/api",
  withCredentials: true,
});

export default API;