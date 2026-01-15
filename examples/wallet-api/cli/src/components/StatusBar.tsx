import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";
import type { JobStatus } from "../types.js";

interface StatusBarProps {
  status: JobStatus | null;
  message: string;
  isProcessing: boolean;
}

const spinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

export const StatusBar = React.memo(function StatusBar({
  status,
  message,
  isProcessing,
}: StatusBarProps): React.ReactElement | null {
  const [spinnerIndex, setSpinnerIndex] = useState(0);

  useEffect(() => {
    if (!isProcessing) return;

    const interval = setInterval(() => {
      setSpinnerIndex((prev) => (prev + 1) % spinnerFrames.length);
    }, 100);

    return () => clearInterval(interval);
  }, [isProcessing]);

  if (!isProcessing && !message) {
    return null;
  }

  const getStatusColor = (): string => {
    switch (status) {
      case "completed":
        return "green";
      case "failed":
        return "red";
      case "cancelled":
        return "gray";
      case "processing":
        return "blue";
      case "pending":
      default:
        return "yellow";
    }
  };

  const getStatusIcon = (): string => {
    if (isProcessing) {
      return spinnerFrames[spinnerIndex];
    }
    switch (status) {
      case "completed":
        return "✓";
      case "failed":
        return "✗";
      case "cancelled":
        return "○";
      default:
        return "◌";
    }
  };

  return (
    <Box paddingX={1} marginTop={1} justifyContent="space-between">
      <Text color={getStatusColor()}>
        {getStatusIcon()} {message || "Processing..."}
      </Text>
      {isProcessing && <Text dimColor>(Esc to cancel)</Text>}
    </Box>
  );
});
