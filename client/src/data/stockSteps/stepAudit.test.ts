import { describe, it, expect } from "vitest";
import { auditAllBanks, AuditFlag } from "./stepAudit";

// Known-benign template-mismatch flags: template steps whose generic clinical
// response (exposure/verify/vessel/access/core) is *intended* even though it
// shares few content words with the title. Every entry is keyed by
// "bankId|title". When a step's content legitimately improves, remove its
// entry here — the stale-entry check below will tell you it is no longer
// flagged.
const ALLOWED_TEMPLATE_MISMATCHES = new Set([
  "appendectomy|Control the mesoappendix",
  "inguinal-hernia|Assess the contralateral side",
  "thyroidectomy|Protect the RLN during dissection",
  "thyroidectomy|Inspect for bleeding before closure",
  "thyroidectomy|Develop the capsular plane on the second side",
  "cholecystectomy|Inspect the clips under tension",
  "cholecystectomy|Check the liver bed once more",
  "acl-reconstruction|Establish the portals",
  "acl-reconstruction|Wash out the joint",
  "c-section|Inspect the adnexa and pelvis",
  "c-section|Check the bladder and the ureters",
  "total-hysterectomy|Confirm the ureters again",
  "sigmoid-colectomy|Inspect the splenic flexure take-down",
  "lap-cholecystectomy|Re-inspect the liver bed",
  "radical-nephrectomy|Reflect the colon and identify the retroperitoneum",
  "radical-nephrectomy|Inspect the adrenal bed",
  "hip-replacement|Make the skin incision",
  "hip-replacement|Check the acetabular cup fixation",
  "hip-replacement|Wash the wound",
  "tympanoplasty|Choose the approach",
  "femoral-nail-fixation|Check the knee range",
  "rotator-cuff-repair|Establish the portals",
  "rotator-cuff-repair|Wash out the subacromial space",
  "parathyroidectomy|Raise the flaps and open the midline",
  "cabg|Open the pericardium",
  "cabg|Check the LIMA bed",
  "spinal-fusion|Check the decompression",
  "pulmonary-lobectomy|Divide the fissures",
  "whipple|Inspect the retroperitoneum",
  "aaa-repair|Retract the small bowel",
  "aaa-repair|Check the retroperitoneal bed",
  "esophagectomy|Check the anastomotic tension",
  "lumbar-microdiscectomy|Subperiosteal exposure",
  "lumbar-microdiscectomy|Check the dural repair",
  "lumbar-microdiscectomy|Wash the wound",
  "cabg-offpump|Open the pericardium",
  "cabg-offpump|Check the LIMA bed",
]);

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
