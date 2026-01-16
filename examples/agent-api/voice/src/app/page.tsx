"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RetroTV } from "@/components/RetroTV";
import { CancelButton } from "@/components/CancelButton";
import { UnsupportedBrowser } from "@/components/UnsupportedBrowser";
import { useVoiceState } from "@/hooks/useVoiceState";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useBankrApi } from "@/hooks/useBankrApi";
import { useAudioAnalyzer } from "@/hooks/useAudioAnalyzer";

export default function VoicePage() {
  const { context, actions } = useVoiceState();
  const { submitAndPoll, cancelJob, stopPolling } = useBankrApi();
  const {
    volume,
    waveform,
    isActive: isAnalyzerActive,
    start: startAnalyzer,
    stop: stopAnalyzer,
  } = useAudioAnalyzer();
  const {
    transcript,
    start: startRecognition,
    stop: stopRecognition,
    resetTranscript,
    isSupported: sttSupported,
  } = useSpeechRecognition();
  const {
    speak,
    cancel: cancelSpeech,
    isSupported: ttsSupported,
  } = useSpeechSynthesis({
    onEnd: () => {
      if (context.state === "speaking") {
        actions.speakingComplete();
      }
    },
  });

  const currentJobIdRef = useRef<string | null>(null);
  const hasSubmittedRef = useRef(false);
  const [browserChecked, setBrowserChecked] = useState(false);

  // === HANDLERS (defined before effects that use them) ===

  const handleStart = useCallback(async () => {
    if (context.state !== "idle" && context.state !== "error") return;
    hasSubmittedRef.current = false;
    resetTranscript();
    actions.startListening();
    startRecognition();
    startAnalyzer().catch(() => {});
  }, [
    context.state,
    actions,
    startRecognition,
    resetTranscript,
    startAnalyzer,
  ]);

  const handleSend = useCallback(() => {
    if (
      context.state !== "listening" ||
      !transcript.trim() ||
      hasSubmittedRef.current
    )
      return;
    hasSubmittedRef.current = true;
    stopRecognition();
    stopAnalyzer();
    // Small delay for mic to release before TTS
    setTimeout(() => actions.onSilenceDetected(), 100);
  }, [context.state, transcript, stopRecognition, stopAnalyzer, actions]);

  const handleCancel = useCallback(async () => {
    stopRecognition();
    stopAnalyzer();
    cancelSpeech();
    stopPolling();
    if (currentJobIdRef.current) {
      await cancelJob(currentJobIdRef.current).catch(() => {});
    }
    currentJobIdRef.current = null;
    hasSubmittedRef.current = false;
    actions.cancel();
  }, [
    stopRecognition,
    stopAnalyzer,
    cancelSpeech,
    stopPolling,
    cancelJob,
    actions,
  ]);

  // === EFFECTS ===

  // Check browser support on mount
  useEffect(() => {
    setBrowserChecked(true);
  }, []);

  // Sync transcript to state
  useEffect(() => {
    if (transcript) {
      actions.updateTranscript(transcript);
    }
  }, [transcript, actions]);

  // Stop analyzer when leaving listening state
  useEffect(() => {
    if (context.state !== "listening" && isAnalyzerActive) {
      stopAnalyzer();
    }
  }, [context.state, isAnalyzerActive, stopAnalyzer]);

  // Submit to Bankr when entering processing state
  useEffect(() => {
    if (context.state !== "processing" || !context.transcript.trim()) return;
    if (currentJobIdRef.current) return;

    const submit = async () => {
      try {
        await submitAndPoll(context.transcript.trim(), {
          onJobCreated: (jobId) => {
            currentJobIdRef.current = jobId;
          },
          onStatusUpdate: async (message) => {
            actions.updateStatus(message);
            await speak(message).catch(() => {});
          },
          onComplete: async (response) => {
            currentJobIdRef.current = null;
            const text = response.response || "I'm not sure how to respond.";
            actions.responseReceived(text);
            actions.startSpeaking();
            await speak(text).catch(() => actions.speakingComplete());
          },
          onError: (error) => {
            currentJobIdRef.current = null;
            actions.setError(error.message);
          },
        });
      } catch (error) {
        currentJobIdRef.current = null;
        actions.setError(
          error instanceof Error ? error.message : "Failed to connect",
        );
      }
    };

    submit();
  }, [context.state, context.transcript, submitAndPoll, actions, speak]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      if (
        e.code === "Space" &&
        (context.state === "idle" || context.state === "error")
      ) {
        e.preventDefault();
        handleStart();
      } else if (e.code === "Enter" && context.state === "listening") {
        e.preventDefault();
        handleSend();
      } else if (e.code === "Escape" && context.state !== "idle") {
        e.preventDefault();
        handleCancel();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [context.state, handleStart, handleSend, handleCancel]);

  // === RENDER ===

  if (!browserChecked) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--retro-dark)] opacity-60">Loading...</div>
      </main>
    );
  }

  if (!sttSupported || !ttsSupported) {
    return <UnsupportedBrowser />;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <RetroTV
        state={context.state}
        statusMessage={context.statusMessage}
        onClick={handleStart}
        volume={volume}
        waveform={waveform}
        isListening={context.state === "listening" && isAnalyzerActive}
      />

      {/* Live transcript while listening */}
      <AnimatePresence>
        {context.state === "listening" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 max-w-md text-center"
          >
            <p className="text-[var(--retro-dark)] min-h-[1.5em]">
              {transcript || (
                <span className="opacity-40 italic">Listening...</span>
              )}
            </p>
            {transcript && (
              <button
                onClick={handleSend}
                className="mt-3 px-4 py-2 bg-[var(--retro-coral)] text-white rounded-lg hover:bg-[var(--retro-coral-dark)] transition-colors text-sm font-medium"
              >
                Send (Enter)
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* User's message during processing */}
      <AnimatePresence>
        {(context.state === "processing" || context.state === "speaking") &&
          context.transcript && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 max-w-md text-center"
            >
              <p className="text-sm text-[var(--retro-dark)] opacity-50 mb-1">
                You said:
              </p>
              <p className="text-[var(--retro-dark)] italic">
                &ldquo;{context.transcript}&rdquo;
              </p>
            </motion.div>
          )}
      </AnimatePresence>

      {/* Cancel button */}
      <AnimatePresence>
        {(context.state === "processing" || context.state === "speaking") && (
          <CancelButton onClick={handleCancel} />
        )}
      </AnimatePresence>

      {/* Error message */}
      {context.state === "error" && (
        <p className="mt-4 text-sm text-[var(--retro-dark)] opacity-60">
          {context.errorMessage || "Something went wrong"} — click to try again
        </p>
      )}

      {/* Keyboard hints */}
      <p className="mt-8 text-xs text-[var(--retro-dark)] opacity-40">
        {context.state === "idle" || context.state === "error" ? (
          <>
            Press{" "}
            <kbd className="px-1 py-0.5 bg-[var(--retro-cream)] rounded">
              Space
            </kbd>{" "}
            to speak
          </>
        ) : context.state === "listening" ? (
          <>
            Press{" "}
            <kbd className="px-1 py-0.5 bg-[var(--retro-cream)] rounded">
              Enter
            </kbd>{" "}
            to send
            {" · "}
            <kbd className="px-1 py-0.5 bg-[var(--retro-cream)] rounded">
              Esc
            </kbd>{" "}
            to cancel
          </>
        ) : (
          <>
            Press{" "}
            <kbd className="px-1 py-0.5 bg-[var(--retro-cream)] rounded">
              Esc
            </kbd>{" "}
            to cancel
          </>
        )}
      </p>
    </main>
  );
}
