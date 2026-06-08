import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Volume2, 
  VolumeX, 
  RotateCcw 
} from "lucide-react";
import { SkyTheme, BuildingData, WindowState, CozyRoom } from "./types";
import Skyline from "./components/Skyline";
import Modal from "./components/Modal";
import { playSound } from "./utils/audio";

// Arcade Sound trigger with volume protection
const triggerAud = (
  action: "launch" | "sparkle" | "unlock" | "close" | "coin" | "tick" | "scramble" | "toggleLight", 
  isMuted: boolean
) => {
  if (!isMuted) {
    try {
      playSound[action]();
    } catch {
      // Audio context is safe from crashing
    }
  }
};

// Config for background drifting clouds
const CLOUDS_CONFIG = [
  { id: 1, top: "8%", duration: 42, delay: -5, scale: 1.1 },
  { id: 2, top: "18%", duration: 65, delay: -35, scale: 0.8 },
  { id: 3, top: "28%", duration: 52, delay: -18, scale: 1.3 },
  { id: 4, top: "42%", duration: 75, delay: -50, scale: 0.95 },
  { id: 5, top: "12%", duration: 48, delay: -24, scale: 1.25 },
];

// Defined Arcade Retro Buildings
const ARCADE_BUILDINGS: BuildingData[] = [
  {
    buildingIndex: 0,
    name: "AERO-APEX",
    cols: 3,
    rows: 6,
    heightClass: "h-[65%] sm:h-[72%]",
    widthClass: "w-[17%] min-w-[70px] max-w-[120px]",
    colorClass: "bg-[#fcfaf2]", // Cream
    roofStyle: "spire",
  },
  {
    buildingIndex: 1,
    name: "TOWER-B",
    cols: 2,
    rows: 8,
    heightClass: "h-[80%] sm:h-[90%]",
    widthClass: "w-[15%] min-w-[65px] max-w-[100px]",
    colorClass: "bg-[#f7fee7]", // Light limeish white
    roofStyle: "flat",
  },
  {
    buildingIndex: 2,
    name: "CORE-X",
    cols: 4,
    rows: 5,
    heightClass: "h-[45%] sm:h-[50%]",
    widthClass: "w-[24%] min-w-[105px] max-w-[170px]",
    colorClass: "bg-[#f0f9ff]", // Cyan ice white
    roofStyle: "dome",
  },
  {
    buildingIndex: 3,
    name: "GRID-SQUARE",
    cols: 2,
    rows: 7,
    heightClass: "h-[70%] sm:h-[78%]",
    widthClass: "w-[15%] min-w-[65px] max-w-[100px]",
    colorClass: "bg-[#fffbeb]", // Warm light yellow
    roofStyle: "sloped",
  },
  {
    buildingIndex: 4,
    name: "TERMINAL-9",
    cols: 3,
    rows: 6,
    heightClass: "h-[55%] sm:h-[62%]",
    widthClass: "w-[18%] min-w-[75px] max-w-[130px]",
    colorClass: "bg-[#fafafa]", // Off-white
    roofStyle: "flat",
  },
];

// Room templates mapping to the original pixel design descriptions
const CABINET_ROOM_TEMPLATES: Omit<CozyRoom, "emoji" | "glowingIcon">[] = [
  { title: "Warm Cocoa Nook", category: "cozy", description: "Cinnamon steam rises ☕. A tiny virtual cat stretches on the windowsill.", ambientColor: "amber-450" },
  { title: "Retro Wizard Sanctum", category: "magic", description: "Spells and chiptunes brew ✨ inside a stack of classic terminal tubes.", ambientColor: "fuchsia-450" },
  { title: "Dune Hacker Station", category: "tech", description: "Holograms spin softly. Rows of computer green codes flow over modular boards 💻.", ambientColor: "cyan-450" },
  { title: "Pixel Greenhouse", category: "creative", description: "Lush digital pixelated vines hang. Watering timers clock in sync 🌿.", ambientColor: "emerald-450" },
  { title: "Station Cafe Stop", category: "gourmet", description: "Sourdough ovens glow bright orange 🥐. Fresh coffee is ready for delivery flight.", ambientColor: "rose-450" },
];

