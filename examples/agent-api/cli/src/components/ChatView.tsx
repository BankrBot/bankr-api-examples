import React, { useMemo } from "react";
import { Box, Static, Text } from "ink";
import type { ChatMessage, JobStatus } from "../types.js";
import { Header } from "./Header.js";
import { Message } from "./Message.js";
import { StatusBar } from "./StatusBar.js";
import { InputBar } from "./InputBar.js";

interface ChatViewProps {
  messages: ChatMessage[];
  isProcessing: boolean;
  currentStatus: JobStatus | null;
  statusMessage: string;
  onSendMessage: (message: string) => void;
}

// Special item type for Static that includes header
type StaticItem =
  | { type: "header"; id: string }
  | { type: "message"; message: ChatMessage };

export const ChatView = React.memo(function ChatView({
  messages,
  isProcessing,
  currentStatus,
  statusMessage,
  onSendMessage,
}: ChatViewProps): React.ReactElement {
  // Build static items: header first, then all messages
  // These render once and don't participate in re-renders
  const staticItems = useMemo<StaticItem[]>(() => {
    const items: StaticItem[] = [{ type: "header", id: "header" }];
    for (const msg of messages) {
      items.push({ type: "message", message: msg });
    }
    return items;
  }, [messages]);

  return (
    <>
      {/* Static content - renders once per item, no re-renders */}
      <Static items={staticItems}>
        {(item) => {
          if (item.type === "header") {
            return (
              <Box key="header" paddingX={1} paddingTop={1} width="100%">
                <Header />
              </Box>
            );
          }
          return (
            <Box key={item.message.id} paddingX={1} width="100%">
              <Message message={item.message} />
            </Box>
          );
        }}
      </Static>

      {/* Dynamic content - only this redraws on state changes */}
      <Box flexDirection="column" paddingX={1}>
        {messages.length === 0 && (
          <Box
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            paddingY={1}
          >
            <Text dimColor>No messages yet. Start chatting!</Text>
            <Text dimColor>Type a message and press Enter to send.</Text>
          </Box>
        )}

        <StatusBar
          status={currentStatus}
          message={statusMessage}
          isProcessing={isProcessing}
        />

        <InputBar
          onSubmit={onSendMessage}
          disabled={isProcessing}
          placeholder="Ask Bankr anything..."
        />
      </Box>
    </>
  );
});
