// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { applyTimelineBatch, TimelineBatchState } from "./timelineEvents";
import TimelinePanel from "./TimelinePanel";
import { useSimulationStore } from "../state/simulationStore";

const base = (): TimelineBatchState => ({ timeline: [], lastLen: 0, lastTick: 0 });

describe("applyTimelineBatch (append-only contract)", () => {
  it("appends a fresh batch once, stamping tick-less strings with the current tick", () => {
    const r = applyTimelineBatch(base(), ["Patient profile: X"], 1);
    expect(r.added).toBe(1);
    expect(r.timeline).toEqual([{ tick: 1, type: "Event", description: "Patient profile: X" }]);
    expect(r.lastLen).toBe(1);
  });

  it("treats a re-sent identical batch as a no-op", () => {
    const s = applyTimelineBatch(base(), ["A", "B"], 1);
    expect(s.added).toBe(2);

    // Same content re-sent (as the /tick poller does every 1.5s).
    const again = applyTimelineBatch(s, ["A", "B"], 1);
    expect(again.added).toBe(0);
    expect(again.timeline).toHaveLength(2);
    expect(again.lastLen).toBe(2);
  });

  it("appends only the new tail of a growing log", () => {
    const s = applyTimelineBatch(base(), ["A", "B"], 1);
    const grown = applyTimelineBatch(s, ["A", "B", "C"], 2);
    expect(grown.added).toBe(1);
    expect(grown.timeline.map((e) => e.description)).toEqual(["A", "B", "C"]);
    // The new tail is stamped with the current tick.
    expect(grown.timeline[2].tick).toBe(2);
    expect(grown.lastLen).toBe(3);
  });

  it("keeps legitimately repeated text distinct when it is a genuinely new position", () => {
    // Two different steps emit the same feedback template text.
    const s = applyTimelineBatch(base(), ["Landmark confirmed", "Exposure obtained"], 6);
    const grown = applyTimelineBatch(s, ["Landmark confirmed", "Exposure obtained", "Landmark confirmed"], 10);
    expect(grown.added).toBe(1);
    expect(grown.timeline.map((e) => e.description)).toEqual([
      "Landmark confirmed",
      "Exposure obtained",
      "Landmark confirmed",
    ]);
    expect(grown.timeline[2].tick).toBe(10);
  });

  it("restarts when a new session resets the clock backwards", () => {
    const s = applyTimelineBatch(base(), ["A", "B", "C"], 33);
    expect(s.timeline).toHaveLength(3);

    const fresh = applyTimelineBatch(s, ["Patient profile: new case"], 1);
    expect(fresh.added).toBe(1);
    expect(fresh.timeline).toHaveLength(1);
    expect(fresh.timeline[0].description).toBe("Patient profile: new case");
    expect(fresh.lastLen).toBe(1);
  });

  it("restarts when the incoming log is replaced wholesale by a shorter array", () => {
    const s = applyTimelineBatch(base(), ["A", "B", "C", "D"], 5);
    const replaced = applyTimelineBatch(s, ["engine slice"], 6);
    expect(replaced.added).toBe(1);
    expect(replaced.timeline.map((e) => e.description)).toEqual(["engine slice"]);
  });

  it("leaves state untouched for an empty or non-array batch", () => {
    const s = applyTimelineBatch(base(), ["A"], 1);
    expect(applyTimelineBatch(s, [], 2).added).toBe(0);
    expect(applyTimelineBatch(s, undefined, 2).added).toBe(0);
    expect(applyTimelineBatch(s, "not-an-array", 2).added).toBe(0);
    expect(s.timeline).toHaveLength(1);
  });

  it("preserves structured events and their own tick/type/severity", () => {
    const r = applyTimelineBatch(
      base(),
      [{ tick: 7, type: "Complication", severity: "critical", description: "HEMORRHAGE" }],
      1
    );
    expect(r.timeline).toEqual([
      { tick: 7, type: "Complication", severity: "critical", description: "HEMORRHAGE" },
    ]);
  });
});

describe("TimelinePanel (integration)", () => {
  beforeEach(() => {
    useSimulationStore.setState({ currentState: {}, currentTick: 0 });
  });

  afterEach(() => {
    cleanup();
  });

  it("does not duplicate events when the poller re-sends the same batch", async () => {
    useSimulationStore.setState({
      currentState: { events: ["Patient profile: X"] },
      currentTick: 1,
    });
    render(<TimelinePanel />);

    await waitFor(() => expect(screen.getByText("Patient profile: X")).toBeInTheDocument());
    expect(screen.getAllByText("Patient profile: X")).toHaveLength(1);

    // Simulate two poller cycles: new object, same events content, same tick.
    for (let i = 0; i < 2; i++) {
      useSimulationStore.setState({
        currentState: { events: ["Patient profile: X"] },
        currentTick: 1,
      });
      await new Promise((res) => setTimeout(res, 20));
    }
    expect(screen.getAllByText("Patient profile: X")).toHaveLength(1);
  });

  it("appends new events once and resets for a new session", async () => {
    useSimulationStore.setState({
      currentState: { events: ["A", "B", "C"] },
      currentTick: 3,
    });
    render(<TimelinePanel />);
    await waitFor(() => expect(screen.getByText("A")).toBeInTheDocument());
    expect(screen.getAllByText(/^[ABC]$/)).toHaveLength(3);

    // Next step: log grows by one.
    useSimulationStore.setState({
      currentState: { events: ["A", "B", "C", "D"] },
      currentTick: 4,
    });
    await waitFor(() => expect(screen.getByText("D")).toBeInTheDocument());
    expect(screen.getAllByText(/^[ABCD]$/)).toHaveLength(4);

    // New simulation: clock resets to tick 1, fresh events replace the log.
    useSimulationStore.setState({
      currentState: { events: ["Patient profile: Y"] },
      currentTick: 1,
    });
    await waitFor(() => expect(screen.getByText("Patient profile: Y")).toBeInTheDocument());
    expect(screen.queryByText("A")).not.toBeInTheDocument();
    expect(screen.queryByText("B")).not.toBeInTheDocument();
    expect(screen.queryByText("C")).not.toBeInTheDocument();
    expect(screen.queryByText("D")).not.toBeInTheDocument();
    expect(screen.getAllByText("Patient profile: Y")).toHaveLength(1);
  });
});
