"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import type { VoiceState } from "@/hooks/useVoiceState";

interface PixelFaceProps {
  state: VoiceState;
}

/**
 * 8-bit style pixel face that changes expression based on state
 * Rendered using CSS grid with individual "pixels"
 */
export function PixelFace({ state }: PixelFaceProps) {
  // Blink state for idle animation
  const [blinkVisible, setBlinkVisible] = useState(false);
  const [mouthFrame, setMouthFrame] = useState(0);
  const [thinkingDot, setThinkingDot] = useState(0);

  // Blinking animation for idle state
  useEffect(() => {
    if (state !== "idle") {
      return;
    }

    // Blink cycle: set visible, then hide after 150ms, then wait 4 seconds
    const runBlinkCycle = () => {
      setBlinkVisible(true);
      setTimeout(() => {
        setBlinkVisible(false);
      }, 150);
    };

    // Initial delay before first blink
    const initialDelay = setTimeout(() => {
      runBlinkCycle();
    }, 2000);

    // Then blink every 4 seconds
    const blinkInterval = setInterval(() => {
      runBlinkCycle();
    }, 4000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(blinkInterval);
    };
  }, [state]);

  // Mouth animation for speaking state
  useEffect(() => {
    if (state !== "speaking") {
      return;
    }

    const mouthInterval = setInterval(() => {
      setMouthFrame((prev) => prev + 1);
    }, 200);

    return () => clearInterval(mouthInterval);
  }, [state]);

  // Derive mouth open from frame (alternating)
  const mouthOpen = state === "speaking" && mouthFrame % 2 === 1;

  // Thinking dots animation for processing state
  useEffect(() => {
    if (state !== "processing") {
      return;
    }

    const dotInterval = setInterval(() => {
      setThinkingDot((prev) => (prev + 1) % 4);
    }, 400);

    return () => clearInterval(dotInterval);
  }, [state]);

  const pixelColor = useMemo(() => {
    switch (state) {
      case "error":
        return "var(--retro-coral)";
      case "processing":
        return "var(--retro-teal)";
      default:
        return "var(--retro-coral)";
    }
  }, [state]);

  // Get eye expression based on state
  const showBlink = state === "idle" && blinkVisible;

  const eyes = useMemo(() => {
    if (showBlink) {
      return { left: "closed", right: "closed" };
    }

    switch (state) {
      case "listening":
        return { left: "wide", right: "wide" };
      case "processing":
        return { left: "looking-up", right: "looking-up" };
      case "speaking":
        return { left: "normal", right: "normal" }; // Friendly open eyes while speaking
      case "error":
        return { left: "sad", right: "sad" };
      default:
        return { left: "normal", right: "normal" };
    }
  }, [state, showBlink]);

  // Get mouth expression based on state
  const mouth = useMemo(() => {
    switch (state) {
      case "listening":
        return "open";
      case "speaking":
        return mouthOpen ? "speaking-open" : "speaking-closed";
      case "error":
        return "sad";
      case "processing":
        return "thinking";
      default:
        return "smile";
    }
  }, [state, mouthOpen]);

  return (
    <motion.div
      className="relative w-48 h-48 flex items-center justify-center"
      animate={state === "error" ? { x: [-2, 2, -2, 2, 0] } : {}}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        {/* Face Container - 12x12 grid */}
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: "repeat(12, 12px)",
            gridTemplateRows: "repeat(12, 12px)",
          }}
        >
          {Array.from({ length: 144 }).map((_, i) => {
            const row = Math.floor(i / 12);
            const col = i % 12;

            // Left eye (col 2-4, row 3-5)
            const isLeftEye = col >= 2 && col <= 4 && row >= 3 && row <= 5;
            // Right eye (col 7-9, row 3-5)
            const isRightEye = col >= 7 && col <= 9 && row >= 3 && row <= 5;

            // Mouth area (col 3-8, row 8-10)
            const isMouthArea = col >= 3 && col <= 8 && row >= 8 && row <= 10;

            let isVisible = false;
            let opacity = 1;

            // Left eye rendering
            if (isLeftEye) {
              if (eyes.left === "closed") {
                isVisible = row === 4 && col >= 2 && col <= 4;
              } else if (eyes.left === "wide") {
                isVisible = row >= 3 && row <= 5 && col >= 2 && col <= 4;
              } else if (eyes.left === "looking-up") {
                isVisible = row >= 3 && row <= 4 && col >= 2 && col <= 4;
              } else if (eyes.left === "happy" || eyes.left === "sad") {
                isVisible = row === 4 && col >= 2 && col <= 4;
              } else {
                // normal
                isVisible = row >= 3 && row <= 4 && col >= 2 && col <= 4;
              }
            }

            // Right eye rendering (mirror of left)
            if (isRightEye) {
              if (eyes.right === "closed") {
                isVisible = row === 4 && col >= 7 && col <= 9;
              } else if (eyes.right === "wide") {
                isVisible = row >= 3 && row <= 5 && col >= 7 && col <= 9;
              } else if (eyes.right === "looking-up") {
                isVisible = row >= 3 && row <= 4 && col >= 7 && col <= 9;
              } else if (eyes.right === "happy" || eyes.right === "sad") {
                isVisible = row === 4 && col >= 7 && col <= 9;
              } else {
                // normal
                isVisible = row >= 3 && row <= 4 && col >= 7 && col <= 9;
              }
            }

            // Mouth rendering
            if (isMouthArea) {
              if (mouth === "smile") {
                isVisible =
                  (row === 8 && (col === 3 || col === 8)) ||
                  (row === 9 && col >= 4 && col <= 7);
              } else if (mouth === "open" || mouth === "speaking-open") {
                isVisible = row >= 8 && row <= 10 && col >= 4 && col <= 7;
              } else if (mouth === "speaking-closed") {
                isVisible = row === 9 && col >= 4 && col <= 7;
              } else if (mouth === "sad") {
                isVisible =
                  (row === 9 && (col === 3 || col === 8)) ||
                  (row === 8 && col >= 4 && col <= 7);
              } else if (mouth === "thinking") {
                isVisible = row === 9 && col >= 4 && col <= 7;
              }
            }

            // Thinking dots (above face)
            if (state === "processing" && row === 1) {
              if (col === 5 && thinkingDot >= 1) {
                isVisible = true;
                opacity = thinkingDot === 1 ? 1 : 0.5;
              }
              if (col === 6 && thinkingDot >= 2) {
                isVisible = true;
                opacity = thinkingDot === 2 ? 1 : 0.5;
              }
              if (col === 7 && thinkingDot >= 3) {
                isVisible = true;
                opacity = thinkingDot === 3 ? 1 : 0.5;
              }
            }

            return (
              <motion.div
                key={i}
                className="rounded-sm"
                style={{
                  backgroundColor: isVisible ? pixelColor : "transparent",
                  opacity: isVisible ? opacity : 0,
                  boxShadow: isVisible
                    ? `0 0 8px ${pixelColor}, 0 0 16px ${pixelColor}40`
                    : "none",
                }}
                animate={{
                  opacity: isVisible ? opacity : 0,
                }}
                transition={{ duration: 0.1 }}
              />
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
