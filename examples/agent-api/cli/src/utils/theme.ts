import chalk from "chalk";

// Bankr brand colors
export const colors = {
  // Primary brand colors
  primary: chalk.hex("#8B5CF6"), // Violet
  primaryBg: chalk.bgHex("#8B5CF6"),

  // Status colors
  success: chalk.hex("#22C55E"), // Green
  error: chalk.hex("#EF4444"), // Red
  warning: chalk.hex("#F59E0B"), // Yellow
  info: chalk.hex("#3B82F6"), // Blue

  // Text colors
  text: chalk.white,
  textMuted: chalk.gray,
  textDim: chalk.dim,

  // Message colors
  userMessage: chalk.cyan,
  assistantMessage: chalk.white,
  systemMessage: chalk.yellow,

  // UI elements
  border: chalk.gray,
  highlight: chalk.hex("#8B5CF6"),
};

// Symbols for UI elements
export const symbols = {
  prompt: "❯",
  thinking: "◌",
  success: "✓",
  error: "✗",
  warning: "⚠",
  info: "ℹ",
  arrow: "→",
  bullet: "•",
  bankr: "🏦",
  user: "👤",
};

// Status display configuration
export const statusConfig = {
  pending: {
    symbol: "◌",
    color: colors.warning,
    text: "Thinking...",
  },
  processing: {
    symbol: "◐",
    color: colors.info,
    text: "Working on it...",
  },
  completed: {
    symbol: "✓",
    color: colors.success,
    text: "Done!",
  },
  failed: {
    symbol: "✗",
    color: colors.error,
    text: "Failed",
  },
  cancelled: {
    symbol: "○",
    color: colors.textMuted,
    text: "Cancelled",
  },
};

// Spinner frames for loading animation
export const spinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

// Header ASCII art
export const headerArt = `
╔══════════════════════════════════════╗
║           ${colors.primary("BANKR CLI")}                 ║
║      ${colors.textMuted("Chat with Bankr")}       ║
╚══════════════════════════════════════╝
`;

// Simple header
export const simpleHeader = colors.primary("━".repeat(40));

export function formatTimestamp(date: Date): string {
  return colors.textDim(
    date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  );
}

export function formatError(message: string): string {
  return colors.error(`${symbols.error} ${message}`);
}

export function formatSuccess(message: string): string {
  return colors.success(`${symbols.success} ${message}`);
}

export function formatWarning(message: string): string {
  return colors.warning(`${symbols.warning} ${message}`);
}

export function formatInfo(message: string): string {
  return colors.info(`${symbols.info} ${message}`);
}
