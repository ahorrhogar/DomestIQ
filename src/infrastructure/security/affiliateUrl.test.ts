import { describe, expect, it } from "vitest";
import {
  domainMatchesOrIsSubdomain,
  extractDomainFromAffiliateUrl,
  isAffiliateUrlAllowed,
  normalizeDomain,
  parseAffiliateUrl,
} from "@/infrastructure/security/affiliateUrl";

describe("affiliateUrl security helpers", () => {
  it("accepts https affiliate url with a public hostname", () => {
    expect(parseAffiliateUrl("https://www.amazon.es/dp/B001?tag=abc-21")).not.toBeNull();
  });

  it("rejects insecure or local redirect targets", () => {
    expect(parseAffiliateUrl("http://amazon.es/dp/B001")).toBeNull();
    expect(parseAffiliateUrl("https://localhost:3000/hack")).toBeNull();
    expect(parseAffiliateUrl("https://192.168.1.12/path")).toBeNull();
  });

  it("matches merchant domain including subdomains", () => {
    expect(isAffiliateUrlAllowed("https://go.amazon.es/dp/B001", "amazon.es")).toBe(true);
    expect(isAffiliateUrlAllowed("https://evil-amazon.es/dp/B001", "amazon.es")).toBe(false);
  });

  it("normalizes domain values", () => {
    expect(normalizeDomain("https://www.IKEA.com/es")).toBe("ikea.com");
    expect(extractDomainFromAffiliateUrl("https://www.leroymerlin.es/producto")).toBe("leroymerlin.es");
  });

  it("checks exact or subdomain domain match", () => {
    expect(domainMatchesOrIsSubdomain("offers.carrefour.es", "carrefour.es")).toBe(true);
    expect(domainMatchesOrIsSubdomain("carrefour.es", "carrefour.es")).toBe(true);
    expect(domainMatchesOrIsSubdomain("carrefour.es.evil.com", "carrefour.es")).toBe(false);
  });
});
