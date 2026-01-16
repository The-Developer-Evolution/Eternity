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
        enabledTransports: forceTLS ? ["wss"] : ["ws", "wss"], 
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
      port: port ? String(port) : undefined, // Pusher server lib often expects string for port in some versions, but number in others. Safe to pass what config expects? 
      // Actually checking types for pusher@5.2.0: Options interface says `port?: string`. 
      // Wait, if it expects string, then `process.env.SOKETI_PORT` was correct.
      // But let's verify.
      // If I look at type definition it usually says `port?: string`.
      // Let's stick to what it was but log it.
      // Actually, let's try explicitly passing it as string but cleaned.
      useTLS: useTLS,
    });
  }
  return pusherServerInstance;
};