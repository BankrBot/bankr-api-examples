"use client";

import { useReducer, useCallback, useMemo } from "react";

export type VoiceState =
  | "idle"
  | "listening"
  | "processing"
  | "speaking"
  | "error";

export interface VoiceContext {
  state: VoiceState;
  transcript: string;
  currentJobId: string | null;
  statusMessage: string;
  lastResponse: string;
  errorMessage: string | null;
}

export type VoiceAction =
  | { type: "START_LISTENING" }
  | { type: "UPDATE_TRANSCRIPT"; transcript: string }
  | { type: "SILENCE_DETECTED" }
  | { type: "SUBMIT_MESSAGE"; jobId: string }
  | { type: "STATUS_UPDATE"; message: string }
  | { type: "RESPONSE_RECEIVED"; response: string }
  | { type: "START_SPEAKING" }
  | { type: "SPEAKING_COMPLETE" }
  | { type: "CANCEL" }
  | { type: "ERROR"; message: string }
  | { type: "RESET" };

const initialState: VoiceContext = {
  state: "idle",
  transcript: "",
  currentJobId: null,
  statusMessage: "",
  lastResponse: "",
  errorMessage: null,
};

function voiceReducer(state: VoiceContext, action: VoiceAction): VoiceContext {
  switch (action.type) {
    case "START_LISTENING":
      return {
        ...state,
        state: "listening",
        transcript: "",
        statusMessage: "",
        errorMessage: null,
      };

    case "UPDATE_TRANSCRIPT":
      return {
        ...state,
        transcript: action.transcript,
      };

    case "SILENCE_DETECTED":
      // Only transition if we have a transcript and are listening
      if (state.state !== "listening" || !state.transcript.trim()) {
        return { ...state, state: "idle" };
      }
      return {
        ...state,
        state: "processing",
        statusMessage: "Sending to Bankr...",
      };

    case "SUBMIT_MESSAGE":
      return {
        ...state,
        state: "processing",
        currentJobId: action.jobId,
        statusMessage: "Processing...",
      };

    case "STATUS_UPDATE":
      return {
        ...state,
        statusMessage: action.message,
      };

    case "RESPONSE_RECEIVED":
      return {
        ...state,
        lastResponse: action.response,
        statusMessage: "",
      };

    case "START_SPEAKING":
      return {
        ...state,
        state: "speaking",
      };

    case "SPEAKING_COMPLETE":
      return {
        ...state,
        state: "idle",
        currentJobId: null,
        transcript: "",
      };

    case "CANCEL":
      return {
        ...state,
        state: "idle",
        currentJobId: null,
        transcript: "",
        statusMessage: "",
      };

    case "ERROR":
      return {
        ...state,
        state: "error",
        errorMessage: action.message,
        currentJobId: null,
      };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

export function useVoiceState() {
  const [context, dispatch] = useReducer(voiceReducer, initialState);

  const startListening = useCallback(() => {
    dispatch({ type: "START_LISTENING" });
  }, []);

  const updateTranscript = useCallback((transcript: string) => {
    dispatch({ type: "UPDATE_TRANSCRIPT", transcript });
  }, []);

  const onSilenceDetected = useCallback(() => {
    dispatch({ type: "SILENCE_DETECTED" });
  }, []);

  const submitMessage = useCallback((jobId: string) => {
    dispatch({ type: "SUBMIT_MESSAGE", jobId });
  }, []);

  const updateStatus = useCallback((message: string) => {
    dispatch({ type: "STATUS_UPDATE", message });
  }, []);

  const responseReceived = useCallback((response: string) => {
    dispatch({ type: "RESPONSE_RECEIVED", response });
  }, []);

  const startSpeaking = useCallback(() => {
    dispatch({ type: "START_SPEAKING" });
  }, []);

  const speakingComplete = useCallback(() => {
    dispatch({ type: "SPEAKING_COMPLETE" });
  }, []);

  const cancel = useCallback(() => {
    dispatch({ type: "CANCEL" });
  }, []);

  const setError = useCallback((message: string) => {
    dispatch({ type: "ERROR", message });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const actions = useMemo(
    () => ({
      startListening,
      updateTranscript,
      onSilenceDetected,
      submitMessage,
      updateStatus,
      responseReceived,
      startSpeaking,
      speakingComplete,
      cancel,
      setError,
      reset,
    }),
    [
      startListening,
      updateTranscript,
      onSilenceDetected,
      submitMessage,
      updateStatus,
      responseReceived,
      startSpeaking,
      speakingComplete,
      cancel,
      setError,
      reset,
    ],
  );

  return {
    context,
    dispatch,
    actions,
  };
}
