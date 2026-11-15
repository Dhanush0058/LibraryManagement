import React from 'react';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';
import { SwipeState } from '../../hooks/useSwipeNavigation';

interface GestureBackIndicatorProps {
  swipeState: SwipeState;
  targetTitle?: string;
}

export const GestureBackIndicator: React.FC<GestureBackIndicatorProps> = ({
  swipeState,
  targetTitle = 'Operational Dashboard',
}) => {
  const { isSwiping, swipeProgress, deltaX, currentY, isTriggerReady } = swipeState;

  if (!isSwiping || deltaX <= 8) {
    return null;
  }

  // Calculate visual translation based on swipe progress (up to 48px)
  const translateX = Math.min(deltaX * 0.45, 64);
  // Position vertically around user touch position (with viewport clamping)
  const clampedY = Math.max(120, Math.min(window.innerHeight - 120, currentY || window.innerHeight / 2));

  return (
    <>
      {/* Edge gradient backdrop glow */}
      <div
        className="fixed inset-y-0 left-0 w-12 pointer-events-none z-50 transition-opacity duration-150"
        style={{
          background: 'linear-gradient(to right, rgba(250, 138, 90, 0.25), transparent)',
          opacity: Math.min(1, swipeProgress * 1.2),
        }}
      />

      {/* Floating Gesture Back Capsule */}
      <div
        className="fixed left-2 z-50 pointer-events-none transition-all duration-75 ease-out flex items-center gap-2 select-none"
        style={{
          top: `${clampedY}px`,
          transform: `translate3d(${translateX}px, -50%, 0) scale(${0.85 + swipeProgress * 0.25})`,
          opacity: Math.min(1, swipeProgress * 1.5),
        }}
      >
        <div
          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-full border shadow-xl backdrop-blur-md transition-colors duration-150 ${
            isTriggerReady
              ? 'bg-[#FA8A5A] text-white border-[#FA8A5A] ring-4 ring-coral-300/40 shadow-coral-500/30'
              : 'bg-white/95 text-charcoal-900 border-parchment-300 shadow-charcoal-900/15'
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform ${
              isTriggerReady ? '-translate-x-0.5' : ''
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
          </div>

          <div className="flex flex-col pr-1">
            <span className="text-[11px] font-bold leading-tight flex items-center gap-1">
              <LayoutDashboard className="w-3 h-3" />
              {isTriggerReady ? 'Release to Return' : 'Swipe to Return'}
            </span>
            <span
              className={`text-[9px] font-medium leading-none truncate max-w-[130px] ${
                isTriggerReady ? 'text-white/90' : 'text-charcoal-500'
              }`}
            >
              {targetTitle}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
