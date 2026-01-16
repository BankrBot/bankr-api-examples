# Agent API Examples

Examples demonstrating how to build applications using the Bankr Agent API.

## About the Agent API

The Agent API enables you to chat with your Bankr AI agent programmatically. It supports:

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
| [Telegram Trader](./telegram-trader) | Simple PoC bot that monitors Telegram groups for tokens and auto-executes trades | Node.js, mtcute, Commander |

## API Overview

The Agent API uses a job-based model:

1. **Submit a prompt** via `POST /agent/prompt`
2. **Poll for status** via `GET /agent/job/:jobId`
3. **Receive the response** when the job completes

Each example demonstrates this pattern with appropriate UI feedback for its platform.
