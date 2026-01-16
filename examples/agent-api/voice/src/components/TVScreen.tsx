"use client";

import { motion } from "framer-motion";
import { PixelFace } from "./PixelFace";
import type { VoiceState } from "@/hooks/useVoiceState";

interface TVScreenProps {
  state: VoiceState;
  statusMessage?: string;
}

export function TVScreen({ state, statusMessage }: TVScreenProps) {
  const getGlowClass = () => {
    switch (state) {
      case "listening":
        return "screen-glow-listening";
      case "processing":
        return "screen-glow-processing";
      case "speaking":
        return "screen-glow-speaking";
      case "error":
        return "screen-glow-error";
      default:
        return "screen-glow";
    }
  };

  return (
    <motion.div
      className={`
        relative
        w-64 h-56
        bg-[var(--retro-screen)]
        rounded-2xl
        overflow-hidden
        ${getGlowClass()}
        transition-shadow duration-300
      `}
      animate={{
        scale: state === "listening" ? [1, 1.02, 1] : 1,
      }}
      transition={{
        duration: 2,
        repeat: state === "listening" ? Infinity : 0,
        ease: "easeInOut",
      }}
    >
      {/* CRT Scanlines overlay */}
      <div className="crt-scanlines" />

      {/* Vignette effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)",
        }}
      />

      {/* Face container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <PixelFace state={state} />
      </div>

      {/* Status message */}
      {statusMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-0 right-0 text-center"
        >
          <span
            className="
              px-3 py-1
              text-xs
              font-mono
              text-[var(--retro-coral-glow)]
              bg-black/50
              rounded
            "
          >
            {statusMessage}
          </span>
        </motion.div>
      )}

      {/* Click to start hint (idle only) */}
      {state === "idle" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-4 left-0 right-0 text-center"
        >
          <span
            className="
              px-3 py-1
              text-xs
              font-mono
              text-[var(--retro-coral)]
              opacity-70
            "
          >
            click to speak
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
