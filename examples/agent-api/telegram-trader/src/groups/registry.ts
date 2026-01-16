import type { GroupHandler } from "./types.js";

/** Registry for group handlers */
export class GroupRegistry {
  // Use 'any' for the context type since registry doesn't need to know specific types
  private handlers = new Map<number, GroupHandler<any>>();

  /**
   * Register a handler for a group
   * Only registers if the handler is enabled
   */
  register(handler: GroupHandler<any>): void {
    if (!handler.config.enabled) {
      console.log(`[Registry] Skipping disabled handler: ${handler.config.name}`);
      return;
    }

    this.handlers.set(handler.config.chatId, handler);
    console.log(
      `[Registry] Registered handler: ${handler.config.name} (${handler.config.chatId})`
    );
  }

  /**
   * Get handler for a specific chat ID
   */
  get(chatId: number): GroupHandler<any> | undefined {
    return this.handlers.get(chatId);
  }

  /**
   * Get all registered handlers
   */
  getAll(): GroupHandler<any>[] {
    return Array.from(this.handlers.values());
  }

  /**
   * Get all chat IDs being monitored
   */
  getChatIds(): number[] {
    return Array.from(this.handlers.keys());
  }
}
