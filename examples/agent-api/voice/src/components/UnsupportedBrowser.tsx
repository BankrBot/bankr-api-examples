"use client";

import { motion } from "framer-motion";

export function UnsupportedBrowser() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-screen p-8 text-center"
    >
      <div className="bg-[var(--retro-cream)] rounded-3xl p-8 shadow-xl max-w-md">
        {/* Sad TV icon */}
        <div className="text-6xl mb-4">📺</div>

        <h1 className="text-2xl font-bold text-[var(--retro-dark)] mb-4">
          Browser Not Supported
        </h1>

        <p className="text-[var(--retro-dark)] opacity-80 mb-6">
          Bankr Voice requires speech recognition, which isn&apos;t available in
          your browser.
        </p>

        <div className="space-y-3 text-left">
          <p className="text-sm font-semibold text-[var(--retro-dark)]">
            Please try one of these browsers:
          </p>
          <ul className="text-sm text-[var(--retro-dark)] opacity-80 space-y-2">
            <li className="flex items-center gap-2">
              <span>🌐</span>
              <span>Google Chrome (recommended)</span>
            </li>
            <li className="flex items-center gap-2">
              <span>🌐</span>
              <span>Microsoft Edge</span>
            </li>
            <li className="flex items-center gap-2">
              <span>🌐</span>
              <span>Safari</span>
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
