import PusherServer from "pusher";
import PusherClient from "pusher-js";

// --- CLIENT CONFIG ---
let pusherClientInstance: PusherClient | null = null;

export const getPusherClient = () => {
  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_KEY!,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        wsHost: process.env.NEXT_PUBLIC_SOKETI_HOST!,
        wsPort: process.env.NEXT_PUBLIC_SOKETI_PORT ? parseInt(process.env.NEXT_PUBLIC_SOKETI_PORT, 10) : undefined,
        wssPort: process.env.NEXT_PUBLIC_SOKETI_PORT ? parseInt(process.env.NEXT_PUBLIC_SOKETI_PORT, 10) : undefined,
        forceTLS: process.env.NEXT_PUBLIC_SOKETI_TLS === "true",
        wsPath: process.env.NEXT_PUBLIC_SOKETI_PATH, // Optional
        disableStats: true,
        enabledTransports: ["ws", "wss"],
      }
    );
  }
  return pusherClientInstance;
};

// --- SERVER CONFIG ---
let pusherServerInstance: PusherServer | null = null;

export const getPusherServer = () => {
  if (!pusherServerInstance) {
    const cluster = process.env.PUSHER_CLUSTER;

    if (!cluster || cluster === "build_placeholder") {
      console.warn("Pusher cluster not available. Returning null instance.");
      return null;
    }

    pusherServerInstance = new PusherServer({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: cluster,
      host: process.env.SOKETI_HOST!,
      port: process.env.SOKETI_PORT!,
      useTLS: process.env.SOKETI_TLS === "true",
    });
  }
  return pusherServerInstance;
};