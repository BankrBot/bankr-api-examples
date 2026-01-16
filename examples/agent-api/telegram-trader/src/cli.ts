import { Command as CommanderCommand } from "commander";

/** Options for registering a command */
export interface CommandOptions {
  /** Command name */
  name: string;
  /** Command description */
  description: string;
  /** Command action function */
  action: (...args: any[]) => Promise<void> | void;
  /** Optional flags for this command */
  flags?: Array<{
    name: string;
    alias?: string;
    description: string;
    defaultValue?: boolean | string;
  }>;
}

/** CLI setup and command registry */
class CLI {
  private program: CommanderCommand;
  private commands: Map<string, CommanderCommand> = new Map();

  constructor() {
    this.program = new CommanderCommand();
    this.program
      .name("telegram-trader")
      .description("Telegram trading bot using Bankr Wallet API")
      .version("1.0.0")
      // Add global flags that work for default command
      .option("-v, --verbose", "Enable verbose/debug logging");
  }

  /**
   * Register a command with optional flags
   */
  registerCommand(options: CommandOptions): void {
    const cmd = this.program
      .command(options.name)
      .description(options.description)
      .action(async (...args) => {
        try {
          await options.action(...args);
        } catch (error) {
          console.error(
            `Error executing command '${options.name}':`,
            error instanceof Error ? error.message : error
          );
          process.exit(1);
        }
      });

    // Add flags if provided
    if (options.flags) {
      for (const flag of options.flags) {
        if (flag.defaultValue !== undefined) {
          if (typeof flag.defaultValue === "boolean") {
            cmd.option(
              `--${flag.name} [value]`,
              flag.description,
              flag.defaultValue
            );
          } else {
            cmd.option(`--${flag.name} <value>`, flag.description, flag.defaultValue);
          }
        } else {
          if (flag.alias) {
            cmd.option(`-${flag.alias}, --${flag.name}`, flag.description);
          } else {
            cmd.option(`--${flag.name}`, flag.description);
          }
        }
      }
    }

    this.commands.set(options.name, cmd);
  }

  /**
   * Set up the default command (when no command is specified)
   */
  setDefaultCommand(action: () => Promise<void> | void): void {
    this.program.action(async () => {
      try {
        await action();
      } catch (error) {
        console.error(
          "Error executing default command:",
          error instanceof Error ? error.message : error
        );
        process.exit(1);
      }
    });
  }

  /**
   * Parse arguments and execute the appropriate command
   */
  async parse(): Promise<void> {
    await this.program.parseAsync(process.argv);
  }

  /**
   * Get the parsed options for the current command
   */
  getOptions(): Record<string, any> {
    return this.program.opts();
  }
}

// Singleton instance
let cliInstance: CLI | null = null;

/**
 * Get or create the CLI instance
 */
function getCLI(): CLI {
  if (!cliInstance) {
    cliInstance = new CLI();
  }
  return cliInstance;
}

/**
 * Register a command with optional flags
 */
export function registerCommand(options: CommandOptions): void {
  getCLI().registerCommand(options);
}

/**
 * Set the default command (runs when no command is specified)
 */
export function setDefaultCommand(action: () => Promise<void> | void): void {
  getCLI().setDefaultCommand(action);
}

/**
 * Parse CLI arguments and execute the appropriate command
 */
export async function setupCli(): Promise<void> {
  await getCLI().parse();
}

/**
 * Get parsed options for the current command
 */
export function getOptions(): Record<string, any> {
  return getCLI().getOptions();
}
