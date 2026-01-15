import "dotenv/config";
import { loadConfig } from "../config";
import { createTelegramClient, setupWatcher } from "../telegram";
import { resolveGroupName } from "../telegram/utils";
import { BankrClient } from "../bankr";
import { GroupRegistry } from "../groups";
import { GROUP_HANDLERS } from "../groups/config";

export async function runBot(): Promise<void> {
  console.log("[DEBUG] Telegram Trading Bot starting...\n");

  // Load configuration
  console.log("[DEBUG] Loading configuration...");
  const config = loadConfig();
  console.log("[DEBUG] Configuration loaded");

  // Initialize Bankr client
  console.log("[DEBUG] Initializing Bankr client...");
  const bankrClient = new BankrClient(config.bankr.apiUrl, config.bankr.apiKey);
  console.log("[DEBUG] Bankr client initialized");

  // Initialize Telegram client
  console.log("[DEBUG] Creating Telegram client...");
  const telegramClient = createTelegramClient(config.telegram);
  console.log("[DEBUG] Telegram client created");

  // Connect to Telegram FIRST (needed to resolve group names)
  console.log("[DEBUG] Connecting to Telegram...");
  try {
    await telegramClient.start({
      phone: () => {
        console.log("[DEBUG] Prompting for phone number...");
        return prompt("Enter phone number: ");
      },
      code: () => {
        console.log("[DEBUG] Prompting for auth code...");
        return prompt("Enter auth code: ");
      },
      password: () => {
        console.log("[DEBUG] Prompting for 2FA password...");
        return prompt("Enter 2FA password: ");
      },
    });
    console.log("[DEBUG] Telegram client started successfully");
  } catch (error) {
    console.error("[DEBUG] Error starting Telegram client:", error);
    throw error;
  }

  console.log("[DEBUG] Getting user info...");
  const me = await telegramClient.getMe();
  console.log(`[DEBUG] Logged in as: ${me.firstName} (@${me.username || "no username"})`);

  // NOW resolve group names and register handlers
  console.log("[DEBUG] Resolving group names...");
  console.log(`[DEBUG] Found ${GROUP_HANDLERS.length} handler config(s)`);
  const registry = new GroupRegistry();

  for (const handlerEntry of GROUP_HANDLERS) {
    console.log(`[DEBUG] Processing handler for chatId: ${handlerEntry.chatId}, enabled: ${handlerEntry.enabled}`);
    if (!handlerEntry.enabled) {
      console.log(`[Config] Skipping disabled handler (${handlerEntry.chatId})`);
      continue;
    }

    console.log(`[DEBUG] Resolving group name for chatId: ${handlerEntry.chatId}...`);
    const groupName = await resolveGroupName(telegramClient, handlerEntry.chatId);
    console.log(`[DEBUG] Resolved group name: ${groupName}`);

    console.log(`[DEBUG] Creating handler...`);
    const handler = handlerEntry.create({ resolvedName: groupName });
    console.log(`[DEBUG] Registering handler...`);
    registry.register(handler);
    console.log(`[DEBUG] Handler registered successfully`);
  }

  // Setup message watcher
  console.log("[DEBUG] Setting up message watcher...");
  setupWatcher(telegramClient, registry, bankrClient);
  console.log("[DEBUG] Message watcher setup complete");

  console.log("Watching for messages...\n");

  // Handle graceful shutdown
  const shutdown = () => {
    console.log("\nShutting down...");
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  // Keep the process running
  await new Promise(() => {});
}

function prompt(message: string): Promise<string> {
  console.log(`[DEBUG] prompt() called with message: ${message}`);
  return new Promise((resolve) => {
    console.log("[DEBUG] Setting up stdin listener...");
    process.stdout.write(message);
    process.stdin.once("data", (data) => {
      console.log("[DEBUG] Received input from stdin");
      resolve(data.toString().trim());
    });
  });
}
