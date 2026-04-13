"use client";
import { useEffect, useRef } from "react";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import useFCM from "@/lib/firebase/hooks/useFCM";
import { updateUser } from "@/services/dashboard/superAdmin/uers/users";
import { toast } from "react-toastify";

const FcmHandler = () => {
  const { fcmToken, messages } = useFCM();
  const { user, token } = useAppSelector((state) => state.user);
  const hasUpdatedToken = useRef(false);

  useEffect(() => {
    const updateTokenOnBackend = async () => {
      if (fcmToken && user && token && !hasUpdatedToken.current) {
        // Only update if it's different from what we currently have
        if (user.firebase_token !== fcmToken) {
          try {
            await updateUser({ token }, { id: user.id, firebase_token: fcmToken });
            console.log("FCM Token updated on backend successfully.");
            hasUpdatedToken.current = true;
          } catch (error) {
            console.error("Failed to update FCM token on backend:", error);
          }
        } else {
          hasUpdatedToken.current = true;
        }
      }
    };

    updateTokenOnBackend();
  }, [fcmToken, user, token]);

  // Messages are handled by useFCM's own toast implementation, 
  // but you can add custom logic here if needed.
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      console.log("New real-time message received:", lastMessage);
    }
  }, [messages]);

  return null; // This component doesn't render anything
};

export default FcmHandler;
