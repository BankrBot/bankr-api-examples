import type {
  PromptResponse,
  JobStatusResponse,
  JobStatus,
} from "./types";

export class BankrApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "BankrApiError";
  }
}

interface ApiErrorResponse {
  error?: string;
  message?: string;
}

export type StatusCallback = (status: JobStatus, message: string) => void;
export type AgentStatusCallback = (message: string) => void;

export interface PollOptions {
  /** Polling interval in ms (default: 1500) */
  intervalMs?: number;
  /** Max polling attempts (default: 120) */
  maxAttempts?: number;
  /** Callback for agent status updates */
  onAgentStatusUpdate?: AgentStatusCallback;
}

/** Bankr Agent API client */
export class BankrClient {
  constructor(
    private readonly apiUrl: string,
    private readonly apiKey: string
  ) {}

  /** Submit a prompt to the Bankr wallet */
  async submitPrompt(prompt: string): Promise<PromptResponse> {
    const response = await fetch(`${this.apiUrl}/agent/prompt`, {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
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

  /** Get the status of a job */
  async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    const response = await fetch(`${this.apiUrl}/agent/job/${jobId}`, {
      method: "GET",
      headers: {
        "x-api-key": this.apiKey,
      },
    });

    const data = (await response.json()) as JobStatusResponse & ApiErrorResponse;

    if (!response.ok) {
      const errorMessage = data.error || data.message || "Unknown error";
      throw new BankrApiError(errorMessage, response.status);
    }

    return data;
  }

  /** Cancel a running job */
  async cancelJob(jobId: string): Promise<JobStatusResponse> {
    const response = await fetch(`${this.apiUrl}/agent/job/${jobId}/cancel`, {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
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

  /** Poll job status until completion */
  async pollJobStatus(
    jobId: string,
    onStatusUpdate?: StatusCallback,
    options?: PollOptions
  ): Promise<JobStatusResponse> {
    const {
      intervalMs = 1500,
      maxAttempts = 120,
      onAgentStatusUpdate,
    } = options || {};

    let lastStatus: JobStatus | null = null;
    let lastStatusUpdateCount = 0;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await this.getJobStatus(jobId);

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
        const statusMessage = this.getStatusMessage(status.status);
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
    return await this.getJobStatus(jobId);
  }

  /**
   * Submit prompt and poll until completion
   * Convenience method combining submitPrompt + pollJobStatus
   */
  async executePrompt(
    prompt: string,
    onStatusUpdate?: StatusCallback,
    options?: PollOptions
  ): Promise<JobStatusResponse> {
    const { jobId } = await this.submitPrompt(prompt);

    if (!jobId) {
      throw new BankrApiError("No job ID received from API");
    }

    return this.pollJobStatus(jobId, onStatusUpdate, options);
  }

  private getStatusMessage(status: JobStatus): string {
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
}
