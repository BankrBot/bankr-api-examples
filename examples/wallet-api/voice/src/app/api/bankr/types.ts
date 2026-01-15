// API Response Types (mirrored from CLI)

export interface PromptResponse {
  success: boolean;
  jobId?: string;
  status?: string;
  message?: string;
  error?: string;
}

export interface StatusUpdate {
  message: string;
  timestamp: string;
}

export interface JobStatusResponse {
  success: boolean;
  jobId: string;
  status: JobStatus;
  prompt: string;
  response?: string;
  statusUpdates?: StatusUpdate[];
  error?: string;
  createdAt: string;
  completedAt?: string;
  processingTime?: number;
  startedAt?: string;
  cancelledAt?: string;
}

export type JobStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";
