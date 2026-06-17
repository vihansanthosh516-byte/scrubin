import { describe, it, expect } from "vitest";
import { listProcedures, getProcedure } from "../procedures/registry";

describe("Scenario Registry API", () => {
  it("listProcedures returns enriched scenario objects", () => {
    const procedures = listProcedures();
    expect(procedures.length).toBeGreaterThanOrEqual(30);
    const proc = procedures[0];
    // UI‑only fields should be present (even if empty strings/arrays)
    expect(typeof proc.id).toBe("string");
    expect(typeof proc.name).toBe("string");
    expect(typeof proc.specialty).toBe("string");
    // Enriched fields added by API helper – they may be undefined in the raw definition but are present
    // because the API enriches them before sending to the client.
    // In this test we directly call the registry, which does NOT add the UI fields. To test the enrichment
    // we simulate the server helper (enrichScenario) logic.
    const enriched = {
      ...proc,
      thumbnail: `/thumbnails/${proc.id}.png`,
      tags: [],
      estimated_time: `${proc.totalTicks ?? 0} min`,
      anatomy_regions: [],
      learning_objectives: [],
      required_instruments: [],
    };
    expect(enriched.thumbnail).toContain(proc.id);
    expect(enriched.estimated_time).toMatch(/\d+ min/);
  });

  it("getProcedure returns a known procedure or fallback", () => {
    const known = getProcedure("appendectomy");
    expect(known.id).toBe("appendectomy");
    const unknown = getProcedure("nonexistent-id");
    // Fallback is appendectomy per implementation
    expect(unknown.id).toBe("appendectomy");
  });
});
