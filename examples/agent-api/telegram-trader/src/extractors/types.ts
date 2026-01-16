import type { ExtractedToken, MessageContext } from "../types";

/** Interface for token extractors (utility classes) */
export interface TokenExtractor {
  /** Unique name for this extractor */
  readonly name: string;

  /**
   * Extract tokens from message context
   * @param context The full message context (includes text, sender, etc.)
   * @returns Array of extracted tokens (may be empty)
   */
  extract(context: MessageContext): ExtractedToken[];
}
