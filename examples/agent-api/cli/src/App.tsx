import React, { useState, useCallback, useRef } from "react";
import { Box, Text, useInput } from "ink";
import { nanoid } from "nanoid";
import { ChatView } from "./components/ChatView.js";
import type { ChatMessage, JobStatus } from "./types.js";
import {
  submitPrompt,
  pollJobStatus,
  cancelJob,
  isApiKeyConfigured,
  BankrApiError,
} from "./api/client.js";

interface AppState {
  messages: ChatMessage[];
  isProcessing: boolean;
  currentStatus: JobStatus | null;
  statusMessage: string;
  currentJobId: string | null;
  error: string | null;
}

export function App(): React.ReactElement {
  const [state, setState] = useState<AppState>({
    messages: [],
    isProcessing: false,
    currentStatus: null,
    statusMessage: "",
    currentJobId: null,
    error: null,
  });

  // Use refs to access current values in event handlers (avoids stale closure issues)
  const currentJobIdRef = useRef<string | null>(null);
  const isCancellingRef = useRef<boolean>(false);

  // Helper to update state and refs together
  const updateState = useCallback((updater: (prev: AppState) => AppState) => {
    setState((prev) => {
      const next = updater(prev);
      // Update ref immediately
      currentJobIdRef.current = next.currentJobId;
      return next;
    });
  }, []);

  const handleCancelJob = useCallback(async () => {
    const jobId = currentJobIdRef.current;
    if (!jobId || isCancellingRef.current) return;

    isCancellingRef.current = true;

    updateState((prev) => ({
      ...prev,
      statusMessage: "Cancelling...",
    }));

    try {
      await cancelJob(jobId);
      updateState((prev) => ({
        ...prev,
        isProcessing: false,
        currentStatus: "cancelled",
        statusMessage: "Job cancelled",
        currentJobId: null,
      }));
    } catch (error) {
      // Job might have already completed
      updateState((prev) => ({
        ...prev,
        isProcessing: false,
        statusMessage: "",
        currentJobId: null,
      }));
    } finally {
      isCancellingRef.current = false;
    }
  }, [updateState]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      // Add user message
      const userMessage: ChatMessage = {
        id: nanoid(),
        role: "user",
        content,
        timestamp: new Date(),
      };

      updateState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isProcessing: true,
        currentStatus: "pending",
        statusMessage: "Sending...",
        error: null,
      }));

      try {
        // Submit prompt
        const response = await submitPrompt(content);

        if (!response.success || !response.jobId) {
          throw new BankrApiError(
            response.message || "Failed to submit prompt",
          );
        }

        // Update state and ref with job ID
        updateState((prev) => ({
          ...prev,
          currentJobId: response.jobId!,
          statusMessage: "Thinking...",
        }));

        // Poll for completion
        const finalStatus = await pollJobStatus(
          response.jobId,
          (status, message) => {
            updateState((prev) => ({
              ...prev,
              currentStatus: status,
              // Only use default job status message if no agent updates yet
              statusMessage: prev.statusMessage || message,
            }));
          },
          {
            onAgentStatusUpdate: (message) => {
              updateState((prev) => ({
                ...prev,
                statusMessage: message,
              }));
            },
          },
        );

        // Add assistant response
        const assistantMessage: ChatMessage = {
          id: nanoid(),
          role: "assistant",
          content: finalStatus.response || "No response received.",
          timestamp: new Date(),
          status: finalStatus.status,
          transactions: finalStatus.transactions,
          richData: finalStatus.richData,
          jobId: finalStatus.jobId,
        };

        updateState((prev) => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isProcessing: false,
          currentStatus: finalStatus.status,
          statusMessage: "",
          currentJobId: null,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof BankrApiError
            ? error.message
            : "An unexpected error occurred";

        // Add error message
        const errorChatMessage: ChatMessage = {
          id: nanoid(),
          role: "assistant",
          content: `❌ Error: ${errorMessage}`,
          timestamp: new Date(),
          status: "failed",
        };

        updateState((prev) => ({
          ...prev,
          messages: [...prev.messages, errorChatMessage],
          isProcessing: false,
          currentStatus: "failed",
          statusMessage: "",
          currentJobId: null,
          error: errorMessage,
        }));
      }
    },
    [updateState],
  );

  // Handle Escape key to cancel current job
  useInput((_input, key) => {
    if (key.escape) {
      // Use ref to get current job ID (avoids stale closure)
      const jobId = currentJobIdRef.current;
      if (jobId && !isCancellingRef.current) {
        // Cancel current job
        handleCancelJob();
      }
    }
  });

  // Check for API key configuration - done after all hooks to comply with Rules of Hooks
  if (!isApiKeyConfigured()) {
    return (
      <Box flexDirection="column" padding={1}>
        <Box
          borderStyle="round"
          borderColor="red"
          paddingX={2}
          paddingY={1}
          flexDirection="column"
        >
          <Text bold color="red">
            ❌ API Key Not Configured
          </Text>
          <Text />
          <Text>
            Please set the BANKR_API_KEY environment variable to use Bankr CLI.
          </Text>
          <Text />
          <Text dimColor>Example:</Text>
          <Text color="cyan">export BANKR_API_KEY=bk_your_api_key_here</Text>
          <Text />
          <Text dimColor>You can get an API key from the Bankr dashboard.</Text>
          <Text dimColor>
            Note: You must be a Bankr Club member to use the Wallet API.
          </Text>
        </Box>
        <Box marginTop={1}>
          <Text dimColor>Press Ctrl+C to exit</Text>
        </Box>
      </Box>
    );
  }

  return (
    <ChatView
      messages={state.messages}
      isProcessing={state.isProcessing}
      currentStatus={state.currentStatus}
      statusMessage={state.statusMessage}
      onSendMessage={handleSendMessage}
    />
  );
}
