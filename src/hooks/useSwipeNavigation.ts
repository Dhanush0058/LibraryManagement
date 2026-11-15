import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseSwipeNavigationOptions {
  /**
   * Callback invoked when a valid swipe-back gesture completes.
   */
  onSwipeBack: () => void;
  /**
   * Whether swipe back is allowed (e.g., false if already on dashboard).
   */
  isBackAllowed: boolean;
  /**
   * Minimum distance in pixels required to trigger navigation. Defaults to 75.
   */
  threshold?: number;
  /**
   * Max initial X distance from screen edge to trigger edge-swipe. Defaults to 0 (anywhere on screen with horizontal dominance, edge prioritized).
   */
  edgeOnly?: boolean;
  /**
   * Max width in pixels from the left edge for edge-swipe mode. Defaults to 60.
   */
  edgeZoneWidth?: number;
}

export interface SwipeState {
  isSwiping: boolean;
  swipeProgress: number; // 0 to 1
  deltaX: number;
  deltaY: number;
  startY: number;
  currentY: number;
  isTriggerReady: boolean;
}

export function useSwipeNavigation({
  onSwipeBack,
  isBackAllowed,
  threshold = 75,
  edgeOnly = false,
  edgeZoneWidth = 60,
}: UseSwipeNavigationOptions) {
  const [swipeState, setSwipeState] = useState<SwipeState>({
    isSwiping: false,
    swipeProgress: 0,
    deltaX: 0,
    deltaY: 0,
    startY: 0,
    currentY: 0,
    isTriggerReady: false,
  });

  const touchStartRef = useRef<{
    x: number;
    y: number;
    time: number;
    isValidOrigin: boolean;
  } | null>(null);

  const isSwipingRef = useRef(false);

  // Helper to check if touch started in an element that should consume horizontal swipes
  const isTouchInsideIgnoredElement = (target: EventTarget | null): boolean => {
    if (!(target instanceof HTMLElement)) return false;

    // Ignore text inputs, textareas, range sliders, or interactive form controls
    const tagName = target.tagName.toLowerCase();
    if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
      return true;
    }

    // Ignore horizontally scrolled containers unless at left-most edge
    let current: HTMLElement | null = target;
    while (current && current !== document.body) {
      if (current.scrollWidth > current.clientWidth && current.scrollLeft > 0) {
        return true;
      }
      current = current.parentElement;
    }

    return false;
  };

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      // Only track single-touch gestures
      if (e.touches.length !== 1 || !isBackAllowed) {
        touchStartRef.current = null;
        isSwipingRef.current = false;
        return;
      }

      const touch = e.touches[0];
      const startX = touch.clientX;
      const startY = touch.clientY;

      // If edgeOnly is specified, must start near the left edge
      const isEdge = startX <= edgeZoneWidth;
      if (edgeOnly && !isEdge) {
        touchStartRef.current = null;
        return;
      }

      // If inside horizontally scrollable element and not near edge, ignore
      if (!isEdge && isTouchInsideIgnoredElement(e.target)) {
        touchStartRef.current = null;
        return;
      }

      touchStartRef.current = {
        x: startX,
        y: startY,
        time: Date.now(),
        isValidOrigin: true,
      };
      isSwipingRef.current = false;
    },
    [isBackAllowed, edgeOnly, edgeZoneWidth]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!touchStartRef.current || !touchStartRef.current.isValidOrigin || !isBackAllowed) {
        return;
      }

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      // Only respond to rightward swipes (returning to previous page / dashboard)
      if (deltaX <= 0) {
        if (isSwipingRef.current) {
          isSwipingRef.current = false;
          setSwipeState(prev => ({
            ...prev,
            isSwiping: false,
            swipeProgress: 0,
            deltaX: 0,
            isTriggerReady: false,
          }));
        }
        return;
      }

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Must be predominantly horizontal gesture to avoid interfering with natural page vertical scrolling
      if (!isSwipingRef.current) {
        // Initial threshold to engage gesture
        if (absX > 10) {
          if (absX > absY * 1.25) {
            isSwipingRef.current = true;
          } else {
            // Predominantly vertical scrolling: cancel gesture tracking
            touchStartRef.current.isValidOrigin = false;
            return;
          }
        } else {
          return;
        }
      }

      // Clamp progress between 0 and 1
      const progress = Math.min(1, Math.max(0, deltaX / threshold));
      const isReady = deltaX >= threshold;

      setSwipeState({
        isSwiping: true,
        swipeProgress: progress,
        deltaX,
        deltaY,
        startY: touchStartRef.current.y,
        currentY: touch.clientY,
        isTriggerReady: isReady,
      });
    },
    [isBackAllowed, threshold]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!touchStartRef.current || !touchStartRef.current.isValidOrigin) {
        return;
      }

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const duration = Date.now() - touchStartRef.current.time;
      const velocityX = deltaX / Math.max(1, duration); // px/ms

      const wasSwiping = isSwipingRef.current;
      touchStartRef.current = null;
      isSwipingRef.current = false;

      // Reset swipe state smoothly
      setSwipeState({
        isSwiping: false,
        swipeProgress: 0,
        deltaX: 0,
        deltaY: 0,
        startY: 0,
        currentY: 0,
        isTriggerReady: false,
      });

      // Trigger condition:
      // Either crossed the distance threshold or achieved a quick flick rightward
      if (wasSwiping && isBackAllowed) {
        const isDistanceMet = deltaX >= threshold;
        const isQuickFlick = deltaX >= 40 && velocityX > 0.4 && Math.abs(deltaY) < 60;

        if (isDistanceMet || isQuickFlick) {
          onSwipeBack();
        }
      }
    },
    [isBackAllowed, threshold, onSwipeBack]
  );

  const handleTouchCancel = useCallback(() => {
    touchStartRef.current = null;
    isSwipingRef.current = false;
    setSwipeState({
      isSwiping: false,
      swipeProgress: 0,
      deltaX: 0,
      deltaY: 0,
      startY: 0,
      currentY: 0,
      isTriggerReady: false,
    });
  }, []);

  useEffect(() => {
    // Attach touch listeners to the window so gestures are captured consistently anywhere on the page
    const options: AddEventListenerOptions = { passive: true };

    window.addEventListener('touchstart', handleTouchStart, options);
    window.addEventListener('touchmove', handleTouchMove, options);
    window.addEventListener('touchend', handleTouchEnd, options);
    window.addEventListener('touchcancel', handleTouchCancel, options);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel]);

  return swipeState;
}
