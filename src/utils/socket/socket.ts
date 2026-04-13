import { io, Socket } from "socket.io-client";
import { BASE_URL } from "@/services/config";

class SocketManager {
  private socket: Socket | null = null;
  private static instance: SocketManager;

  private constructor() {}

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  public connect(userId: number, token?: string): Socket {
    if (this.socket?.connected) {
      console.log("Socket already connected, reusing connection");
      return this.socket;
    }

    console.log("Connecting to socket server at:", BASE_URL);
    console.log("With auth:", { userId, token: token ? "***" : undefined });

    this.socket = io(BASE_URL, {
      auth: {
        userId,
        token,
      },
      transports: ["websocket", "polling"],
    });

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket?.id);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Chat-specific methods
  public joinRoom(room_id: number): void {
    if (this.socket) {
      console.log("Joining room:", room_id);
      this.socket.emit("join_room", { room_id });
    }
  }

  public leaveRoom(room_id: number): void {
    if (this.socket) {
      this.socket.emit("leave_room", { room_id });
    }
  }

  public sendMessage(data: {
    room_id: number;
    message: string;
    messageType?: string;
    replyToId?: number;
    mediaUrl?: string;
    sender_id: number;
  }): void {
    if (this.socket) {
      console.log("Emitting send_message event with data:", data);
      this.socket.emit("send_message", data);
    }
  }

  public onNewMessage(callback: (data: any) => void): void {
    if (this.socket) {
      console.log("Registering new_message event listener");
      this.socket.on("new_message", (data) => {
        console.log("Received new_message event with data:", data);
        callback(data);
      });
    }
  }

  public onMessageUpdate(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on("message_updated", callback);
    }
  }

  public onMessageDelete(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on("message_deleted", callback);
    }
  }

  public onReactionAdded(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on("reaction_added", callback);
    }
  }

  public onReactionRemoved(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on("reaction_removed", callback);
    }
  }

  public onUserTyping(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on("user_typing", callback);
    }
  }

  public onUserStoppedTyping(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on("user_stopped_typing", callback);
    }
  }

  public emitTyping(roomId: number): void {
    if (this.socket) {
      this.socket.emit("typing", { roomId });
    }
  }

  public emitStoppedTyping(roomId: number): void {
    if (this.socket) {
      this.socket.emit("stopped_typing", { roomId });
    }
  }

  // Remove all listeners for a specific event
  public removeListeners(event: string): void {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  // Remove all listeners
  public removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export default SocketManager;
