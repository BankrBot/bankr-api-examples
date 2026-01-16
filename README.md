# Bankr API Examples

A collection of example projects demonstrating how to build applications on top of the Bankr API.

## Overview

This repository provides ready-to-use examples showing different ways to integrate with Bankr APIs. Each example is a complete, working project that you can run locally or use as a starting point for your own applications.

## Examples

### Wallet API

The Wallet API allows you to interact with your Bankr AI wallet programmatically. These examples demonstrate various interfaces for chatting with your wallet assistant.

| Example | Description |
|---------|-------------|
| [CLI](./examples/wallet-api/cli) | Terminal-based chat interface using Ink (React for CLI). Send messages and receive responses directly from your terminal. |
| [Voice](./examples/wallet-api/voice) | Voice-powered web interface with speech recognition and text-to-speech. Speak to your wallet and hear responses aloud. |
| [Telegram Trader](./examples/wallet-api/telegram-trader) | Simple proof-of-concept bot that monitors Telegram groups and auto-executes trades via Bankr. Extend for your own use cases. |

## Prerequisites

- A Bankr account
- A Bankr API key with wallet access enabled (generate one at https://bankr.bot/api)

## Getting Started

1. Clone this repository
2. Navigate to an example directory
3. Follow the README instructions in that example

## Repository Structure

```
bankr-api-examples/
└── examples/
    └── wallet-api/          # Wallet API examples
        ├── cli/             # Terminal chat interface
        ├── voice/           # Voice-powered web interface
        └── telegram-trader/ # Telegram trading bot (PoC)
```

## Adding New Examples

This repository is organized by API. To add a new example:

1. Create a directory under the appropriate API folder (e.g., `examples/wallet-api/`)
2. Include a README with setup instructions
3. Ensure the example is self-contained with its own dependencies

## License

MIT
