import type { TelegramConfig } from "./telegram/client";

export interface Config {
  telegram: TelegramConfig;
  bankr: {
    apiUrl: string;
    apiKey: string;
  };
}

/**
 * Load and validate configuration from environment variables
 */
export function loadConfig(): Config {
  console.log("[DEBUG] loadConfig() called");
  const errors: string[] = [];

  // Telegram config
  const apiId = process.env.TELEGRAM_API_ID;
  const apiHash = process.env.TELEGRAM_API_HASH;

  if (!apiId) errors.push("TELEGRAM_API_ID is required");
  if (!apiHash) errors.push("TELEGRAM_API_HASH is required");

  // Bankr config
  const bankrApiKey = process.env.BANKR_API_KEY;
  const bankrApiUrl = process.env.BANKR_API_URL || "https://api.bankr.bot";

  if (!bankrApiKey) errors.push("BANKR_API_KEY is required");

  if (errors.length > 0) {
    console.error("Configuration errors:");
    for (const error of errors) {
      console.error(`  - ${error}`);
    }
    console.error("\nSee .env.example for required variables");
    process.exit(1);
  }

  const config = {
    telegram: {
      apiId: parseInt(apiId!, 10),
      apiHash: apiHash!,
      sessionPath: "./session",
    },
    bankr: {
      apiUrl: bankrApiUrl,
      apiKey: bankrApiKey!,
    },
  };
  
  console.log("[DEBUG] Configuration loaded successfully");
  return config;
}
