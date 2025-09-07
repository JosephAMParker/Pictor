// src/socket.ts
import { io } from "socket.io-client";
import { apiUrl } from "../../Constants";

export const socket = io(apiUrl, {
  transports: ["websocket"],
  withCredentials: true, // if you later use cookies or auth
});
