import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  classifyChoice,
  validateVerdict,
  circuitState,
  resetCircuit,
  buildUserMessage,
  LLM_COMPLICATION_TYPES,
} from "./llmClient.js";

// ─────────────────────────────────────────────────────────────────────────────
// Hybrid Groq routing tests. The real Groq endpoint is NEVER called — global
// fetch is stubbed per test. These lock in the fallback contract: on any Groq
// failure (bad JSON, bad enum, timeout, HTTP error) classifyChoice returns a
// fallback verdict and the caller keeps the authored complication.
// ─────────────────────────────────────────────────────────────────────────────

const CTX = {
  procedure: "appendectomy",
  procedurePhase: "Patient Intake",
  stepTitle: "Confirm identity and consent",
  stepDescription: "Verify the patient and the signed consent before induction.",
  chosenAction: "Proceed straight to induction — the team completed the checklist earlier this morning.",
  allowedComplications: ["infection", "hemorrhage", "hypoxia", "nerve_injury"],
};

function mockFetchResponse(body: unknown, status = 200) {
  const fetchMock = vi.fn(async () =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    })
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function groqContent(content: unknown) {
  return { choices: [{ message: { content: JSON.stringify(content) } }] };
}

beforeEach(() => {
  process.env.GROQ_API_KEY = "gsk_test-key";
  process.env.GROQ_BASE_URL = "https://api.groq.com/openai/v1/chat/completions";
  process.env.GROQ_MODEL = "llama-3.3-70b-versatile";
  process.env.GROQ_TIMEOUT_MS = "2500";
  process.env.GROQ_MAX_FAILURES = "3";
  process.env.GROQ_CIRCUIT_OPEN_MS = "60000";
  resetCircuit();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  resetCircuit();
});

describe("classifyChoice — success path", () => {
  it("returns a Groq verdict with a valid complication type", async () => {
    mockFetchResponse(
      groqContent({
        is_correct: false,
        complication_type: "infection",
        explanation: "Skipping the time-out breaks the safety checklist.",
        correct_action: "Verify the identity band and marked site.",
      })
    );

    const verdict = await classifyChoice(CTX);
    expect(verdict.source).toBe("groq");
    expect(verdict.isCorrect).toBe(false);
    expect(verdict.complicationType).toBe("infection");
    expect(verdict.explanation).toContain("time-out");
    expect(verdict.correctAction).toContain("identity band");
    expect(circuitState().failures).toBe(0);
  });

  it("returns is_correct=true with an empty complication type", async () => {
    mockFetchResponse(
      groqContent({
        is_correct: true,
        complication_type: "",
        explanation: "The checklist was already completed this morning.",
      })
    );

    const verdict = await classifyChoice(CTX);
    expect(verdict.source).toBe("groq");
    expect(verdict.isCorrect).toBe(true);
    expect(verdict.complicationType).toBe("");
  });

  it("sends the step context and allowed complications in the user payload", async () => {
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) =>
      new Response(
        JSON.stringify(
          groqContent({
            is_correct: false,
            complication_type: "infection",
            explanation: "ok",
          })
        ),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    await classifyChoice(CTX);
    const init = fetchMock.mock.calls[0][1];
    const parsed = JSON.parse(init.body as string);
    const user = JSON.parse(parsed.messages[1].content);
    expect(user.step_title).toBe(CTX.stepTitle);
    expect(user.chosen_action).toBe(CTX.chosenAction);
    expect(user.allowed_complications).toEqual(CTX.allowedComplications);
    expect(parsed.response_format).toEqual({ type: "json_object" });
  });
});

