import { TelegramClient } from "@mtcute/node";

export interface TelegramConfig {
  apiId: number;
  apiHash: string;
  /** Path to store session file */
  sessionPath: string;
}

/**
 * Create and initialize a Telegram client
 * On first run, will prompt for phone number and auth code
 */
export function createTelegramClient(
  config: TelegramConfig
): TelegramClient {
  console.log("[DEBUG] Creating TelegramClient with config:", {
    apiId: config.apiId,
    apiHash: config.apiHash ? `${config.apiHash.substring(0, 8)}...` : "missing",
    sessionPath: config.sessionPath,
  });
  
  const client = new TelegramClient({
    apiId: config.apiId,
    apiHash: config.apiHash,
    storage: config.sessionPath,
  });

  console.log("[DEBUG] TelegramClient instance created");
  return client;
}
