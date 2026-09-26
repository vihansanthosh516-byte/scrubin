import { describe, it, expect } from "vitest";
import { auditAllBanks, AuditFlag } from "./stepAudit";

// Known-benign template-mismatch flags: template steps whose generic clinical
// response (exposure/verify/vessel/access/core) is *intended* even though it
// shares few content words with the title. Every entry is keyed by
// "bankId|title". When a step's content legitimately improves, remove its
// entry here — the stale-entry check below will tell you it is no longer
// flagged.
//
// Currently empty: every previously-allowlisted template step has been
// polished into an explicit-choice step, so any template_mismatch flag that
// appears now is a genuine defect and fails CI.
const ALLOWED_TEMPLATE_MISMATCHES = new Set<string>([]);

const key = (f: AuditFlag) => `${f.bankId}|${f.title}`;

describe("stock step banks content audit", () => {
  it("has no explicit-choice options that duplicate each other or the correct answer", () => {
    const dups = auditAllBanks().filter((f) => f.reason === "duplicate_option");
    expect(dups).toEqual([]);
  });

  it("triggers only valid, bank-declared complications, and never the same one twice", () => {
    const bad = auditAllBanks().filter((f) =>
      ["complication_invalid", "complication_not_in_risks", "complication_duplicate"].includes(f.reason)
    );
    expect(bad).toEqual([]);
  });

  it("keeps every bank's steps in surgical phase order", () => {
    const descents = auditAllBanks().filter((f) => f.reason === "phase_descent");
    expect(descents).toEqual([]);
  });

  it("flags no NEW template mismatches (the lavage-step bug class)", () => {
    const mismatches = auditAllBanks().filter((f) => f.reason === "template_mismatch");
    const unexpected = mismatches.filter((f) => !ALLOWED_TEMPLATE_MISMATCHES.has(key(f)));
    expect(unexpected).toEqual([]);
  });

  it("allowlist is not stale — every entry is still actually flagged", () => {
    const flagged = new Set(
      auditAllBanks()
        .filter((f) => f.reason === "template_mismatch")
        .map(key)
    );
    const stale = [...ALLOWED_TEMPLATE_MISMATCHES].filter((k) => !flagged.has(k));
    expect(stale).toEqual([]);
  });
});
