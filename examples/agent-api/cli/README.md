# Bankr CLI

Chat with your Bankr AI wallet directly from the terminal. A beautiful TUI (Terminal User Interface) experience that lets you interact with Bankr just like the web interface.

## Features

- 🏦 **Chat Interface** - Send messages and receive responses in a familiar chat format
- ⚡ **Real-time Status** - See live status updates as your requests are processed
- 📝 **Transaction Display** - View transaction details when Bankr executes trades
- 🎨 **Markdown Rendering** - Properly formatted responses with styling
- ⌨️ **Keyboard Navigation** - Intuitive controls with Enter to send and Esc to cancel

## Prerequisites

- Node.js 18 or higher
- A Bankr API key (requires Bankr Club membership)

## Installation

```bash
# Install dependencies
npm install

# Or with bun
bun install
```

## Usage

### Set your API key

**Option 1: Environment variable**
```bash
export BANKR_API_KEY=bk_your_api_key_here
```

**Option 2: .env file (recommended)**

Create a `.env` file in the project directory:
```
BANKR_API_KEY=bk_your_api_key_here
```

### Run the CLI

```bash
# Development mode (with hot reload)
npm run dev

# Or with bun
bun run dev
```

### Keyboard Controls

| Key | Action |
|-----|--------|
| `Enter` | Send message |
| `Esc` | Cancel current job |
| `Ctrl+C` | Exit the application |
| Arrow keys | Navigate input |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BANKR_API_KEY` | Your Bankr API key (required) | - |
| `BANKR_API_URL` | API base URL | `http://localhost:3333` |

## Example Session

```
╔══════════════════════════════════════╗
║           🏦 BANKR CLI               ║
║      Chat with your AI wallet        ║
╚══════════════════════════════════════╝

You • 10:30 AM
┌────────────────────────────────────────┐
│ What is the current price of ETH?      │
└────────────────────────────────────────┘

🏦 Bankr • 10:30 AM
┌────────────────────────────────────────┐
│ $ETH is currently trading at $3,235.58 │
│                                        │
│ market data:                           │
│ - price: $3,235.58                     │
│ - 24h change: +3.28%                   │
│ - 24h volume: $39.23M                  │
└────────────────────────────────────────┘

❯ Type a message...
```

## Development

### Build

```bash
npm run build
```

### Type Check

```bash
npm run typecheck
```

## How It Works

The CLI uses the Agent API (`/agent/prompt`) which:

1. Does not require x402 payment (free for Bankr Club members)
2. Supports auto-execution of transactions
3. Returns structured responses with transaction data

The CLI polls the job status endpoint until completion and displays real-time status updates.

## Troubleshooting

### "API Key Not Configured"

Make sure you've set the `BANKR_API_KEY` environment variable:

```bash
export BANKR_API_KEY=bk_your_api_key_here
```

### "Bankr Club membership required"

The Wallet API requires Bankr Club membership. Visit the Bankr web app to sign up.

### "Connection refused"

Make sure you have the correct `BANKR_API_URL` configured and that you can reach the Bankr API server.

## License

MIT

