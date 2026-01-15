import type { ExtractedToken, MessageContext } from "../types";
import type { TokenExtractor } from "./types";

/**
 * Extracts Solana addresses from text
 * Matches base58 addresses (32-44 characters)
 */
export class SolanaAddressExtractor implements TokenExtractor {
  readonly name = "solana_address";

  // Solana addresses are base58 encoded, 32-44 chars
  // Base58 alphabet: 123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz
  private readonly pattern = /\b([1-9A-HJ-NP-Za-km-z]{32,44})\b/g;

  // Common false positives to filter out
  private readonly excludePatterns = [
    /^[A-Za-z]+$/, // All letters (likely a word)
    /^[0-9]+$/, // All numbers
  ];

  extract(context: MessageContext): ExtractedToken[] {
    const text = context.text;
    const tokens: ExtractedToken[] = [];
    this.pattern.lastIndex = 0;

    let match: RegExpExecArray | null;
    while ((match = this.pattern.exec(text)) !== null) {
      const candidate = match[1];

      // Skip if it matches exclude patterns
      const isExcluded = this.excludePatterns.some((p) => p.test(candidate));
      if (isExcluded) continue;

      // Must have mix of letters and numbers (typical of addresses)
      const hasLetters = /[A-Za-z]/.test(candidate);
      const hasNumbers = /[0-9]/.test(candidate);
      if (!hasLetters || !hasNumbers) continue;

      tokens.push({
        identifier: candidate,
        type: "solana_address",
        raw: match[0],
      });
    }

    return tokens;
  }
}
