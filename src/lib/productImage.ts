export const PRODUCT_IMAGE_FALLBACK = "/homara-logo.svg";

export function applyProductImageFallback(target: HTMLImageElement): void {
  if (target.dataset.fallbackApplied === "true") {
    return;
  }

  target.dataset.fallbackApplied = "true";
  target.src = PRODUCT_IMAGE_FALLBACK;
  target.classList.remove("object-cover");
  target.classList.add("object-contain");
}
