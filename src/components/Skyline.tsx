import React from "react";
import { BuildingData, WindowState } from "../types";

interface SkylineProps {
  buildings: BuildingData[];
  windowStates: Record<string, WindowState>;
  onSelectWindow: (windowId: string) => void;
  windowRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  selectedWindowId: string | null;
  impactWindowId: string | null;
}

export default function Skyline({
  buildings,
  windowStates,
  onSelectWindow,
  windowRefs,
  selectedWindowId,
  impactWindowId,
}: SkylineProps) {
  return (
    <div className="absolute bottom-0 inset-x-0 h-[42vh] min-h-[250px] flex items-end justify-center gap-3 sm:gap-4 md:gap-6 px-4 md:px-12 pointer-events-none select-none z-20">
      {buildings.map((building) => {
        const { buildingIndex, name, cols, rows, heightClass, widthClass, colorClass, roofStyle } = building;

        return (
          <div
            key={buildingIndex}
            className={`relative flex flex-col justify-end items-center h-full ${widthClass} pointer-events-auto`}
          >
            {/* Architectural Roof Top Accessories (Pixel thick line style) */}

            {roofStyle === "spire" && (
              <div
                className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[20px] border-b-black pointer-events-none mb-[-2px]"
              />
            )}

            {roofStyle === "dome" && (
              <div className="w-12 h-6 rounded-t-full bg-black border-2 border-black pointer-events-none mb-[-2px]" />
            )}

            {roofStyle === "sloped" && (
              <div 
                className="w-full h-5 bg-black pointer-events-none mb-[-2px]" 
                style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }} 
              />
            )}

            {/* Retro Game Building Core Body */}
            <div
              className={`w-full relative flex flex-col justify-between p-2 md:p-3 pb-8 border-4 border-black transition-all duration-300 ${heightClass} ${colorClass}`}
              style={{ boxShadow: "4px 4px 0px rgba(0,0,0,0.4)" }}
            >
              {/* Retro Small Header Sign inside building */}
              <div className="absolute top-1 left-1.5 pointer-events-none select-none">
                <span className="font-retro text-[7px] text-slate-500 uppercase leading-none font-bold opacity-70">
                  {name.split(" ")[0]}
                </span>
              </div>

              {/* Grid of Windows */}
              <div className="w-full h-full flex flex-col justify-center items-center gap-1 sm:gap-1.5 md:gap-2 mt-4">
                {Array.from({ length: rows }).map((_, rIdx) => (
                  <div key={rIdx} className="flex justify-center items-center gap-1 sm:gap-1.5 md:gap-2 w-full">
                    {Array.from({ length: cols }).map((_, cIdx) => {
                      const windowId = `win-${buildingIndex}-${rIdx}-${cIdx}`;
                      const state = windowStates[windowId];
                      if (!state) return null;

                      const isSelected = selectedWindowId === windowId;
                      const hasImpact = impactWindowId === windowId;

                      // Retro solid yellow color when lit, matching the arcade look
                      // If not lit, a matching soft dark gray backplate
                      const windowStyleClass = state.isLit
                        ? "bg-amber-300 border-2 border-black shadow-[inset_-2px_-2px_0px_#f59e0b,0_0_8px_#fde047]"
                        : "bg-slate-700/60 border-2 border-black shadow-[inset_-1px_-1px_0px_#334155]";

                      return (
                        <div
                          key={cIdx}
                          ref={(el) => {
                            windowRefs.current[windowId] = el;
                          }}
                          onClick={() => onSelectWindow(windowId)}
                          className={`
                            relative w-2.5 h-3.5 xs:w-3.5 xs:h-4.5 sm:w-5 sm:h-6 md:w-6 md:h-7 cursor-pointer select-none transition-all duration-150
                            ${windowStyleClass}
                            hover:scale-105 hover:border-indigo-500
                          `}
                          style={{ imageRendering: "pixelated" }}
                          title={`Target Point: ${state.room.title}`}
                        >
                          {/* Inner character sprite representation emoji inside window (removed per screenshot edits request) */}

                          {/* Dynamic Impact hit ripple overlay */}
                          {hasImpact && (
                            <div className="absolute -inset-4 border-4 border-yellow-300 pointer-events-none z-30 window-impact-pulse" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
