export interface PromptResponse {
  success: boolean;
  jobId?: string;
  status?: string;
  message?: string;
  error?: string;
}

export interface Transaction {
  type: string;
  metadata?: {
    transaction?: {
      chainId: number;
      to: string;
      data: string;
      gas?: string;
      value?: string;
    };
    humanReadableMessage?: string;
    inputTokenTicker?: string;
    outputTokenTicker?: string;
    inputTokenAmount?: string;
    outputTokenAmount?: string;
    [key: string]: unknown;
  };
}

export interface RichData {
  type: string;
  base64?: string;
  url?: string;
  [key: string]: unknown;
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
  transactions?: Transaction[];
  richData?: RichData[];
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

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  status?: JobStatus;
  transactions?: Transaction[];
  richData?: RichData[];
  jobId?: string;
}

export interface AppState {
  messages: ChatMessage[];
  currentJobId: string | null;
  isProcessing: boolean;
  statusMessage: string;
  error: string | null;
}
