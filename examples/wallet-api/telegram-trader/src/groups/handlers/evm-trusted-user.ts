import type { GroupHandler, GroupConfig, ExecuteParams } from "../types";
import type {
  MessageContext,
  TradeDecision,
  ExtractedToken,
} from "../../types";
import { EVMAddressExtractor } from "../../extractors";

/**
 * Execution context for EVM trusted user handler
 */
interface EVMExecutionContext {
  token: ExtractedToken;
  amount: number;
  fullMessage: string;
}

/**
 * Handler for extracting EVM addresses from messages sent by a trusted user
 * Includes full message context in the trade prompt
 */
export class EVMTrustedUserHandler
  implements GroupHandler<EVMExecutionContext>
{
  readonly config: GroupConfig;
  private readonly evmExtractor = new EVMAddressExtractor();
  private readonly trustedUsername: string;

  constructor(config: GroupConfig, trustedUsername: string) {
    this.config = config;
    this.trustedUsername = trustedUsername;
  }

  async decide(
    context: MessageContext
  ): Promise<TradeDecision<EVMExecutionContext>> {
    // Only process messages from trusted user
    if (context.sender.username !== this.trustedUsername) {
      return {
        shouldTrade: false,
        reason: `Not from @${this.trustedUsername}`,
      };
    }

    // Extract EVM addresses from this message
    const evmTokens = this.evmExtractor.extract(context);

    if (evmTokens.length === 0) {
      return { shouldTrade: false, reason: "No EVM address found" };
    }

    const token = evmTokens[0];

    return {
      shouldTrade: true,
      reason: `Found EVM address from @${this.trustedUsername}: ${token.raw}`,
      executionContext: {
        token,
        amount: 0.5,
        fullMessage: context.text,
      },
    };
  }

  async execute(params: ExecuteParams<EVMExecutionContext>): Promise<void> {
    const { executionContext, bankrClient } = params;

    const prompt = `Buy $${executionContext.amount} of ${executionContext.token.identifier}. Set a limit order to sell it all if price doubles. Set a stop loss to sell it all if price drops by 50%.`;

    const result = await bankrClient.executePrompt(
      prompt,
      (status, message) => {
        console.log(`[${this.config.name}] [${status}] ${message}`);
      },
      {
        onAgentStatusUpdate: (message) => {
          console.log(`[${this.config.name}] Agent: ${message}`);
        },
      }
    );

    if (result.status === "completed") {
      console.log(`[${this.config.name}] Trade completed: ${result.response}`);
      if (result.transactions && result.transactions.length > 0) {
        for (const tx of result.transactions) {
          console.log(
            `[${this.config.name}] Transaction: ${
              tx.metadata?.humanReadableMessage || tx.type
            }`
          );
        }
      }
    } else {
      console.log(
        `[${this.config.name}] Trade ended with status: ${result.status}`
      );
      if (result.error) {
        console.log(`[${this.config.name}] Error: ${result.error}`);
      }
    }
  }
}
