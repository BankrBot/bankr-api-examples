import type { ExtractedToken, MessageContext } from "../types";
import type { TokenExtractor } from "./types";

/**
 * Extracts EVM addresses (Ethereum, Base, Arbitrum, etc.)
 * Matches 0x followed by 40 hexadecimal characters (42 total)
 */
export class EVMAddressExtractor implements TokenExtractor {
  readonly name = "evm_address";

  // EVM addresses: 0x followed by 40 hex chars (0-9a-f)
  private readonly pattern = /\b(0x[a-fA-F0-9]{40})\b/g;

  extract(context: MessageContext): ExtractedToken[] {
    const text = context.text;
    const tokens: ExtractedToken[] = [];
    this.pattern.lastIndex = 0;

    let match: RegExpExecArray | null;
    while ((match = this.pattern.exec(text)) !== null) {
      tokens.push({
        identifier: match[1].toLowerCase(), // Normalize to lowercase
        type: "evm_address",
        raw: match[0],
      });
    }

    return tokens;
  }
}
