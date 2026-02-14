import PusherServer from "pusher";
import PusherClient from "pusher-js";

// --- CLIENT CONFIG ---
let pusherClientInstance: PusherClient | null = null;

export const getPusherClient = () => {
  if (!pusherClientInstance) {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    
    if (!key) {
      console.error("NEXT_PUBLIC_PUSHER_KEY is missing. Please check your .env file.");
      return null;
    }

    const forceTLS = process.env.NEXT_PUBLIC_SOKETI_TLS === "true";
    const port = process.env.NEXT_PUBLIC_SOKETI_PORT ? parseInt(process.env.NEXT_PUBLIC_SOKETI_PORT, 10) : undefined;

    console.log("[PusherConfig] Initializing with:", { key, forceTLS, port, host: process.env.NEXT_PUBLIC_SOKETI_HOST });

    // Enable Pusher logging
    PusherClient.logToConsole = true;

    pusherClientInstance = new PusherClient(
      key,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        wsHost: process.env.NEXT_PUBLIC_SOKETI_HOST!,
        wsPort: port,
        wssPort: port,
        forceTLS: forceTLS,
        wsPath: process.env.NEXT_PUBLIC_SOKETI_PATH, 
        disableStats: true,
        // Allow both transports to avoid 'failed' state if one is blocked/misconfigured
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

    const host = process.env.SOKETI_HOST!;
    const port = process.env.SOKETI_PORT ? parseInt(process.env.SOKETI_PORT, 10) : undefined;
    const useTLS = process.env.SOKETI_TLS === "true";

    console.log("[PusherServerConfig] Initializing with:", { 
      host, 
      port, 
      useTLS, 
      appId: process.env.PUSHER_APP_ID 
    });

    pusherServerInstance = new PusherServer({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: cluster,
      host: host,
      port: port ? String(port) : undefined, 
      useTLS: useTLS,
    });
  }
  return pusherServerInstance;
};