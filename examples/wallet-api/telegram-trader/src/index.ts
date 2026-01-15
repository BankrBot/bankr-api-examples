import { parseArgs, printHelp, getCommand } from "./cli";
import { runBot } from "./commands/run";

// Register all commands
import "./commands/list-groups";

console.log("[DEBUG] index.ts: All imports completed");
console.error("[DEBUG] stderr test - if you see this, process is running");
process.stdout.write("[DEBUG] stdout test - direct write\n");

async function main() {
  console.log("[DEBUG] Main function started");
  const { command } = parseArgs();
  console.log(`[DEBUG] Parsed command: ${command || "none (default: run)"}`);

  // No command = run the bot
  if (!command) {
    console.log("[DEBUG] No command specified, running bot...");
    await runBot();
    return;
  }

  // Help command
  if (command === "help" || command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  // Look up registered command
  const cmd = getCommand(command);
  if (cmd) {
    await cmd.run();
    return;
  }

  // Unknown command
  console.error(`Unknown command: ${command}\n`);
  printHelp();
  process.exit(1);
}

console.log("[DEBUG] index.ts: About to call main()...");
main().catch((error) => {
  console.error("[DEBUG] Fatal error in main():", error);
  console.error(
    "Error stack:",
    error instanceof Error ? error.stack : "No stack"
  );
  process.exit(1);
});
