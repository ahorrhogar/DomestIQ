export const PRODUCT_IMAGE_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23E5E7EB'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial,sans-serif' font-size='24' fill='%236B7280'%3ENo%20hay%20imagen%3C/text%3E%3C/svg%3E";

export function applyProductImageFallback(target: HTMLImageElement): void {
  if (target.dataset.fallbackApplied === "true") {
    return;
  }

  target.dataset.fallbackApplied = "true";
  target.src = PRODUCT_IMAGE_FALLBACK;
  target.classList.remove("object-cover");
  target.classList.add("object-contain");
}
