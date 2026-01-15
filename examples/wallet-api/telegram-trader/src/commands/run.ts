import "dotenv/config";
import { loadConfig } from "../config";
import { createTelegramClient, setupWatcher } from "../telegram";
import { resolveGroupName } from "../telegram/utils";
import { BankrClient } from "../bankr";
import { GroupRegistry } from "../groups";
import { GROUP_HANDLERS } from "../groups/config";
import { getOptions } from "../cli";

export async function runBot(): Promise<void> {
  const options = getOptions();
  const verbose = options.verbose || options.v;

  if (verbose) {
    console.log("[DEBUG] Telegram Trading Bot starting...\n");
  } else {
    console.log("Telegram Trading Bot starting...\n");
  }

  // Load configuration
  if (verbose) console.log("[DEBUG] Loading configuration...");
  const config = loadConfig();
  if (verbose) console.log("[DEBUG] Configuration loaded");

  // Initialize Bankr client
  if (verbose) console.log("[DEBUG] Initializing Bankr client...");
  const bankrClient = new BankrClient(config.bankr.apiUrl, config.bankr.apiKey);
  if (verbose) console.log("[DEBUG] Bankr client initialized");

  // Initialize Telegram client
  if (verbose) console.log("[DEBUG] Creating Telegram client...");
  const telegramClient = createTelegramClient(config.telegram);
  if (verbose) console.log("[DEBUG] Telegram client created");

  // Connect to Telegram FIRST (needed to resolve group names)
  if (verbose) console.log("[DEBUG] Connecting to Telegram...");
  try {
    await telegramClient.start({
      phone: () => {
        if (verbose) console.log("[DEBUG] Prompting for phone number...");
        return prompt("Enter phone number: ");
      },
      code: () => {
        if (verbose) console.log("[DEBUG] Prompting for auth code...");
        return prompt("Enter auth code: ");
      },
      password: () => {
        if (verbose) console.log("[DEBUG] Prompting for 2FA password...");
        return prompt("Enter 2FA password: ");
      },
    });
    if (verbose) console.log("[DEBUG] Telegram client started successfully");
  } catch (error) {
    console.error("Error starting Telegram client:", error);
    throw error;
  }

  if (verbose) console.log("[DEBUG] Getting user info...");
  const me = await telegramClient.getMe();
  console.log(`Logged in as: ${me.firstName} (@${me.username || "no username"})`);

  // NOW resolve group names and register handlers
  if (verbose) console.log("[DEBUG] Resolving group names...");
  if (verbose) console.log(`[DEBUG] Found ${GROUP_HANDLERS.length} handler config(s)`);
  const registry = new GroupRegistry();

  for (const handlerEntry of GROUP_HANDLERS) {
    if (verbose) console.log(`[DEBUG] Processing handler for chatId: ${handlerEntry.chatId}, enabled: ${handlerEntry.enabled}`);
    if (!handlerEntry.enabled) {
      if (verbose) console.log(`[Config] Skipping disabled handler (${handlerEntry.chatId})`);
      continue;
    }

    if (verbose) console.log(`[DEBUG] Resolving group name for chatId: ${handlerEntry.chatId}...`);
    const groupName = await resolveGroupName(telegramClient, handlerEntry.chatId);
    if (verbose) console.log(`[DEBUG] Resolved group name: ${groupName}`);

    if (verbose) console.log(`[DEBUG] Creating handler...`);
    const handler = handlerEntry.create({ resolvedName: groupName });
    if (verbose) console.log(`[DEBUG] Registering handler...`);
    registry.register(handler);
    if (verbose) console.log(`[DEBUG] Handler registered successfully`);
  }

  // Setup message watcher
  if (verbose) console.log("[DEBUG] Setting up message watcher...");
  setupWatcher(telegramClient, registry, bankrClient);
  if (verbose) console.log("[DEBUG] Message watcher setup complete");

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
  return new Promise((resolve) => {
    process.stdout.write(message);
    process.stdin.once("data", (data) => {
      resolve(data.toString().trim());
    });
  });
}
