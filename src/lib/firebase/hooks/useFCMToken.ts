"use client";
import { useEffect, useState } from "react";
import { getToken, isSupported } from "firebase/messaging";
import { messaging } from "../index";
import useNotificationPermission from "./useNotificationPermission";

const useFCMToken = () => {
  const permission = useNotificationPermission();
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    const retrieveToken = async () => {
      // Don't attempt to get a token if permission isn't granted
      if (permission !== "granted") return;

      // Check if running in a browser and if service workers are supported
      if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
        return;
      }

      try {
        const isFCMSupported = await isSupported();
        if (!isFCMSupported) {
          console.log("Firebase messaging not supported on this browser");
          return;
        }

        // Make sure service worker is registered before proceeding
        let swRegistration;
        try {
          swRegistration = await navigator.serviceWorker.ready;
        } catch (err) {
          console.error("Service worker not registered:", err);
          return;
        }

        const token = await getToken(messaging(), {
          vapidKey:
            process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ||
            "BMg4cJ6Pl4TqQ-oS0M_EXaFSNBXQTQbiOLLom_cleNrfMVHrrgmdF41hH1hQfKqC-CODBySbM7VmetTmH2dVCME",
          serviceWorkerRegistration: swRegistration,
        });

        if (token) {
          setFcmToken(token);
          console.log("FCM token retrieved:", token);
        } else {
          console.log("No FCM token received");
        }
      } catch (err) {
        console.error("Error retrieving FCM token:", err);
      }
    };

    retrieveToken();
  }, [permission]);

  return fcmToken;
};

export default useFCMToken;
