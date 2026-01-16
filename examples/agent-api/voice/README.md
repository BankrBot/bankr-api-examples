# Bankr Voice

A voice-powered web interface for interacting with Bankr. Speak to your AI wallet assistant and hear responses read aloud.

## Features

- 🎤 **Voice Input**: Speak naturally using your browser's speech recognition
- 🔊 **Voice Output**: Responses are read aloud using text-to-speech
- 📺 **Retro TV Design**: Fun, pixel-art inspired interface
- ⚡ **Real-time Updates**: Status updates are spoken as the agent processes
- 🚫 **Cancel Support**: Stop processing at any time

## Requirements

- **Browser**: Chrome, Edge, or Safari (Firefox not supported - limited speech recognition)
- **API Key**: Generate one at https://bankr.bot/api

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your Bankr API key:
   ```
   BANKR_API_URL=https://api-staging.bankr.bot
   BANKR_API_KEY=bk_your_api_key_here
   ```

3. **Run the development server**:
```bash
npm run dev
   ```

4. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Click the TV screen** (or press `Space`) to start listening
2. **Speak your request** - e.g., "What's my wallet balance?"
3. **Wait for the response** - Bankr will process and speak the response
4. **Press `Escape`** to cancel at any time

## How It Works

This application demonstrates the Bankr Agent API:

1. **Voice → Text**: Browser's Web Speech API converts your speech to text
2. **Text → Bankr**: Your message is sent to the Bankr API via secure backend routes
3. **Processing**: The app polls for job status and reads updates aloud
4. **Response**: The final response is read aloud using text-to-speech

The API key is kept secure on the server - it's never exposed to the browser.

## Tech Stack

- [Next.js 14](https://nextjs.org/) - React framework with App Router
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) - Speech recognition & synthesis

## Project Structure

```
src/
├── app/
│   ├── api/bankr/       # Backend API routes (proxies to Bankr API)
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main voice interface
├── components/
│   ├── RetroTV.tsx      # TV housing and controls
│   ├── TVScreen.tsx     # Animated screen with face
│   ├── PixelFace.tsx    # 8-bit animated face
│   └── ...
├── hooks/
│   ├── useSpeechRecognition.ts  # Speech-to-text hook
│   ├── useSpeechSynthesis.ts    # Text-to-speech hook
│   ├── useVoiceState.ts         # State machine
│   └── useBankrApi.ts           # API interaction
└── services/speech/     # Abstracted speech services
```

## Future Improvements

The speech services are abstracted to allow swapping in better providers:
- **Better STT**: Whisper, Deepgram, or AssemblyAI
- **Better TTS**: ElevenLabs, OpenAI TTS, or Azure Speech

## License

Part of the Bankr project.
