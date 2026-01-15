import type { ExtractedToken, MessageContext } from "../types";
import type { TokenExtractor } from "./types";

/**
 * Extracts token addresses from pump.fun URLs
 * Matches patterns like:
 * - pump.fun/coin/ADDRESS
 * - pump.fun/ADDRESS
 */
export class PumpFunExtractor implements TokenExtractor {
  readonly name = "pump_fun";

  // Matches pump.fun URLs with token address
  private readonly pattern =
    /pump\.fun\/(?:coin\/)?([1-9A-HJ-NP-Za-km-z]{32,44})/gi;

  extract(context: MessageContext): ExtractedToken[] {
    const text = context.text;
    const tokens: ExtractedToken[] = [];
    this.pattern.lastIndex = 0;

    let match: RegExpExecArray | null;
    while ((match = this.pattern.exec(text)) !== null) {
      tokens.push({
        identifier: match[1],
        type: "pump_fun_url",
        raw: match[0],
      });
    }

    return tokens;
  }
}
