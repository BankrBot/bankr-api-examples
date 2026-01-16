"use client";

import { useCallback, useRef } from "react";
import type { PromptResponse, JobStatusResponse } from "@/app/api/bankr/types";

interface PollCallbacks {
  onJobCreated?: (jobId: string) => void;
  onStatusUpdate?: (message: string) => void;
  onComplete?: (response: JobStatusResponse) => void;
  onError?: (error: Error) => void;
}

interface PollOptions {
  intervalMs?: number;
  maxAttempts?: number;
}

export function useBankrApi() {
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingRef = useRef(false);

  const submitPrompt = useCallback(
    async (prompt: string): Promise<PromptResponse> => {
      const response = await fetch("/api/bankr/prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data: PromptResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to submit prompt");
      }

      return data;
    },
    [],
  );

  const getJobStatus = useCallback(
    async (jobId: string): Promise<JobStatusResponse> => {
      const response = await fetch(`/api/bankr/job/${jobId}`);
      const data: JobStatusResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to get job status");
      }

      return data;
    },
    [],
  );

  const cancelJob = useCallback(
    async (jobId: string): Promise<JobStatusResponse> => {
      const response = await fetch(`/api/bankr/job/${jobId}/cancel`, {
        method: "POST",
      });

      const data: JobStatusResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to cancel job");
      }

      return data;
    },
    [],
  );

  const pollJobStatus = useCallback(
    async (
      jobId: string,
      callbacks: PollCallbacks,
      options: PollOptions = {},
    ): Promise<JobStatusResponse | null> => {
      const { intervalMs = 1500, maxAttempts = 120 } = options;

      // Set up abort controller for cancellation
      abortControllerRef.current = new AbortController();
      pollingRef.current = true;

      let lastStatusUpdateCount = 0;

      try {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          // Check if polling was cancelled
          if (
            !pollingRef.current ||
            abortControllerRef.current?.signal.aborted
          ) {
            return null;
          }

          const status = await getJobStatus(jobId);

          // Check for new status updates
          if (
            status.statusUpdates &&
            status.statusUpdates.length > lastStatusUpdateCount
          ) {
            const newUpdates = status.statusUpdates.slice(
              lastStatusUpdateCount,
            );
            for (const update of newUpdates) {
              callbacks.onStatusUpdate?.(update.message);
            }
            lastStatusUpdateCount = status.statusUpdates.length;
          }

          // Check if job is in a terminal state
          if (
            status.status === "completed" ||
            status.status === "failed" ||
            status.status === "cancelled"
          ) {
            if (status.status === "completed") {
              callbacks.onComplete?.(status);
            } else if (status.status === "failed") {
              callbacks.onError?.(new Error(status.error || "Job failed"));
            }
            // cancelled is handled by the cancel function
            return status;
          }

          // Wait before next poll
          await new Promise((resolve) => setTimeout(resolve, intervalMs));
        }

        // Max attempts reached
        callbacks.onError?.(
          new Error("Polling timeout - max attempts reached"),
        );
        return null;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return null;
        }
        callbacks.onError?.(
          error instanceof Error ? error : new Error("Unknown error"),
        );
        return null;
      } finally {
        pollingRef.current = false;
      }
    },
    [getJobStatus],
  );

  const stopPolling = useCallback(() => {
    pollingRef.current = false;
    abortControllerRef.current?.abort();
  }, []);

  const submitAndPoll = useCallback(
    async (
      prompt: string,
      callbacks: PollCallbacks,
      options?: PollOptions,
    ): Promise<JobStatusResponse | null> => {
      try {
        const promptResponse = await submitPrompt(prompt);

        if (!promptResponse.jobId) {
          throw new Error("No job ID received");
        }

        // Notify caller of job ID immediately for cancellation tracking
        callbacks.onJobCreated?.(promptResponse.jobId);

        return await pollJobStatus(promptResponse.jobId, callbacks, options);
      } catch (error) {
        callbacks.onError?.(
          error instanceof Error ? error : new Error("Unknown error"),
        );
        return null;
      }
    },
    [submitPrompt, pollJobStatus],
  );

  return {
    submitPrompt,
    getJobStatus,
    cancelJob,
    pollJobStatus,
    stopPolling,
    submitAndPoll,
  };
}
