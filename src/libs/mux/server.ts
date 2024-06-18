import Mux from "@mux/mux-node";

export const mux = new Mux({
  tokenId: process.env.VITE_MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
  webhookSecret: process.env.MUX_WEBHOOK_SECRET,
});
