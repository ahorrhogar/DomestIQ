const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"]);

function containsControlCharacters(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code <= 31 || code === 127) {
      return true;
    }
  }

  return false;
}

function isPrivateIpv4(hostname: string): boolean {
  const parts = hostname.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return false;
  }

  const [a, b] = parts;

  if (a === 10 || a === 127 || a === 0) {
    return true;
  }

  if (a === 169 && b === 254) {
    return true;
  }

  if (a === 172 && b >= 16 && b <= 31) {
    return true;
  }

  if (a === 192 && b === 168) {
    return true;
  }

  return false;
}

function isLikelyPublicHostname(hostname: string): boolean {
  if (!hostname) {
    return false;
  }

  const normalized = hostname.toLowerCase();

  if (LOCAL_HOSTS.has(normalized)) {
    return false;
  }

  if (normalized.endsWith(".local") || normalized.endsWith(".internal") || normalized.endsWith(".localhost")) {
    return false;
  }

  if (isPrivateIpv4(normalized)) {
    return false;
  }

  return normalized.includes(".");
}

export function normalizeDomain(input: string | null | undefined): string {
  const value = String(input || "").trim().toLowerCase();
  if (!value) {
    return "";
  }

  const withoutProtocol = value.replace(/^https?:\/\//, "");
  const host = withoutProtocol.split("/")[0].split(":")[0].trim();
  if (!host) {
    return "";
  }

  return host.startsWith("www.") ? host.slice(4) : host;
}

export function domainMatchesOrIsSubdomain(hostname: string, domain: string): boolean {
  const host = normalizeDomain(hostname);
  const allowed = normalizeDomain(domain);

  if (!host || !allowed) {
    return false;
  }

  return host === allowed || host.endsWith(`.${allowed}`);
}

export function parseAffiliateUrl(input: string): URL | null {
  const value = String(input || "").trim();
  if (!value || value.length > 2048) {
    return null;
  }

  if (containsControlCharacters(value)) {
    return null;
  }

  try {
    const parsed = new URL(value);

    if (parsed.protocol !== "https:") {
      return null;
    }

    if (parsed.username || parsed.password) {
      return null;
    }

    if (parsed.port && parsed.port !== "443") {
      return null;
    }

    if (!isLikelyPublicHostname(parsed.hostname)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function isAffiliateUrlAllowed(url: string, merchantDomain?: string | null): boolean {
  const parsed = parseAffiliateUrl(url);
  if (!parsed) {
    return false;
  }

  const normalizedMerchantDomain = normalizeDomain(merchantDomain);
  if (!normalizedMerchantDomain) {
    return true;
  }

  // Accept merchant-domain links and affiliate redirect/shortener links.
  // We rely on parseAffiliateUrl for protocol/host hardening (https, no local/private hosts, no credentials).
  if (domainMatchesOrIsSubdomain(parsed.hostname, normalizedMerchantDomain)) {
    return true;
  }

  return true;
}

export function extractDomainFromAffiliateUrl(url: string): string {
  const parsed = parseAffiliateUrl(url);
  return parsed ? normalizeDomain(parsed.hostname) : "";
}
