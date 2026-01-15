import type { GroupHandler } from "./types";
import { EVMTrustedUserHandler } from "./handlers/evm-trusted-user";

export interface CreateHandlerParams {
  /** Resolved group name from Telegram */
  resolvedName: string;
  // Add more params here as needed in the future
}

export interface GroupHandlerEntry {
  /** Telegram chat ID */
  chatId: number;
  /** Whether this handler is enabled */
  enabled: boolean;
  /** Factory function that creates the handler with params */
  create: (params: CreateHandlerParams) => GroupHandler<any>;
}

/**
 * Centralized configuration for all group handlers
 * Add new groups here by creating handler instances directly
 */
export const GROUP_HANDLERS: GroupHandlerEntry[] = [
  {
    chatId: -5231913338,
    enabled: true,
    create: (params) =>
      new EVMTrustedUserHandler(
        { chatId: -5231913338, name: params.resolvedName, enabled: true },
        "aspynp"
      ),
  },
  // Add more groups here:
  // {
  //   chatId: -1001234567890,
  //   enabled: false,
  //   create: (params) =>
  //     new YourHandler({ chatId: -1001234567890, name: params.resolvedName, enabled: false }),
  // },
];
