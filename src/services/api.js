import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.urlPadrao,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;