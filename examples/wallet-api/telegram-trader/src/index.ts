import { setDefaultCommand, setupCli } from "./cli";
import { runBot } from "./commands/run";

// Register all commands (they self-register on import)
import "./commands/list-groups";

// Set default command (runs when no command is specified)
// Global flags (like --verbose) are handled at program level in cli.ts
setDefaultCommand(runBot);

// Parse CLI arguments and execute
setupCli().catch((error) => {
  console.error("Fatal error:", error instanceof Error ? error.message : error);
  process.exit(1);
});
