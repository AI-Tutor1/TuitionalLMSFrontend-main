export type GoogleChatNotification_Payload_Type = {
  type: string;
  message: {
    sender: {
      displayName: string;
      email: string;
    };
    text: string;
  };
};
