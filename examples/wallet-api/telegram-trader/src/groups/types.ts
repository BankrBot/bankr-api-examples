import type { MessageContext, TradeDecision } from "../types";
import type { BankrClient } from "../bankr/client";

/** Configuration for a monitored group */
export interface GroupConfig {
  /** Telegram chat ID (negative for groups/supergroups) */
  chatId: number;
  /** Human-readable name for logging */
  name: string;
  /** Whether this handler is active */
  enabled: boolean;
}

/** Parameters passed to execute() method */
export interface ExecuteParams<TContext> {
  /** The Telegram message context */
  context: MessageContext;
  /** The execution context returned from decide() */
  executionContext: TContext;
  /** Bankr API client for making trades */
  bankrClient: BankrClient;
}

/** Handler for a specific Telegram group */
export interface GroupHandler<TContext = void> {
  /** Group configuration */
  readonly config: GroupConfig;

  /**
   * Process a message and decide whether to trade
   * Returns decision with typed execution context
   * @param context The full message context (includes text, sender, reply info, etc.)
   * @returns Decision about whether to trade with typed execution context
   */
  decide(context: MessageContext): Promise<TradeDecision<TContext>>;

  /**
   * Execute the trade using the execution context from decide()
   * Only called if decide() returned shouldTrade: true
   * @param params Execution parameters including context, executionContext, and bankrClient
   */
  execute(params: ExecuteParams<TContext>): Promise<void>;
}
