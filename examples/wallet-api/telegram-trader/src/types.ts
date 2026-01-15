/** Token extracted from a message */
export interface ExtractedToken {
  /** The token identifier (ticker, address, or contract from URL) */
  identifier: string;
  /** How the token was identified */
  type: "evm_address";
  /** Original matched text from the message */
  raw: string;
}

/** Context about a Telegram message */
export interface MessageContext {
  /** Telegram chat ID (negative for groups) */
  chatId: number;
  /** Message ID */
  messageId: number;
  /** Message text content */
  text: string;
  /** Sender info */
  sender: {
    id: number;
    username?: string;
    firstName?: string;
  };
  /** Reply context if this message is a reply */
  replyTo?: {
    messageId: number;
    text?: string;
  };
  /** Message timestamp */
  date: Date;
}

/** Decision about whether to trade based on a message */
export interface TradeDecision<TContext = void> {
  /** Whether to execute a trade */
  shouldTrade: boolean;
  /** Reason for the decision (for logging) */
  reason: string;
  /** Execution context - only present if shouldTrade is true */
  executionContext?: TContext;
}
