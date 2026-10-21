import { useEffect, type RefObject } from "react";
import { useMapStore } from "../model/mapStore";

/**
 * Keep the fixed 1200x900 canvas frame centred in its scroll viewport and
 * fit the graph inside React Flow after mount, header toggles and resizes.
 * @param scrollRef - scrollable canvas viewport element
 * @param frameRef - fixed-size canvas frame element
 */
export function useAutoCenter(
  scrollRef: RefObject<HTMLElement | null>,
  frameRef: RefObject<HTMLDivElement | null>,
): void {
  const centerMap = useMapStore((s) => s.centerMap);
  const headerVisible = useMapStore((s) => s.headerVisible);

  useEffect(() => {
    let frame = 0;
    let resizeTimer: number | undefined;

    const center = (): void => {
      const scroll = scrollRef.current;
      const canvasFrame = frameRef.current;

      if (scroll && canvasFrame) {
        const scrollRect = scroll.getBoundingClientRect();
        const frameRect = canvasFrame.getBoundingClientRect();
        const left = scroll.scrollLeft + frameRect.left - scrollRect.left - (scroll.clientWidth - frameRect.width) / 2;
        const top = scroll.scrollTop + frameRect.top - scrollRect.top - (scroll.clientHeight - frameRect.height) / 2;

        scroll.scrollTo({ left: Math.max(0, left), top: Math.max(0, top), behavior: "auto" });
      }

      centerMap();
    };

    const schedule = (): void => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(center);
    };

    const onResize = (): void => {
      if (resizeTimer !== undefined) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(schedule, 120);
    };

    schedule();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      if (resizeTimer !== undefined) window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, [centerMap, frameRef, headerVisible, scrollRef]);
}
