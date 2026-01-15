import type { ExtractedToken, MessageContext } from "../types";
import type { TokenExtractor } from "./types";

/**
 * Extracts $TICKER format tokens from text
 * Matches patterns like $BTC, $SOL, $BONK, $WHITEPEPE
 */
export class TickerExtractor implements TokenExtractor {
  readonly name = "ticker";

  // Matches $TICKER (2-15 uppercase letters)
  private readonly pattern = /\$([A-Z]{2,15})\b/gi;

  extract(context: MessageContext): ExtractedToken[] {
    const text = context.text;
    const tokens: ExtractedToken[] = [];
    // Reset lastIndex for global regex
    this.pattern.lastIndex = 0;

    let match: RegExpExecArray | null;
    while ((match = this.pattern.exec(text)) !== null) {
      tokens.push({
        identifier: match[1].toUpperCase(),
        type: "ticker",
        raw: match[0],
      });
    }

    return tokens;
  }
}
