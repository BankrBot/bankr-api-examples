import React, { useMemo } from "react";
import { Box, Text } from "ink";
import type { ChatMessage } from "../types.js";
import { renderMarkdown } from "../utils/markdown.js";

interface MessageProps {
  message: ChatMessage;
}

export const Message = React.memo(function Message({
  message,
}: MessageProps): React.ReactElement {
  const isUser = message.role === "user";

  // Cache the timestamp formatting
  const timestamp = useMemo(
    () =>
      message.timestamp.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    [message.timestamp],
  );

  // Cache the markdown rendering - this is the expensive operation
  const renderedContent = useMemo(
    () => (isUser ? message.content : renderMarkdown(message.content)),
    [isUser, message.content],
  );

  return (
    <Box
      flexDirection="column"
      marginBottom={1}
      alignItems={isUser ? "flex-end" : "flex-start"}
      width="100%"
    >
      {/* Header with role and timestamp */}
      <Box gap={1}>
        <Text dimColor>
          {isUser ? "You" : "🏦 Bankr"} • {timestamp}
        </Text>
      </Box>

      {/* Message content */}
      <Box
        borderStyle="round"
        borderColor={isUser ? "cyan" : "magenta"}
        paddingX={1}
        marginTop={0}
        flexDirection="column"
      >
        <Text wrap="wrap">{renderedContent}</Text>

        {/* Show transactions if present */}
        {message.transactions && message.transactions.length > 0 && (
          <Box flexDirection="column" marginTop={1}>
            <Text bold color="yellow">
              📝 Transactions:
            </Text>
            {message.transactions.map((tx, i) => (
              <Box key={i} paddingLeft={1}>
                <Text>
                  • {tx.type}
                  {tx.metadata?.humanReadableMessage &&
                    `: ${tx.metadata.humanReadableMessage}`}
                </Text>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
});
