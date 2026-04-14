import { useEffect } from "react";

export function AdminNoIndex() {
  useEffect(() => {
    const previous = document.querySelector('meta[name="robots"]')?.getAttribute("content") || null;
    let robotsMeta = document.querySelector('meta[name="robots"]');

    if (!robotsMeta) {
      robotsMeta = document.createElement("meta");
      robotsMeta.setAttribute("name", "robots");
      document.head.appendChild(robotsMeta);
    }

    robotsMeta.setAttribute("content", "noindex,nofollow");

    return () => {
      if (!robotsMeta) {
        return;
      }

      if (previous) {
        robotsMeta.setAttribute("content", previous);
      } else {
        robotsMeta.remove();
      }
    };
  }, []);

  return null;
}
