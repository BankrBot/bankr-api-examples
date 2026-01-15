"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseAudioAnalyzerReturn {
  volume: number;
  waveform: number[]; // Time-domain data for classic waveform visualization
  isActive: boolean;
  start: () => Promise<void>;
  stop: () => void;
}

const WAVEFORM_SAMPLES = 64; // Number of points in the waveform
const SMOOTHING = 0.5;

export function useAudioAnalyzer(): UseAudioAnalyzerReturn {
  const [volume, setVolume] = useState(0);
  const [waveform, setWaveform] = useState<number[]>(
    Array(WAVEFORM_SAMPLES).fill(0.5),
  );
  const [isActive, setIsActive] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  const analyze = useCallback(() => {
    if (!analyzerRef.current || !dataArrayRef.current) return;

    // Get time-domain data (waveform) instead of frequency data
    analyzerRef.current.getByteTimeDomainData(dataArrayRef.current);

    // Calculate volume from waveform
    let sum = 0;
    const samples: number[] = [];
    const step = Math.floor(dataArrayRef.current.length / WAVEFORM_SAMPLES);

    for (let i = 0; i < WAVEFORM_SAMPLES; i++) {
      const value = dataArrayRef.current[i * step] / 255; // Normalize to 0-1
      samples.push(value);
      // Calculate deviation from center (0.5) for volume
      const deviation = Math.abs(value - 0.5);
      sum += deviation * deviation;
    }

    const rms = Math.sqrt(sum / WAVEFORM_SAMPLES);
    setVolume(Math.min(1, rms * 4)); // Scale up for visibility
    setWaveform(samples);

    animationFrameRef.current = requestAnimationFrame(analyze);
  }, []);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });

      streamRef.current = stream;

      const audioContext = new AudioContext();
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 512;
      analyzer.smoothingTimeConstant = SMOOTHING;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyzer);

      audioContextRef.current = audioContext;
      analyzerRef.current = analyzer;
      dataArrayRef.current = new Uint8Array(analyzer.fftSize);

      setIsActive(true);
      animationFrameRef.current = requestAnimationFrame(analyze);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  }, [analyze]);

  const stop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyzerRef.current = null;
    dataArrayRef.current = null;

    setIsActive(false);
    setVolume(0);
    setWaveform(Array(WAVEFORM_SAMPLES).fill(0.5));
  }, []);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { volume, waveform, isActive, start, stop };
}
