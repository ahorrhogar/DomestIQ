import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { editorialTrackingService } from "@/services/editorialTrackingService";

export default function BlogRouteTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!pathname.startsWith("/blog/")) {
      return;
    }

    const slug = pathname.replace(/^\/blog\//, "").split("/")[0]?.trim();
    if (!slug) {
      return;
    }

    void editorialTrackingService.trackArticleView({
      slug,
      path: pathname,
    });
  }, [pathname]);

  return null;
}
