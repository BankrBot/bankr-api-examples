/** CLI command definitions */

export interface Command {
  name: string;
  description: string;
  run: () => Promise<void>;
}

const commands = new Map<string, Command>();

export function registerCommand(command: Command): void {
  commands.set(command.name, command);
}

export function getCommand(name: string): Command | undefined {
  return commands.get(name);
}

export function getAllCommands(): Command[] {
  return Array.from(commands.values());
}

export function printHelp(): void {
  console.log("Telegram Trading Bot\n");
  console.log("Usage: bun run start [command]\n");
  console.log("Commands:");
  console.log("  (none)         Run the trading bot");
  for (const cmd of getAllCommands()) {
    console.log(`  ${cmd.name.padEnd(13)}  ${cmd.description}`);
  }
  console.log("  help           Show this help message");
}

export function parseArgs(): { command: string | null; args: string[] } {
  const args = process.argv.slice(2);
  const command = args[0] || null;
  return { command, args: args.slice(1) };
}
