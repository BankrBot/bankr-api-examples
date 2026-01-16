# Telegram Trader Bot

A simple proof-of-concept bot that monitors Telegram groups for token addresses and automatically executes trades via the Bankr Agent API.

> **Proof of Concept**: This is a minimal example to demonstrate Telegram + Bankr integration. It's meant to be extended and customized for your specific use cases.

## What It Does

1. Connects to your Telegram account (user client, not bot)
2. Monitors specified groups for messages from trusted users
3. Extracts EVM token addresses from messages
4. Automatically executes buy orders via Bankr with limit/stop orders

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│ Telegram Groups │────▶│ Message      │────▶│ Bankr API   │
│                 │     │ Handlers     │     │ (Execute)   │
└─────────────────┘     └──────────────┘     └─────────────┘
         │                     │
         │              ┌──────┴──────┐
         │              │  Extractors │
         │              │  (EVM, etc) │
         │              └─────────────┘
         │
    ┌────┴────┐
    │ Registry│ ← Configure which groups to watch
    └─────────┘
```

## Prerequisites

- Node.js 18+
- Telegram API credentials (from https://my.telegram.org)
- Bankr API key (from https://bankr.bot/api)

## Setup

### 1. Install dependencies

```bash
bun install
# or
npm install
```

### 2. Configure environment

Create a `.env` file:

```bash
# Telegram (get from https://my.telegram.org)
TELEGRAM_API_ID=your_api_id
TELEGRAM_API_HASH=your_api_hash

# Bankr
BANKR_API_KEY=bk_your_api_key
BANKR_API_URL=https://api.bankr.bot  # optional, defaults to this
```

### 3. Find your group chat IDs

```bash
bun run start list-groups
```

This will list all your groups/channels with their IDs.

### 4. Configure group handlers

Edit `src/groups/config.ts` to add your groups:

```typescript
export const GROUP_HANDLERS: GroupHandlerEntry[] = [
  {
    chatId: -1001234567890,  // Your group's chat ID (from step 3)
    enabled: true,
    create: (params) =>
      new EVMTrustedUserHandler(
        { chatId: -1001234567890, name: params.resolvedName, enabled: true },
        "trusted_username"  // Only trades based on this user's messages
      ),
  },
];
```

### 5. Run the bot

```bash
bun run start
# or
npm start
```

On first run, you'll be prompted to authenticate with Telegram.

## CLI Commands

| Command | Description |
|---------|-------------|
| `bun run start` | Run the trading bot (default) |
| `bun run start list-groups` | List all your groups/channels with IDs |
| `bun run start --verbose` | Run with debug logging |

## Extending the Bot

### Custom Handlers

Create new handlers in `src/groups/handlers/`:

```typescript
export class MyCustomHandler implements GroupHandler<MyContext> {
  async decide(context: MessageContext): Promise<TradeDecision<MyContext>> {
    // Your logic to decide whether to trade
  }

  async execute(params: ExecuteParams<MyContext>): Promise<void> {
    // Your trade execution logic using params.bankrClient
  }
}
```

### Custom Extractors

Add extractors in `src/extractors/` for different token identification strategies. Extractors receive the full `MessageContext`, so they can:

- **Extract token patterns**: EVM addresses, Solana addresses, $TICKER symbols, URLs (pump.fun, dexscreener, etc.)
- **Filter by sender**: Only extract from specific trusted users or verified accounts
- **Analyze surrounding text**: Use context clues to determine token intent (e.g., "buying X" vs "sold X")
- **Apply heuristics**: Combine multiple signals (message format, reply context, user history) to decide if a tradeable token is present

```typescript
// Example: Extractor that only returns tokens from trusted users
export class TrustedUserExtractor implements TokenExtractor {
  private trustedUsers = new Set(['alice', 'bob']);

  extract(context: MessageContext): ExtractedToken[] {
    // Skip if sender is not trusted
    if (!this.trustedUsers.has(context.sender.username ?? '')) {
      return [];
    }

    // Only then look for token patterns...
    return this.findTokenPatterns(context.text);
  }
}
```

```typescript
// Example: Extractor that checks message context for buy signals
export class BuySignalExtractor implements TokenExtractor {
  extract(context: MessageContext): ExtractedToken[] {
    const text = context.text.toLowerCase();
    
    // Only extract if message indicates buying intent
    const isBuySignal = text.includes('buying') || 
                        text.includes('aping') || 
                        text.includes('entry');
    
    if (!isBuySignal) return [];

    // Extract token addresses only from buy-intent messages
    return this.extractAddresses(context.text);
  }
}
```

## Example Use Cases

- **Copy trading**: Mirror trades from alpha callers
- **Alert-based trading**: Auto-buy tokens mentioned in signal groups
- **Portfolio automation**: Rebalance based on group sentiment
- **Research automation**: Track addresses mentioned by influencers

## Security Notes

- Uses Telegram user client (your account), not a bot token
- Store credentials securely (never commit `.env`)
- The bot can execute real trades - test with small amounts first
- Consider rate limiting for production use

## License

MIT
