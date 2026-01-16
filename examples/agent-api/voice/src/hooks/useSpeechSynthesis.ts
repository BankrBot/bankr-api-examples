"use client";

import { useCallback, useState, useRef, useEffect } from "react";

interface UseSpeechSynthesisOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  onEnd?: () => void;
}

interface QueueItem {
  text: string;
  resolve: () => void;
}

export function useSpeechSynthesis(options: UseSpeechSynthesisOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voicesReady, setVoicesReady] = useState(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Speech queue
  const queueRef = useRef<QueueItem[]>([]);
  const isProcessingRef = useRef(false);

  // Pre-load voices on mount (they load asynchronously)
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setVoicesReady(true);
      }
    };

    // Try immediately
    loadVoices();

    // Also listen for the voiceschanged event (required for Chrome)
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  // Process the next item in the queue
  const processQueue = useCallback(() => {
    if (isProcessingRef.current) return;
    if (queueRef.current.length === 0) {
      setIsSpeaking(false);
      optionsRef.current.onEnd?.();
      return;
    }

    isProcessingRef.current = true;
    const item = queueRef.current.shift()!;

    const utterance = new SpeechSynthesisUtterance(item.text);
    utterance.rate = optionsRef.current.rate ?? 1.0;
    utterance.pitch = optionsRef.current.pitch ?? 1.0;
    utterance.volume = optionsRef.current.volume ?? 1.0;

    // Try to use Daniel (en_GB) if available, otherwise any English voice
    const voices = window.speechSynthesis.getVoices();
    const danielVoice = voices.find(
      (v) => v.name.includes("Daniel") && v.lang === "en-GB",
    );
    const englishVoice = voices.find(
      (v) => v.lang.startsWith("en") && v.localService,
    );
    utterance.voice = danielVoice || englishVoice || null;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      isProcessingRef.current = false;
      item.resolve();
      // Process next item in queue
      processQueue();
    };
    utterance.onerror = () => {
      isProcessingRef.current = false;
      item.resolve();
      // Process next item in queue
      processQueue();
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // Add text to the queue
  const speak = useCallback(
    (text: string): Promise<void> => {
      return new Promise((resolve) => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) {
          resolve();
          return;
        }

        // Add to queue
        queueRef.current.push({ text, resolve });

        // Start processing if not already
        if (!isProcessingRef.current) {
          processQueue();
        }
      });
    },
    [processQueue],
  );

  // Cancel all speech and clear queue
  const cancel = useCallback(() => {
    if (typeof window === "undefined") return;

    // Clear the queue
    queueRef.current.forEach((item) => item.resolve());
    queueRef.current = [];

    // Stop current speech
    window.speechSynthesis.cancel();
    isProcessingRef.current = false;
    setIsSpeaking(false);
  }, []);

  const isSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  return { isSpeaking, speak, cancel, isSupported, voicesReady };
}
