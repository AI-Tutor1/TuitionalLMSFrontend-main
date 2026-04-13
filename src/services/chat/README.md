# Chat Module Implementation

This document describes the implementation of the chat functionality with React Query and Socket.IO integration.

## Overview

The chat module provides real-time messaging capabilities with the following features:

- Real-time message sending and receiving via Socket.IO
- Message reactions and views
- File and voice note uploads
- Thread support (replies)
- Optimistic updates with React Query

## Architecture

### API Layer (`src/api/chat.api.ts`)

Contains all API endpoint definitions and basic HTTP functions for chat operations:

- Room management (get rooms, create room)
- Message operations (send, update, delete, get messages)
- Reactions (add, remove, get reactions)
- Views (mark as viewed, get viewers)
- File uploads (files and voice notes)

### Services Layer (`src/services/chat/`)

- `chat.ts`: Service functions that use the configured axios methods
- `chat.hooks.ts`: React Query hooks for all chat operations
- `index.ts`: Barrel export for easy imports

### Socket Layer (`src/utils/socket/`)

- `socket.ts`: Socket.IO client manager (singleton pattern)
- `useSocket.ts`: React hook for socket integration with React Query

## Usage

### Basic Setup

```typescript
import {
  useGetMessagesForRoom,
  useSendMessage,
  useSocket,
} from "@/services/chat";

const ChatComponent = ({ roomId, userId, token }) => {
  const config = { token, contentType: "application/json" };

  // Fetch messages
  const { data: messages, isLoading } = useGetMessagesForRoom(config, roomId);

  // Send message mutation
  const sendMessage = useSendMessage(config);

  // Socket connection
  const { isConnected, sendMessage: socketSend } = useSocket({
    userId,
    token,
    roomId,
    enabled: true,
  });

  // Send a message
  const handleSend = async (content) => {
    await sendMessage.mutateAsync({
      room_id: roomId,
      sender_id: userId,
      message_content: content,
      message_type: "text",
    });
  };
};
```

### Available Hooks

#### Room Hooks

- `useGetRoomsForUser(config, userId)` - Get all rooms for a user
- `useCreateRoom(config)` - Create a new room

#### Message Hooks

- `useGetMessagesForRoom(config, roomId, threadId?)` - Get messages for a room
- `useSendMessage(config)` - Send a new message
- `useUpdateMessage(config)` - Update an existing message
- `useDeleteMessage(config)` - Delete a message

#### Reaction Hooks

- `useGetReactionsForMessage(config, messageId)` - Get reactions for a message
- `useAddReaction(config)` - Add a reaction to a message
- `useRemoveReaction(config)` - Remove a reaction from a message

#### View Hooks

- `useGetViewersForMessage(config, messageId)` - Get viewers for a message
- `useMarkMessageAsViewed(config)` - Mark a message as viewed

#### Upload Hooks

- `useUploadFile(config)` - Upload a file
- `useUploadVoiceNote(config)` - Upload a voice note

### Socket Events

The socket manager handles the following events:

#### Outgoing Events

- `join_room` - Join a chat room
- `leave_room` - Leave a chat room
- `send_message` - Send a message via socket
- `typing` - Indicate user is typing
- `stopped_typing` - Indicate user stopped typing

#### Incoming Events

- `new_message` - New message received
- `message_updated` - Message was updated
- `message_deleted` - Message was deleted
- `reaction_added` - Reaction was added to a message
- `reaction_removed` - Reaction was removed from a message
- `user_typing` - Another user is typing
- `user_stopped_typing` - Another user stopped typing

### Real-time Updates

The `useSocket` hook automatically updates React Query cache when socket events are received:

```typescript
// Automatically updates cache when new message arrives
socketManager.onNewMessage((data) => {
  queryClient.setQueryData(
    chatKeys.messagesForRoom(data.room_id),
    (oldData) => ({
      ...oldData,
      data: [...(oldData?.data || []), data],
    })
  );
});
```

## Configuration

### API Configuration

```typescript
const config: configDataType = {
  token: "your-auth-token",
  contentType: "application/json",
};
```

### Socket Configuration

```typescript
const socket = useSocket({
  userId: 123,
  token: "your-auth-token",
  roomId: 456,
  enabled: true, // Set to false to disable socket connection
});
```

## Error Handling

All hooks include proper error handling:

- API errors are caught and returned in the `error` property
- Socket connection errors are logged to console
- Failed mutations can be retried using React Query's retry mechanism

## Performance Optimizations

1. **Query Keys**: Structured query keys for efficient cache invalidation
2. **Optimistic Updates**: Socket events update cache immediately
3. **Memoization**: Components use React.memo and useMemo for performance
4. **Singleton Socket**: Single socket connection shared across components

## File Structure

```
src/
├── api/
│   └── chat.api.ts          # API endpoints and basic HTTP functions
├── services/
│   └── chat/
│       ├── chat.ts          # Service functions
│       ├── chat.hooks.ts    # React Query hooks
│       ├── index.ts         # Barrel exports
│       └── README.md        # This file
├── utils/
│   ├── socket/
│   │   └── socket.ts        # Socket manager
│   └── hooks/
│       └── useSocket.ts     # Socket React hook
└── types/
    └── chat/
        └── messages.types.ts # TypeScript types
```

## Integration with Existing Components

The chat module is designed to work with existing UI components:

- `MessagesList` - Displays messages
- `MessageInput` - Input for new messages
- `ReactionsPicker` - UI for adding reactions
- `MessageViewers` - Shows who viewed a message

These components receive data and callbacks from the hooks and handle the UI presentation.
