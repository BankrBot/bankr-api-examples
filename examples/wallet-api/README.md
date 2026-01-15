# Wallet API Examples

Examples demonstrating how to build applications using the Bankr Wallet API.

## About the Wallet API

The Wallet API enables you to chat with your Bankr AI wallet assistant programmatically. It supports:

- Natural language queries about your wallet, balances, and market data
- Auto-execution of transactions (swaps, transfers, etc.)
- Real-time status updates during processing

## Requirements

- Bankr Club membership
- API key from https://bankr.bot/api

## Examples

| Example | Description | Tech Stack |
|---------|-------------|------------|
| [CLI](./cli) | Terminal chat interface with real-time status updates | Node.js, Ink (React for CLI) |
| [Voice](./voice) | Voice-powered web app with speech recognition | Next.js, Web Speech API |

## API Overview

The Wallet API uses a job-based model:

1. **Submit a prompt** via `POST /wallet/prompt`
2. **Poll for status** via `GET /wallet/prompt/:jobId`
3. **Receive the response** when the job completes

Each example demonstrates this pattern with appropriate UI feedback for its platform.
