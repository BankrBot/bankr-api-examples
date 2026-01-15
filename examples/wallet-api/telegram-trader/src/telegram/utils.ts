import type { TelegramClient } from "@mtcute/node";

/**
 * Resolve a group's name from Telegram
 * @param client Connected Telegram client
 * @param chatId The chat ID to resolve
 * @returns The group's title, or a fallback string
 */
export async function resolveGroupName(
  client: TelegramClient,
  chatId: number
): Promise<string> {
  try {
    const chat = await client.getChat(chatId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c = chat as any;
    return c.title || c.name || `Chat ${chatId}`;
  } catch {
    return `Chat ${chatId}`;
  }
}
