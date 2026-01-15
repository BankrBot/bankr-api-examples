import React, { useState, useCallback } from "react";
import { Box, Text } from "ink";
import TextInput from "ink-text-input";

interface InputBarProps {
  onSubmit: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const InputBar = React.memo(function InputBar({
  onSubmit,
  disabled = false,
  placeholder = "Type a message...",
}: InputBarProps): React.ReactElement {
  const [value, setValue] = useState("");

  const handleSubmit = useCallback(
    (submittedValue: string) => {
      const trimmed = submittedValue.trim();
      if (trimmed && !disabled) {
        onSubmit(trimmed);
        setValue("");
      }
    },
    [disabled, onSubmit],
  );

  return (
    <Box
      borderStyle="round"
      borderColor={disabled ? "gray" : "green"}
      paddingX={1}
      marginTop={1}
    >
      <Box marginRight={1}>
        <Text color={disabled ? "gray" : "green"}>❯</Text>
      </Box>
      <Box flexGrow={1}>
        {disabled ? (
          <Text dimColor>Waiting for response...</Text>
        ) : (
          <TextInput
            value={value}
            onChange={setValue}
            onSubmit={handleSubmit}
            placeholder={placeholder}
          />
        )}
      </Box>
    </Box>
  );
});
