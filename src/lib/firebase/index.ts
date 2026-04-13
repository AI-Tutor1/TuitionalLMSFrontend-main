"use client";
import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyDz3CotnTdgoZpOSBIZgDvK83SzfP7aoHo",
  authDomain: "tuitional-lms-115ae.firebaseapp.com",
  projectId: "tuitional-lms-115ae",
  storageBucket: "tuitional-lms-115ae.firebasestorage.app",
  messagingSenderId: "394983471176",
  appId: "1:394983471176:web:42e4a8baff3bd6e16a007d",
  measurementId: "G-9YFQ2CGKEP",
};

export const app = initializeApp(firebaseConfig);
export const messaging = () => getMessaging(app);
