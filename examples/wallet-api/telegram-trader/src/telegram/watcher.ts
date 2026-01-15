import { TelegramClient } from "@mtcute/node";
import { Dispatcher } from "@mtcute/dispatcher";
import type { Message } from "@mtcute/node";
import type { MessageContext } from "../types";
import type { GroupRegistry } from "../groups/registry";
import type { BankrClient } from "../bankr/client";

/**
 * Transform mtcute Message to our MessageContext
 */
function toMessageContext(msg: Message): MessageContext | null {
  // Only handle text messages
  const text = msg.text;
  if (!text) return null;

  const sender = msg.sender;
  const replyInfo = msg.replyToMessage;

  return {
    chatId: msg.chat.id,
    messageId: msg.id,
    text,
    sender: {
      id: sender?.id ?? 0,
      username: sender && "username" in sender ? (sender.username ?? undefined) : undefined,
      firstName: sender && "firstName" in sender ? (sender.firstName ?? undefined) : undefined,
    },
    replyTo: replyInfo?.id ? { messageId: replyInfo.id } : undefined,
    date: msg.date,
  };
}

/**
 * Setup message watching for all registered groups
 */
export function setupWatcher(
  client: TelegramClient,
  registry: GroupRegistry,
  bankrClient: BankrClient
): Dispatcher<TelegramClient> {
  const dp = Dispatcher.for(client);

  const chatIds = registry.getChatIds();

  if (chatIds.length === 0) {
    console.log("[Watcher] No groups registered - nothing to watch");
    return dp;
  }

  console.log(`[Watcher] Watching ${chatIds.length} group(s): ${chatIds.join(", ")}`);

  // Register handler for new messages
  dp.onNewMessage(async (msg: Message) => {
    // Check if this chat is in our registry
    const handler = registry.get(msg.chat.id);
    if (!handler) return; // Not a monitored chat

    const context = toMessageContext(msg);
    if (!context) return; // Skip non-text messages

    console.log(
      `[${handler.config.name}] Message from ${context.sender.username || context.sender.id}: ${context.text.slice(0, 50)}...`
    );

    // If message is a reply, fetch the original message text for context
    if (context.replyTo && !context.replyTo.text) {
      try {
        const messages = await client.getMessages(msg.chat.id, [
          context.replyTo.messageId,
        ]);
        const replyMsg = messages[0];
        if (replyMsg && replyMsg.text) {
          context.replyTo.text = replyMsg.text;
        }
      } catch {
        // Couldn't fetch reply, continue with what we have
        console.log(`[${handler.config.name}] Could not fetch reply message`);
      }
    }

    // Handler decides what to do - it has full control
    const decision = await handler.decide(context);

    if (!decision.shouldTrade) {
      console.log(`[${handler.config.name}] Decision: ${decision.reason}`);
      return;
    }

    // Ensure execution context is present
    if (!decision.executionContext) {
      throw new Error(
        `Handler ${handler.config.name} returned shouldTrade but no executionContext`
      );
    }

    // Execute trade using handler's execute method
    try {
      await handler.execute({
        context,
        executionContext: decision.executionContext,
        bankrClient,
      });
    } catch (error) {
      console.error(
        `[${handler.config.name}] Trade error:`,
        error instanceof Error ? error.message : error
      );
    }
  });

  return dp;
}