describe("classifyChoice — fallback paths (game never crashes)", () => {
  it("falls back when complication_type is not in the engine enum", async () => {
    mockFetchResponse(
      groqContent({
        is_correct: false,
        complication_type: "SAFETY_VIOLATION",
        explanation: "Protocol violation.",
      })
    );

    const verdict = await classifyChoice(CTX);
    expect(verdict.source).toBe("fallback");
    expect(verdict.complicationType).toBe("");
    expect(circuitState().failures).toBe(1);
  });

  it("falls back when complication_type is valid globally but not allowed for this procedure", async () => {
    mockFetchResponse(
      groqContent({
        is_correct: false,
        complication_type: "thrombosis", // valid enum, NOT in appendectomy's allowlist
        explanation: "Clot propagation.",
      })
    );

    const verdict = await classifyChoice({ ...CTX, allowedComplications: ["infection", "hemorrhage"] });
    expect(verdict.source).toBe("fallback");
    expect(verdict.complicationType).toBe("");
  });

  it("falls back on malformed JSON content", async () => {
    mockFetchResponse({ choices: [{ message: { content: "not json at all" } }] });
    const verdict = await classifyChoice(CTX);
    expect(verdict.source).toBe("fallback");
  });

  it("falls back when the response body is not JSON", async () => {
    const fetchMock = vi.fn(async () => new Response("<html>502</html>", { status: 502 }));
    vi.stubGlobal("fetch", fetchMock);
    const verdict = await classifyChoice(CTX);
    expect(verdict.source).toBe("fallback");
  });

  it("falls back on a 500 HTTP error", async () => {
    mockFetchResponse({ error: "internal" }, 500);
    const verdict = await classifyChoice(CTX);
    expect(verdict.source).toBe("fallback");
    expect(circuitState().failures).toBe(1);
  });

  it("falls back on timeout (abort)", async () => {
    vi.useFakeTimers();
    process.env.GROQ_TIMEOUT_MS = "50";
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init: RequestInit) => {
        return new Promise((_resolve, reject) => {
          (init.signal as AbortSignal).addEventListener("abort", () => {
            reject(new Error("Aborted"));
          });
        });
      })
    );

    const promise = classifyChoice(CTX);
    await vi.advanceTimersByTimeAsync(100);
    const verdict = await promise;
    expect(verdict.source).toBe("fallback");
  });

  it("falls back when no API key is configured", async () => {
    delete process.env.GROQ_API_KEY;
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const verdict = await classifyChoice(CTX);
    expect(verdict.source).toBe("fallback");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("circuit breaker", () => {
  it("opens after GROQ_MAX_FAILURES consecutive failures, then recovers after the window", async () => {
    process.env.GROQ_MAX_FAILURES = "3";
    process.env.GROQ_CIRCUIT_OPEN_MS = "60000";
    mockFetchResponse({ error: "boom" }, 500);

    for (let i = 0; i < 3; i++) {
      const v = await classifyChoice(CTX);
      expect(v.source).toBe("fallback");
    }
    expect(circuitState().open).toBe(true);
    expect(circuitState().failures).toBe(3);

    // While open, no fetch is attempted — instant fallback.
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const v = await classifyChoice(CTX);
    expect(v.source).toBe("fallback");
    expect(fetchMock).not.toHaveBeenCalled();

    // After the window expires, calls resume.
    vi.useFakeTimers();
    await vi.advanceTimersByTimeAsync(60001);
    mockFetchResponse(
      groqContent({
        is_correct: false,
        complication_type: "infection",
        explanation: "recovered",
      })
    );
    const recovered = await classifyChoice(CTX);
    expect(recovered.source).toBe("groq");
    expect(recovered.complicationType).toBe("infection");
    expect(circuitState().failures).toBe(0);
  });

  it("a success resets the failure count", async () => {
    process.env.GROQ_MAX_FAILURES = "3";
    mockFetchResponse({ error: "boom" }, 500);
    await classifyChoice(CTX);
    await classifyChoice(CTX);
    expect(circuitState().failures).toBe(2);

    mockFetchResponse(
      groqContent({
        is_correct: false,
        complication_type: "infection",
        explanation: "ok now",
      })
    );
    const v = await classifyChoice(CTX);
    expect(v.source).toBe("groq");
    expect(circuitState().failures).toBe(0);
  });
});

describe("validateVerdict", () => {
  it("accepts a valid wrong-answer verdict", () => {
    const v = validateVerdict(
      {
        is_correct: false,
        complication_type: "hemorrhage",
        explanation: "Bleeding from the vessel.",
        correct_action: "Ligate the vessel.",
      },
      LLM_COMPLICATION_TYPES
    );
    expect(v).not.toBeNull();
    expect(v!.complicationType).toBe("hemorrhage");
  });

  it("rejects a non-empty complication_type when is_correct is true", () => {
    const v = validateVerdict(
      { is_correct: true, complication_type: "infection", explanation: "x" },
      LLM_COMPLICATION_TYPES
    );
    expect(v).toBeNull();
  });

  it("rejects missing explanation", () => {
    const v = validateVerdict(
      { is_correct: false, complication_type: "infection", explanation: "" },
      LLM_COMPLICATION_TYPES
    );
    expect(v).toBeNull();
  });

  it("rejects non-object payloads", () => {
    expect(validateVerdict("infection", LLM_COMPLICATION_TYPES)).toBeNull();
    expect(validateVerdict(null, LLM_COMPLICATION_TYPES)).toBeNull();
  });
});

describe("buildUserMessage", () => {
  it("defaults allowed complications to the full engine enum when not provided", () => {
    const user = JSON.parse(buildUserMessage({ stepTitle: "x", chosenAction: "y" }));
    expect(user.allowed_complications).toEqual([...LLM_COMPLICATION_TYPES]);
  });
});
