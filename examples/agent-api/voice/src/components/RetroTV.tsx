"use client";

import { motion } from "framer-motion";
import { TVScreen } from "./TVScreen";
import type { VoiceState } from "@/hooks/useVoiceState";

// Built-in audio level meter - shows flat line when idle, waveform when active
function AudioMeter({
  waveform,
  isActive,
}: {
  waveform: number[];
  isActive: boolean;
}) {
  const width = 220;
  const height = 32; // Taller for more visible waveform
  const centerY = height / 2;

  // When not active, show a flat line at center
  if (!isActive || waveform.length === 0) {
    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <line
          x1="0"
          y1={centerY}
          x2={width}
          y2={centerY}
          stroke="var(--retro-coral)"
          strokeWidth="2"
          opacity="0.4"
        />
      </svg>
    );
  }

  // Create path from waveform data with exaggerated amplitude
  const amplification = 4; // Boost the waveform visibility
  const points = waveform.map((value, index) => {
    const x = (index / (waveform.length - 1)) * width;
    // value is 0-1 where 0.5 is center; amplify deviation from center
    const deviation = (value - 0.5) * amplification;
    const y = centerY - deviation * height;
    // Clamp to stay within bounds
    const clampedY = Math.max(1, Math.min(height - 1, y));
    return `${x},${clampedY}`;
  });
  const pathD = `M ${points.join(" L ")}`;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* Center reference line */}
      <line
        x1="0"
        y1={centerY}
        x2={width}
        y2={centerY}
        stroke="var(--retro-coral)"
        strokeWidth="1"
        opacity="0.2"
      />
      {/* Active waveform */}
      <path
        d={pathD}
        fill="none"
        stroke="var(--retro-coral)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: "drop-shadow(0 0 3px var(--retro-coral))" }}
      />
    </svg>
  );
}

interface RetroTVProps {
  state: VoiceState;
  statusMessage?: string;
  onClick?: () => void;
  volume?: number;
  waveform?: number[];
  isListening?: boolean;
}

export function RetroTV({
  state,
  statusMessage,
  onClick,
  volume = 0,
  waveform = [],
  isListening = false,
}: RetroTVProps) {
  const isClickable = state === "idle" || state === "error";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {/* TV Housing */}
      <div
        className={`
          relative
          p-6 pb-8
          bg-gradient-to-b from-[var(--retro-cream)] to-[var(--retro-cream-dark)]
          rounded-3xl
          shadow-2xl
          ${isClickable ? "cursor-pointer" : ""}
        `}
        onClick={isClickable ? onClick : undefined}
      >
        {/* Top ventilation lines */}
        <div className="absolute top-3 right-8 flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-8 h-1 bg-[var(--retro-dark)] opacity-20 rounded-full"
            />
          ))}
        </div>

        {/* Screen bezel with volume-reactive glow */}
        <motion.div
          className="
            p-3
            bg-[var(--retro-dark)]
            rounded-2xl
            shadow-inner
          "
          animate={{
            boxShadow:
              state === "listening" && volume > 0.1
                ? `0 0 ${20 + volume * 40}px ${volume * 0.8}px var(--retro-coral)`
                : "inset 0 2px 4px rgba(0,0,0,0.3)",
          }}
          transition={{ duration: 0.1 }}
        >
          <TVScreen state={state} statusMessage={statusMessage} />
        </motion.div>

        {/* Control panel */}
        <div className="mt-4 flex items-center justify-between px-4">
          {/* Control knobs */}
          <div className="flex items-center gap-3">
            {/* Volume knob */}
            <div
              className="
                w-6 h-6
                rounded-full
                bg-[var(--retro-cream-dark)]
                border-2 border-[var(--retro-dark)]
                opacity-40
              "
            />
            {/* Tuner knob */}
            <div
              className="
                w-8 h-8
                rounded-full
                bg-gradient-to-b from-[var(--retro-dark)] to-gray-700
                border-2 border-[var(--retro-dark)]
                flex items-center justify-center
              "
            >
              <div className="w-1 h-3 bg-[var(--retro-cream)] rounded-full" />
            </div>
          </div>

          {/* Status LED */}
          <motion.div
            className={`
              w-3 h-3
              rounded-full
              ${state === "idle" ? "bg-green-500" : ""}
              ${state === "listening" ? "bg-yellow-400" : ""}
              ${state === "processing" ? "bg-blue-400" : ""}
              ${state === "speaking" ? "bg-orange-400" : ""}
              ${state === "error" ? "bg-red-500" : ""}
            `}
            animate={{
              opacity: state === "idle" ? 1 : [1, 0.5, 1],
              scale: state === "idle" ? 1 : [1, 1.2, 1],
            }}
            transition={{
              duration: 1,
              repeat: state === "idle" ? 0 : Infinity,
            }}
          />
        </div>

        {/* Audio Level Meter - built into TV */}
        <div className="mt-3 mx-4">
          <div
            className="
              h-10
              bg-[var(--retro-dark)] 
              rounded-lg 
              overflow-hidden
              flex items-center
              px-2
            "
          >
            <AudioMeter
              waveform={waveform}
              isActive={isListening && waveform.length > 0}
            />
          </div>
        </div>
      </div>

      {/* TV Stand / Shadow */}
      <div
        className="
          mx-auto
          w-32 h-4
          bg-gradient-to-b from-[var(--retro-cream-dark)] to-transparent
          rounded-b-xl
          opacity-50
        "
      />
    </motion.div>
  );
}