const CABINET_EMOJIS = ["🐱", "🧙‍♂️", "💻", "🪴", "🍵", "🔭", "🎹", "🎨", "🥐", "🚂"];

// Helper to fully pop mock windows state
const buildCabinetWindows = (): Record<string, WindowState> => {
  const collection: Record<string, WindowState> = {};
  ARCADE_BUILDINGS.forEach((building) => {
    for (let r = 0; r < building.rows; r++) {
      for (let c = 0; c < building.cols; c++) {
        const id = `win-${building.buildingIndex}-${r}-${c}`;
        const template = CABINET_ROOM_TEMPLATES[Math.floor(Math.random() * CABINET_ROOM_TEMPLATES.length)];
        const emoji = CABINET_EMOJIS[Math.floor(Math.random() * CABINET_EMOJIS.length)];
        
        // Populate standard randomized lightning (roughly 50%)
        const isLit = Math.random() < 0.50;

        collection[id] = {
          buildingIndex: building.buildingIndex,
          colIndex: c,
          rowIndex: r,
          windowId: id,
          isLit,
          room: {
            ...template,
            emoji,
            glowingIcon: emoji,
          },
        };
      }
    }
  });
  return collection;
};

// Main App Component with CRT screen and full menu flow identical to the video!
export default function App() {
  // Screen Router state: "MENU" (SAYONARA Start screen) | "CONFIRM" (Guts validation screen) | "GAME" (The primary CRT plane map)
  const [screen, setScreen] = useState<"MENU" | "CONFIRM" | "GAME">("MENU");
  
  // Custom states
  const [windowStates, setWindowStates] = useState<Record<string, WindowState>>({});
  const [selectedWindowId, setSelectedWindowId] = useState<string | null>(null);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Menu cursor position tracking (for keyboard Arrow Up/Down navigation)
  const [menuCursor, setMenuCursor] = useState<number>(0);
  const [confirmCursor, setConfirmCursor] = useState<number>(0);

  // Status message block shown in the Start Screen Header box
  const [statusMessage, setStatusMessage] = useState<string>("THAT'S THE COURAGE");

  // Flight mechanism
  const [isFlying, setIsFlying] = useState<boolean>(false);
  const [impactWindowId, setImpactWindowId] = useState<string | null>(null);
  const [flightVector, setFlightVector] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    dx: number;
    dy: number;
    angle: number;
  } | null>(null);

  // Optional custom message scroll inside custom note form
  const [carrierNote, setCarrierNote] = useState<string>("");
  const [activeCarrierNote, setActiveCarrierNote] = useState<string | null>(null);

  // Popup state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Launch pad element coordinate anchors
  const launchpadRef = useRef<HTMLDivElement | null>(null);
  const windowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const gameContainerRef = useRef<HTMLDivElement | null>(null);

  // Initialize building matrix
  useEffect(() => {
    setWindowStates(buildCabinetWindows());
  }, []);

  // Sync menu cursor changes to update status texts in real-time similar to video
  useEffect(() => {
    if (screen === "MENU") {
      switch (menuCursor) {
        case 0:
          setStatusMessage("THAT'S THE COURAGE");
          break;
        case 1:
          setStatusMessage("INSUFFICIENT GUTS? RETRY WITH 'START' UNLESS AFRAID.");
          break;
        default:
          setStatusMessage("THAT'S THE COURAGE");
      }
    }
  }, [menuCursor, screen]);

  // Keyboard navigation attachment for authentic retro touch!
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      // Handle Start menu keyboard bindings
      if (screen === "MENU") {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setMenuCursor((prev) => (prev + 1) % 2);
          triggerAud("tick", isMuted);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setMenuCursor((prev) => (prev - 1 + 2) % 2);
          triggerAud("tick", isMuted);
        } else if (e.key === "Enter") {
          e.preventDefault();
          triggerSelection();
        }
      }

      // Handle Guts Confirmation screen keyboard bindings
      if (screen === "CONFIRM") {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          setConfirmCursor((prev) => (prev + 1) % 2);
          triggerAud("tick", isMuted);
        } else if (e.key === "Enter") {
          e.preventDefault();
          triggerConfirmSelection();
        }
      }
    };

    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, [screen, menuCursor, confirmCursor, isMuted]);

  // Window selection callback handler
  const handleSelectWindowDirectly = (windowId: string) => {
    if (isFlying) return;
    setSelectedWindowId(windowId);
    triggerAud("tick", isMuted);
  };

  // Execute choice action from main menu selection
  const triggerSelection = () => {
    if (menuCursor === 0) {
      triggerAud("coin", isMuted);
      setScreen("CONFIRM");
    } else {
      triggerAud("close", isMuted);
      setStatusMessage("INSUFFICIENT GUTS! START UNLESS COWARD!");
    }
  };

  // Execute choice action from guts confirmation menu
  const triggerConfirmSelection = () => {
    if (confirmCursor === 0) {
      // "Yes, I've the guts"
      triggerAud("unlock", isMuted);
      setScreen("GAME");
    } else {
      // "No, back to start"
      triggerAud("close", isMuted);
      setScreen("MENU");
    }
  };

  // Launch airplane toward selection target coordinates
  const handleLaunchSequence = () => {
    if (isFlying) return;

    // Default target selection: either user selected a specific window or random
    let targetId = selectedWindowId;
    if (!targetId) {
      const activeIds = Object.keys(windowStates);
      if (activeIds.length > 0) {
        targetId = activeIds[Math.floor(Math.random() * activeIds.length)];
        setSelectedWindowId(targetId);
      }
    }

    if (!targetId) return;

    const launchNode = launchpadRef.current;
    const targetNode = windowRefs.current[targetId];

    const gameContainer = gameContainerRef.current;
    if (!gameContainer || !launchNode || !targetNode) {
      // Fail-grace boundary triggers immediate arrival
      completeArcFlight(targetId);
      return;
    }

    const gameRect = gameContainer.getBoundingClientRect();
    // Measure exact vector offsets relative to viewport coordinates
    const startRect = launchNode.getBoundingClientRect();
    const targetRect = targetNode.getBoundingClientRect();

    const startX = startRect.left + startRect.width / 2 - gameRect.left;
    const startY = startRect.top + startRect.height / 2 - gameRect.top;
    const endX = targetRect.left + targetRect.width / 2 - gameRect.left;
    const endY = targetRect.top + targetRect.height / 2 - gameRect.top;

    const dx = endX - startX;
    const dy = endY - startY;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    setFlightVector({
      startX,
      startY,
      endX,
      endY,
      dx,
      dy,
      angle,
    });

    setIsFlying(true);
    triggerAud("launch", isMuted);

    // Track Custom delivery note tuck scroll
    if (carrierNote.trim()) {
      setActiveCarrierNote(carrierNote.trim());
    } else {
      setActiveCarrierNote(null);
    }

    // Animate Sparkle trails
    const pulseTick = setInterval(() => {
      triggerAud("sparkle", isMuted);
    }, 400);

    // Transition delay flight timing matches the retro animation standard speed
    setTimeout(() => {
      clearInterval(pulseTick);
      completeArcFlight(targetId!);
    }, 1200);
  };

  const completeArcFlight = (targetId: string) => {
    setIsFlying(false);
    setFlightVector(null);

    // Apply window light impact state
    setImpactWindowId(targetId);
    triggerAud("unlock", isMuted);

    // Turn target window glow active
    setWindowStates((prev) => ({
      ...prev,
      [targetId]: {
        ...prev[targetId],
        isLit: true,
      },
    }));

    // Increment arcade high score by standard 10 units!
    setCurrentScore((prev) => prev + 10);

    setTimeout(() => {
      setImpactWindowId(null);
      // Trigger pixel details popup
      setIsModalOpen(true);
    }, 600);
  };

  const handleToggleLight = () => {
    if (!selectedWindowId) return;
    triggerAud("toggleLight", isMuted);
    setWindowStates((prev) => {
      if (!prev[selectedWindowId]) return prev;
      return {
        ...prev,
        [selectedWindowId]: {
          ...prev[selectedWindowId],
          isLit: !prev[selectedWindowId].isLit,
        },
      };
    });
  };

  const handleScrambleSkylineRooms = () => {
    setWindowStates(buildCabinetWindows());
    setSelectedWindowId(null);
    setIsModalOpen(false);
    setCarrierNote("");
    setActiveCarrierNote(null);
    triggerAud("scramble", isMuted);
  };

  // Resolve active targeted room and location
  const activeWindow = selectedWindowId ? windowStates[selectedWindowId] : null;
  const activeBuilding = activeWindow ? ARCADE_BUILDINGS.find((b) => b.buildingIndex === activeWindow.buildingIndex) : null;
  const buildingName = activeBuilding ? activeBuilding.name : "TOWER-X";

  // Format high score like traditional retro coin-op cabinets (6-digit zeros padded)
  const formatArcadeScore = (val: number): string => {
    return String(val).padStart(6, "0");
  };

  return (
    <div className="relative w-screen h-screen bg-[#0d0e12] flex items-center justify-center p-2 sm:p-6 overflow-hidden">
      
      {/* Main Heavy Wood-Metallic Arcade Monitor Cabinet Bezel Case */}
      <div className="w-full h-full max-w-5xl max-h-[700px] border-[14px] sm:border-[20px] border-[#31333f] bg-[#e2e8f0] flex flex-col justify-between crt-monitor relative overflow-hidden transition-all duration-300">
        
        {/* VIEW 1: SAYONARA RETRO ARCADE MENU */}
        {screen === "MENU" && (
          <div className="flex-1 w-full bg-white flex flex-col justify-between p-4 sm:p-8 select-none">
            
            {/* Top Bracket Margins styling */}
            <div className="flex justify-between text-[11px] font-bold text-slate-800 border-b-4 border-black pb-3 select-none">
              <span>┌ Sayonara 2k26 ┐</span>
              <span>┌ The Farewell Game ┐</span>
            </div>

            {/* Giant Title Box Headings */}
            <div className="text-center my-4 font-retro space-y-3">
              <h1 className="text-2xl sm:text-4xl text-black font-extrabold tracking-tight select-all">
                SAYONARA 2K26
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-600 font-bold select-none">
                * THE FAREWELL GAME *
              </p>
            </div>

            {/* Selector helper guide */}
            <div className="border-2 border-black bg-slate-50 p-2 text-center text-[8px] sm:text-[9px] font-bold tracking-wider text-slate-700 mb-4 select-none">
              USE ▲ ▼ KEYS OR MOUSE HOVER TO CHOOSE
            </div>

            {/* Live active error reaction monitor */}
            <div className="border-4 border-black bg-white p-3 text-center mb-6 shadow-[3px_3px_0px_#000] rounded-xs select-text">
              <span className="font-retro text-[9px] sm:text-xs text-red-650 font-bold tracking-tight">
                {statusMessage}
              </span>
            </div>

            {/* Vertically Aligned Menu list mimicking the video's direct layout */}
            <div className="flex-1 flex flex-col justify-center gap-3 max-w-md mx-auto w-full select-all">
              
              {/* Op 1: Start */}
              <button
                onMouseEnter={() => setMenuCursor(0)}
                onClick={() => {
                  setMenuCursor(0);
                  triggerSelection();
                }}
                className={`w-full border-4 border-black p-3.5 flex items-center justify-between text-left transition-all cursor-pointer select-none
                  ${menuCursor === 0 
                    ? "bg-[#1e3a8a] text-white shadow-[4px_4px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]" 
                    : "bg-white text-black hover:bg-slate-100"
                  }
                `}
              >
                <div className="flex items-center gap-2 font-retro text-xs sm:text-sm font-bold">
                  {menuCursor === 0 && <span>▶</span>}
                  <span>Start</span>
                </div>
                <span className={`font-retro text-[8px] opacity-75 font-bold ${menuCursor === 0 ? "text-yellow-300" : "text-slate-550"}`}>
                  LAUNCH GAME RUN
                </span>
              </button>

              {/* Op 2: Don't Play */}
              <button
                onMouseEnter={() => setMenuCursor(1)}
                onClick={() => {
                  setMenuCursor(1);
                  triggerSelection();
                }}
                className={`w-full border-4 border-black p-3.5 flex items-center justify-between text-left transition-all cursor-pointer select-none
                  ${menuCursor === 1 
                    ? "bg-[#1e3a8a] text-white shadow-[4px_4px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]" 
                    : "bg-white text-black hover:bg-slate-100"
                  }
                `}
              >
                <div className="flex items-center gap-2 font-retro text-xs sm:text-sm font-bold">
                  {menuCursor === 1 && <span>▶</span>}
                  <span>Don't Play</span>
                </div>
                <span className={`font-retro text-[8px] opacity-75 font-bold ${menuCursor === 1 ? "text-yellow-300" : "text-slate-550"}`}>
                  RUN AWAY FROM TRAJECTORY
                </span>
              </button>

            </div>

            {/* Bottom Credit Footer panel */}
            <div className="border-t-4 border-black pt-4 flex justify-between items-center text-[8px] font-retro text-slate-500 font-bold select-none">
              <span>SYSTEM READY</span>
              <span>© 2026 COIN-OP RECREATION</span>
              <span>IP READY</span>
            </div>

          </div>
        )}

        {/* VIEW 2: ARE YOU SURE COWARDICE CONFIRMATION */}
        {screen === "CONFIRM" && (
          <div className="flex-1 w-full bg-white flex flex-col justify-between p-4 sm:p-8 select-all">
            
            <div className="flex justify-between text-[11px] font-bold text-slate-700 border-b-4 border-black pb-3 select-none">
              <span>┌ COWARDICE VERIFICATION ┐</span>
              <span>┌ GUTS RECOVERY SYSTEM ┐</span>
            </div>

            {/* Question headings panel */}
            <div className="text-center my-4">
              <span className="text-3xl block filter drop-shadow-md mb-2">🤪</span>
              <h2 className="font-retro text-base sm:text-lg text-red-600 font-extrabold tracking-tight mb-2 select-text">
                ARE YOU SURE TO PLAY?
              </h2>
              <p className="font-retro text-[9px] text-slate-650 font-bold select-none">
                THINK TWICE BEFORE LAUNCHING THIS PAPER PLANE...
              </p>
            </div>

            {/* Guts protocol bullet specifications list */}
            <div className="bg-slate-100 border-4 border-black p-4 max-w-md mx-auto w-full font-retro text-[9px] sm:text-[10px] text-slate-900 leading-relaxed mb-6 shadow-[3px_3px_0px_#000] space-y-2 select-all">
              <div className="flex items-center gap-2">
                <span className="text-red-500">☠</span>
                <span>COWARDICE PROTOCOL: TRIGGERED</span>
              </div>
              <div className="flex items-center gap-2">
                <span>▶</span>
                <span>RISK LEVEL: EXTREME SKYPLANE GLIDES</span>
              </div>
              <div className="flex items-center gap-2">
                <span>▶</span>
                <span>WE HAVE A DHAPPA SYSTEM</span>
              </div>
              <div className="flex items-center gap-2">
                <span>▶</span>
                <span>CHANCE OF CRISPY WIN: 100% OR 0%</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-800">
                <span>▶</span>
                <span>USER GUTS LEVEL: SAD LITTLE CHICKEN</span>
              </div>
            </div>

            {/* Yes / No selector controls block */}
            <div className="flex flex-col gap-3 max-w-sm mx-auto w-full">
              
              <button
                onMouseEnter={() => setConfirmCursor(0)}
                onClick={() => {
                  setConfirmCursor(0);
                  triggerConfirmSelection();
                }}
                className={`w-full border-4 border-black p-3.5 flex items-center justify-between text-left transition-all cursor-pointer select-none
                  ${confirmCursor === 0 
                    ? "bg-[#1e3a8a] text-white shadow-[4px_4px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]" 
                    : "bg-white text-black hover:bg-slate-100"
                  }
                `}
              >
                <span className="font-retro text-xs font-bold flex items-center gap-1.5">
                  {confirmCursor === 0 && "▶"} Yes, I've the guts
                </span>
                <span className={`font-retro text-[8px] font-bold ${confirmCursor === 0 ? "text-yellow-300" : "text-slate-500"}`}>
                  LOCKED AND LOADED
                </span>
              </button>

              <button
                onMouseEnter={() => setConfirmCursor(1)}
                onClick={() => {
                  setConfirmCursor(1);
                  triggerConfirmSelection();
                }}
                className={`w-full border-4 border-black p-3.5 flex items-center justify-between text-left transition-all cursor-pointer select-none
                  ${confirmCursor === 1 
                    ? "bg-[#1e3a8a] text-white shadow-[4px_4px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]" 
                    : "bg-white text-black hover:bg-slate-100"
                  }
                `}
              >
                <span className="font-retro text-xs font-bold flex items-center gap-1.5">
                  {confirmCursor === 1 && "▶"} No, back to menu
                </span>
                <span className={`font-retro text-[8px] font-bold ${confirmCursor === 1 ? "text-yellow-300" : "text-slate-500"}`}>
                  RETREAT FOR SAFETY (COWARD)
                </span>
              </button>

            </div>

            {/* Confirmation Footer controls descriptor */}
            <div className="border-t-4 border-black pt-4 mt-4 flex justify-between items-center text-[8px] font-retro text-slate-500 font-bold select-none">
              <span>CONTROLS: ▲, ▼ , ↩ ENTER</span>
              <span>CHOOSE WISELY</span>
            </div>

          </div>
        )}

        {/* VIEW 3: THE HEART GAMEPLAY PLAYING GRID CANVAS */}
        {screen === "GAME" && (
          <div ref={gameContainerRef} className="flex-1 w-full flex flex-col justify-between bg-[#f1f5f9] relative overflow-hidden">
            
            {/* Header HUD panel matching the clean pixel details in the video */}
            <div className="border-b-4 border-black bg-white p-3 flex flex-wrap gap-2 justify-between items-center z-30 select-text">
              
              {/* Score panel widget */}
              <div className="flex items-center gap-1.5 border-2 border-black bg-[#e2e8f0] px-2.5 py-1 text-black font-retro font-bold text-[9px] sm:text-xs">
                <span>SCORE HUD</span>
                <span className="bg-black text-[#58ff58] px-1.5 py-0.5 rounded-xs select-all">
                  {formatArcadeScore(currentScore)}
                </span>
              </div>

              {/* Screen Titles header box */}
              <div className="text-center">
                <h1 className="font-retro text-[10px] sm:text-sm text-black font-extrabold flex items-center gap-1 select-all justify-center">
                  Sayonara 2k26
                </h1>
                <span className="font-retro text-[8px] text-slate-500 uppercase font-bold tracking-tight block select-none">
                  The Farewell Game
                </span>
              </div>

              {/* Pill console toggles (stage status, sound controls, CRT lens toggles) */}
              <div className="flex items-center gap-1.5">
                
                {/* Reset coin map */}
                <button
                  onClick={handleScrambleSkylineRooms}
                  className="p-1 px-1.5 border-2 border-black bg-[#e2e8f0] hover:bg-slate-200 cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center text-slate-800"
                  title="Reshuffle City"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-black" />
                </button>

                {/* Speaker Mute button toggle */}
                <button
                  onClick={() => setIsMuted((p) => !p)}
                  className="p-1 px-1.5 border-2 border-black bg-[#e2e8f0] hover:bg-slate-200 cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center text-slate-800"
                  title={isMuted ? "Unmute sound synthesizers" : "Mute audio"}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-500" /> : <Volume2 className="w-3.5 h-3.5 text-black" />}
                </button>

              </div>

            </div>

            {/* Dynamic Status Text Ticker directly under top header */}
            <div className="w-full bg-[#fef08a] border-b-4 border-black p-2 text-center text-[9px] font-retro font-extrabold text-black tracking-tight select-text">
              {isFlying ? "DETECTING PLANE TARGET TRAJECTORY..." : isModalOpen ? "STAGE RECOVERY IN PROGRESS..." : "► PRESS LAUNCH BUTTON TO START RUN"}
            </div>

            {/* Flying physical paper plane glider (Rendered with coordinates trajectory map tracking) */}
            <AnimatePresence>
              {isFlying && flightVector && (
                <motion.div
                  key="retro-flying-glider"
                  initial={{
                    left: flightVector.startX,
                    top: flightVector.startY,
                    x: "-50%",
                    y: "-50%",
                    rotate: flightVector.angle - 30,
                    scale: 1,
                    opacity: 1,
                  }}
                  animate={{
                    x: [
                      "-50%",
                      `calc(-50% + ${flightVector.dx * 0.4}px)`,
                      `calc(-50% + ${flightVector.dx * 0.8}px)`,
                      `calc(-50% + ${flightVector.dx}px)`
                    ],
                    y: [
                      "-50%",
                      `calc(-50% + ${flightVector.dy * 0.85 - 100}px)`,
                      `calc(-50% + ${flightVector.dy * 0.95 - 30}px)`,
                      `calc(-50% + ${flightVector.dy}px)`
                    ],
                    rotate: [flightVector.angle - 40, flightVector.angle - 10, flightVector.angle + 5, flightVector.angle],
                    scale: [1, 1.25, 0.8, 0.25],
                    opacity: [1, 1, 1, 0.3],
                  }}
                  transition={{
                    duration: 1.2,
                    ease: "easeInOut",
                  }}
                  className="absolute pointer-events-none z-50"
                >
                  <div className="filter drop-shadow-[2px_2px_0px_#000]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#000"
                      strokeWidth="2.5"
                      className="w-7 h-7 text-yellow-300 fill-yellow-300"
                    >
                      <path d="m22 2-7 20-4-9-9-4Z" />
                      <path d="M22 2 11 13" />
                    </svg>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Target Area Window Selection Hud bar */}
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
              <AnimatePresence mode="wait">
                {selectedWindowId ? (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="flex items-center gap-2 border-2 border-black bg-white p-2 shadow-[2px_2px_0px_rgba(0,0,0,1)] text-[#1e3a8a] text-[8px] sm:text-[9px] font-retro font-bold select-all"
                  >
                    <span className="w-2.5 h-2.5 bg-yellow-400 border border-black animate-pulse rounded-full" />
                    <span className="truncate">
                      COORDS LOCKED: UNKNOWN TARGET
                    </span>
                    <button
                      onClick={() => {
                        setSelectedWindowId(null);
                        triggerAud("close", isMuted);
                      }}
                      className="text-red-500 font-bold border border-red-500 hover:bg-red-500 hover:text-white px-1 leading-tight rounded-xs cursor-pointer"
                    >
                      X
                    </button>
                  </motion.div>
                ) : (
                  <div className="border-2 border-black bg-white p-2 shadow-[2px_2px_0px_rgba(0,0,0,1)] text-[8px] font-retro font-bold text-slate-700 pointer-events-none select-none text-center">
                    SELECT COORDS: CLICK ANY BUILDING WINDOW TARGET DETENTION!
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* The primary housing matrix skyline */}
            <div className="relative w-full flex-1 flex flex-col justify-end overflow-hidden">
              
              {/* Theme-based pixel art clouds in loop */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
                {CLOUDS_CONFIG.map((cloud) => (
                  <motion.div
                    key={cloud.id}
                    className="absolute"
                    style={{
                      top: cloud.top,
                      scale: cloud.scale,
                      opacity: 0.15,
                      imageRendering: "pixelated",
                    }}
                    initial={{ x: "-150px" }}
                    animate={{ x: "calc(100% + 150px)" }}
                    transition={{
                      repeat: Infinity,
                      duration: cloud.duration,
                      delay: cloud.delay,
                      ease: "linear",
                    }}
                  >
                    <svg width="64" height="32" viewBox="0 0 64 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 12H20V8H32V4H44V8H48V12H52V16H56V24H8V20H12V16H16V12Z" fill="white" stroke="black" strokeWidth="2" strokeLinejoin="miter" />
                      <path d="M20 16H24V12H36V8H44V12H48V16H52V20H12V16Z" fill="#cbd5e1" />
                    </svg>
                  </motion.div>
                ))}
              </div>

              <Skyline
                buildings={ARCADE_BUILDINGS}
                windowStates={windowStates}
                onSelectWindow={handleSelectWindowDirectly}
                windowRefs={windowRefs}
                selectedWindowId={selectedWindowId}
                impactWindowId={impactWindowId}
              />

              {/* The launch launching pad button with arrow indicator (Bottom Right of skyline grid) */}
              <div 
                ref={launchpadRef}
                className="absolute bottom-1 right-2 sm:right-6 md:right-10 z-30 pointer-events-auto select-none group flex flex-col items-center gap-1"
                title="Launch Runway Platform Coordinate Anchor"
              >
                <div className="flex justify-center items-center gap-1 border-2 border-black bg-white py-1 px-1.5 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-slate-50 transition-all text-[8px] font-retro font-extrabold text-black">
                  <span className="animate-bounce">⬋</span>
                  <span>PAD</span>
                </div>
                {/* Arrow graphics */}
                <div className="w-1.5 h-4 bg-slate-950/70 absolute bottom-full mb-1 border border-black" />
              </div>

              {/* Red-Black Barber Hazard Warnings Stripings immediately under the building grid horizon */}
              <div className="h-6 w-full hazard-stripe border-t-4 border-black z-10" />
            </div>

            {/* Lower panel layout matching the dashboard segment divider structure in standard arcade units */}
            <div className="border-t-4 border-black bg-[#12131a] text-white p-3 flex flex-col md:flex-row gap-3 items-stretch justify-between z-30 select-all">
              
              {/* Compartment 1: Player info status */}
              <div className="flex-1 md:max-w-[210px] bg-black border-2 border-slate-700 p-2 flex flex-col gap-1 text-[8px] font-retro select-text">
                <div className="flex justify-between items-center text-yellow-300 font-bold">
                  <span>1P INSERT COIN</span>
                  <span className="animate-pulse">● LIVE</span>
                </div>
                <span className="text-slate-400">STATUS: ONLINE 24/7</span>
                <span className="text-emerald-400 font-bold">CREDIT: 99</span>
              </div>

              {/* Compartment 2: Instruction text note scroll container */}
              <div className="flex-1 min-w-0 bg-black border-2 border-slate-700 p-2 flex flex-col justify-between gap-1 text-[8px] font-retro">
                <span className="text-slate-350 font-bold tracking-tight block">
                  AIM WINDOWS • DEPLOY COURIER
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-white text-[7px] uppercase tracking-wide block truncate">
                    Tuck Wish Scroll:
                  </span>
                  <input
                    type="text"
                    value={carrierNote}
                    onChange={(e) => setCarrierNote(e.target.value)}
                    placeholder="Type custom note..."
                    disabled={isFlying}
                    maxLength={50}
                    className="flex-1 bg-slate-900 border border-slate-700 px-2 py-1 text-white text-[8px] font-retro focus:outline-none focus:border-indigo-500 rounded-none disabled:opacity-50 select-text"
                  />
                </div>
              </div>

              {/* Compartment 3: Mega physical Launch action pad */}
              <div className="flex items-center justify-end">
                <button
                  onClick={handleLaunchSequence}
                  disabled={isFlying}
                  className={`
                    py-3 px-6 md:py-4 md:px-8 border-4 border-black font-retro text-xs md:text-sm font-bold shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_#000] transition-all cursor-pointer whitespace-nowrap select-none
                    ${isFlying 
                      ? "bg-slate-700 text-slate-400 border-black cursor-not-allowed shadow-none active:translate-y-0" 
                      : "bg-[#e11d48] hover:bg-[#be123c] text-white"
                    }
                  `}
                >
                  {isFlying ? "FLYING..." : "LAUNCH"}
                </button>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* Retro Popup modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setSelectedWindowId(null);
          setIsModalOpen(false);
          triggerAud("close", isMuted);
        }}
        windowState={activeWindow}
        buildingName={buildingName}
        onToggleLight={handleToggleLight}
        customMsgSent={activeCarrierNote}
      />

    </div>
  );
}
