import type { PromptResponse, JobStatusResponse, JobStatus } from "../types.js";

const API_URL = process.env.BANKR_API_URL || "https://api.bankr.bot";
const API_KEY = process.env.BANKR_API_KEY || "";

export class BankrApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = "BankrApiError";
  }
}

export function getApiKey(): string {
  return API_KEY;
}

export function isApiKeyConfigured(): boolean {
  return API_KEY.length > 0;
}

interface ApiErrorResponse {
  error?: string;
  message?: string;
}

export async function submitPrompt(prompt: string): Promise<PromptResponse> {
  if (!isApiKeyConfigured()) {
    throw new BankrApiError("BANKR_API_KEY environment variable is not set");
  }

  const response = await fetch(`${API_URL}/agent/prompt`, {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  const data = (await response.json()) as PromptResponse & ApiErrorResponse;

  if (!response.ok) {
    const errorMessage = data.error || data.message || "Unknown error";
    throw new BankrApiError(errorMessage, response.status);
  }

  return data;
}

export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  if (!isApiKeyConfigured()) {
    throw new BankrApiError("BANKR_API_KEY environment variable is not set");
  }

  const response = await fetch(`${API_URL}/agent/job/${jobId}`, {
    method: "GET",
    headers: {
      "x-api-key": API_KEY,
    },
  });

  const data = (await response.json()) as JobStatusResponse & ApiErrorResponse;

  if (!response.ok) {
    const errorMessage = data.error || data.message || "Unknown error";
    throw new BankrApiError(errorMessage, response.status);
  }

  return data;
}

export async function cancelJob(jobId: string): Promise<JobStatusResponse> {
  if (!isApiKeyConfigured()) {
    throw new BankrApiError("BANKR_API_KEY environment variable is not set");
  }

  const response = await fetch(`${API_URL}/agent/job/${jobId}/cancel`, {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json",
    },
  });

  const data = (await response.json()) as JobStatusResponse & ApiErrorResponse;

  if (!response.ok) {
    const errorMessage = data.error || data.message || "Unknown error";
    throw new BankrApiError(errorMessage, response.status);
  }

  return data;
}

export type StatusCallback = (status: JobStatus, message: string) => void;
export type AgentStatusCallback = (message: string) => void;

export async function pollJobStatus(
  jobId: string,
  onStatusUpdate?: StatusCallback,
  options?: {
    intervalMs?: number;
    maxAttempts?: number;
    onAgentStatusUpdate?: AgentStatusCallback;
  },
): Promise<JobStatusResponse> {
  const {
    intervalMs = 1500,
    maxAttempts = 120,
    onAgentStatusUpdate,
  } = options || {};

  let lastStatus: JobStatus | null = null;
  let lastStatusUpdateCount = 0;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const status = await getJobStatus(jobId);

    // Check for new agent status updates
    if (
      onAgentStatusUpdate &&
      status.statusUpdates &&
      status.statusUpdates.length > lastStatusUpdateCount
    ) {
      const newUpdates = status.statusUpdates.slice(lastStatusUpdateCount);
      for (const update of newUpdates) {
        onAgentStatusUpdate(update.message);
      }
      lastStatusUpdateCount = status.statusUpdates.length;
    }

    // Notify about job status changes
    if (status.status !== lastStatus && onStatusUpdate) {
      const statusMessage = getStatusMessage(status.status);
      onStatusUpdate(status.status, statusMessage);
      lastStatus = status.status;
    }

    // Check if job is in a terminal state
    if (
      status.status === "completed" ||
      status.status === "failed" ||
      status.status === "cancelled"
    ) {
      return status;
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  // Max attempts reached, return last known status
  return await getJobStatus(jobId);
}

function getStatusMessage(status: JobStatus): string {
  switch (status) {
    case "pending":
      return "Thinking...";
    case "processing":
      return "Working on it...";
    case "completed":
      return "Done!";
    case "failed":
      return "Something went wrong";
    case "cancelled":
      return "Cancelled";
    default:
      return "Processing...";
  }
}
