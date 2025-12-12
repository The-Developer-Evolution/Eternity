import PusherServer from "pusher";
import PusherClient from "pusher-js";

export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    wsHost: process.env.NEXT_PUBLIC_SOKETI_HOST!,
    wsPort: parseInt(process.env.NEXT_PUBLIC_SOKETI_PORT!, 10),
    wssPort: parseInt(process.env.NEXT_PUBLIC_SOKETI_PORT!, 10),
    forceTLS: process.env.NEXT_PUBLIC_SOKETI_TLS === "true",
    wsPath: process.env.NEXT_PUBLIC_SOKETI_PATH,
    disableStats: true,
    enabledTransports: ["ws", "wss"],
  }
);

export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  host: process.env.SOKETI_HOST!,
  port: process.env.SOKETI_PORT!,
  useTLS: process.env.SOKETI_TLS === "true",
});
