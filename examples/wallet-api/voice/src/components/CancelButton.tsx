"use client";

import { motion } from "framer-motion";

interface CancelButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function CancelButton({ onClick, disabled }: CancelButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className="
        px-6 py-3 mt-6
        bg-[var(--retro-cream)] 
        hover:bg-[var(--retro-cream-dark)]
        text-[var(--retro-dark)]
        font-semibold
        rounded-xl
        shadow-md
        transition-colors
        disabled:opacity-50
        disabled:cursor-not-allowed
      "
    >
      Cancel
    </motion.button>
  );
}
