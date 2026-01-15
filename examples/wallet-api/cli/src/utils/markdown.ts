import chalk from "chalk";

/**
 * Simple markdown renderer for terminal output.
 * Handles common markdown patterns without external dependencies.
 */
export function renderMarkdown(text: string): string {
  if (!text) return "";

  let result = text;

  // Headers
  result = result.replace(/^### (.+)$/gm, chalk.bold.cyan("   $1"));
  result = result.replace(/^## (.+)$/gm, chalk.bold.cyan("  $1"));
  result = result.replace(/^# (.+)$/gm, chalk.bold.cyan(" $1"));

  // Bold
  result = result.replace(/\*\*([^*]+)\*\*/g, chalk.bold("$1"));
  result = result.replace(/__([^_]+)__/g, chalk.bold("$1"));

  // Italic
  result = result.replace(/\*([^*]+)\*/g, chalk.italic("$1"));
  result = result.replace(/_([^_]+)_/g, chalk.italic("$1"));

  // Inline code
  result = result.replace(/`([^`]+)`/g, chalk.bgGray.white(" $1 "));

  // Code blocks (simple handling)
  result = result.replace(/```[\s\S]*?```/g, (match) => {
    const code = match.replace(/```\w*\n?/g, "").replace(/```$/g, "");
    return chalk.bgGray.white(`\n${code}\n`);
  });

  // Links [text](url) -> text (url)
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
    return `${chalk.cyan(text)} ${chalk.dim(`(${url})`)}`;
  });

  // Bullet points
  result = result.replace(/^[-*] (.+)$/gm, `  ${chalk.dim("•")} $1`);

  // Numbered lists
  result = result.replace(/^(\d+)\. (.+)$/gm, `  ${chalk.dim("$1.")} $2`);

  // Horizontal rules
  result = result.replace(/^[-*_]{3,}$/gm, chalk.dim("─".repeat(40)));

  // Blockquotes
  result = result.replace(/^> (.+)$/gm, chalk.dim("│ ") + chalk.italic("$1"));

  return result;
}

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Word wrap text to fit terminal width
 */
export function wordWrap(text: string, maxWidth: number): string {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (currentLine.length + word.length + 1 <= maxWidth) {
      currentLine += (currentLine ? " " : "") + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines.join("\n");
}

/**
 * Strip ANSI codes from a string (for length calculation)
 */
export function stripAnsi(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1B\[[0-9;]*m/g, "");
}

/**
 * Pad text to a fixed width
 */
export function padEnd(text: string, width: number): string {
  const visibleLength = stripAnsi(text).length;
  const padding = Math.max(0, width - visibleLength);
  return text + " ".repeat(padding);
}

/**
 * Center text within a fixed width
 */
export function center(text: string, width: number): string {
  const visibleLength = stripAnsi(text).length;
  const totalPadding = Math.max(0, width - visibleLength);
  const leftPadding = Math.floor(totalPadding / 2);
  const rightPadding = totalPadding - leftPadding;
  return " ".repeat(leftPadding) + text + " ".repeat(rightPadding);
}
