import api from "./api.js";

export const sendChatMessage = (messages) => {
  return api.post("/chat", {
    messages,
  });
};
