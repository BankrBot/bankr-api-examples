import React from "react";
import { Box, Text } from "ink";
import type { ChatMessage } from "../types.js";
import { Message } from "./Message.js";

interface MessageListProps {
  messages: ChatMessage[];
  maxHeight?: number;
}

export const MessageList = React.memo(function MessageList({
  messages,
  maxHeight = 20,
}: MessageListProps): React.ReactElement {
  // Show only the last N messages that fit in the view
  const visibleMessages = messages.slice(-maxHeight);

  if (messages.length === 0) {
    return (
      <Box
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        paddingY={2}
      >
        <Text dimColor>No messages yet. Start chatting!</Text>
        <Text dimColor>Type a message and press Enter to send.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" flexGrow={1}>
      {visibleMessages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
    </Box>
  );
});
