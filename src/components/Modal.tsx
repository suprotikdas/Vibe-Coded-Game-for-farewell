import React, { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { WindowState } from "../types";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  windowState: WindowState | null;
  buildingName: string;
  onToggleLight: () => void;
  customMsgSent?: string | null;
}

// Retro name pool for pilot delivery return messages
const PILOTS_POOL = [
  "Arijit Das",
  "Sahil",
  "Jeevan Joyti Panda",
  "Salankara Sarkar",
  "Simran Sinha",
  "Deblina Sen",
  "Khadiza Akter",
  "Prarthi priya",
  "Pritam kumar Basu",
  "Sayan Sahoo",
  "Swati Shaw",
  "Arkodittya Dey",
  "Subhranil Chakraborty",
  "Dip Debnath",
  "Akash Bose",
  "Sudeshna Shaoo",
  "Muzahidul Islam Khan",
  "Rik karmakar",
  "Kuheli chakraborty",
  "Saheb Podder"
];

export default function Modal({
  isOpen,
  onClose,
  windowState,
  buildingName,
  onToggleLight,
  customMsgSent,
}: ModalProps) {
  if (!windowState) return null;

  // Memoize random pilot selection per modal open to lock name till dismiss
  const pilotName = useMemo(() => {
    return PILOTS_POOL[Math.floor(Math.random() * PILOTS_POOL.length)];
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          {/* Flat retro backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.65 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60"
          />

          {/* Retro Arcade Popup Terminal Box */}
          <motion.div
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 18 }}
            className="relative w-full max-w-md border-4 border-black bg-[#e2e8f0] p-1 shadow-[8px_8px_0px_rgba(0,0,0,0.5)] z-10"
          >
            {/* Inner Border layout */}
            <div className="border-2 border-black bg-white p-4 md:p-6 flex flex-col items-center">
              
              {/* Header Title Banner */}
              <div className="w-full bg-[#1e3a8a] border-2 border-black text-white text-center py-1.5 px-3 mb-5 font-retro text-xs tracking-wider uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                DHAPPA
              </div>

              {/* Main landed banner */}
              <h3 className="font-retro text-sm sm:text-base text-center text-[#1e3a8a] tracking-tight font-extrabold mb-6 animate-pulse select-none">
                LANDED SUCCESSFULLY!
              </h3>

              {/* Pixelated Body Section with Character dynamic claim */}
              <div className="w-full text-center mb-6">
                <p className="font-retro text-xs sm:text-sm text-slate-800 leading-relaxed mb-4 select-all">
                  {pilotName} return the plane
                </p>

                {/* If custom notes were passed */}
                {customMsgSent && (
                  <div className="mt-4 p-2.5 border-2 border-dashed border-slate-400 bg-slate-50 text-left">
                    <span className="block font-retro text-[9px] text-indigo-700 font-bold mb-1">
                      ✉ CARRIER COURIER SCROLL NOTE:
                    </span>
                    <p className="font-retro text-[9px] text-slate-700 leading-tight">
                      "{customMsgSent}"
                    </p>
                  </div>
                )}
              </div>

              {/* Retro thick OK (A) Button */}
              <button
                onClick={onClose}
                className="w-full sm:w-2/3 py-3 font-retro text-xs bg-white hover:bg-indigo-600 text-black hover:text-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all cursor-pointer text-center mb-4"
              >
                OK (A)
              </button>

              {/* Bottom game status metadata lane */}
              <div className="w-full border-t-2 border-black pt-3 mt-2 flex justify-between items-center text-[8px] font-retro text-slate-500 font-bold select-none">
                <span>STAGE-01 SELECTED</span>
                <span>SYSTEM RESET COMPLETE</span>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
