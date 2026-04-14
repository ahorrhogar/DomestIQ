const allowedHosts = new Set<string>(["localhost", "domestiq.es", "www.domestiq.es"]);

export function isSafeInternalPath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//") && !path.includes("\\");
}

export function resolveSafeRedirect(target: string | undefined, fallback = "/"): string {
  if (!target) {
    return fallback;
  }

  if (isSafeInternalPath(target)) {
    return target;
  }

  try {
    const url = new URL(target);
    if (allowedHosts.has(url.hostname)) {
      return `${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    return fallback;
  }

  return fallback;
}
