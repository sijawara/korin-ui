"use client";

import { useEffect, useState } from "react";

/**
 * useIsMobile
 * - Detects mobile by combining viewport width and user agent signals.
 * - Returns true if:
 *   - window.innerWidth < 768, OR
 *   - navigator.userAgentData?.mobile is true, OR
 *   - navigator.userAgent matches common mobile devices.
 * - Special case: If running inside Microsoft Edge Side Panel, always returns false.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const ua = typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
    const uaDataMobile = typeof navigator !== "undefined" && (navigator as any).userAgentData?.mobile;
    const brands: Array<{ brand: string; version: string }> | undefined =
      typeof navigator !== "undefined" ? (navigator as any).userAgentData?.brands : undefined;
    const isEdgeSidePanel = Boolean(brands?.some((b) => b.brand === "Edge Side Panel"));

    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone/i;

    const compute = () => {
      // If app runs inside Microsoft Edge Sidebar, force non-mobile behavior
      if (isEdgeSidePanel) {
        setIsMobile(false);
        return;
      }
      const widthMobile = typeof window !== "undefined" ? window.innerWidth < 768 : false;
      const uaMobile = uaDataMobile === true || mobileRegex.test(ua);
      setIsMobile(Boolean(widthMobile && uaMobile));
    };

    compute();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", compute);
      return () => window.removeEventListener("resize", compute);
    }
  }, []);

  return isMobile;
}
