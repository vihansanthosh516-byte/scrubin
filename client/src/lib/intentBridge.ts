import { simulationSocket } from "./simulationSocket";
import { useSimulationStore } from "../state/simulationStore";

export const intentBridge = {
  // Sends user intent to the backend. For surgical decisions we use the
  // session/decide HTTP endpoint (synchronous) while other intents fallback
  // to the WebSocket (if needed).
  sendIntent: async (intent: string, target: string, payload: any = {}) => {
    const { simId } = useSimulationStore.getState();
    if (!simId) {
      console.error("Cannot send intent: No active session");
      return;
    }

    const API_BASE = "http://localhost:8000";

    if (intent === "SURGICAL_DECISION") {
      // Defensive guard – ignore obviously invalid ids (single‑letter UI placeholders)
      const optionId = payload?.optionId ?? payload?.option_id;
      const decisionId = payload?.decisionId ?? payload?.decision_id;
      const isLikelyInvalid = typeof optionId === "string" && optionId.length === 1 && !optionId.includes("_");
      const body: any = {
        session_id: simId,
        option_id: optionId,
        target: target,
      };
      if (decisionId) {
        body.decision_id = decisionId;
      }
      try {
        const resp = await fetch(`${API_BASE}/session/decide`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (isLikelyInvalid) {
          console.error("Invalid option ID – not sent to backend", optionId);
          return;
        }
        if (!resp.ok) {
          console.error("Failed to send decision", resp.status);
        } else {
          console.log("Decision sent", await resp.json());
        }
      } catch (e) {
        console.error("Decision send error", e);
      }
    } else {
      // Fallback for any other intent types – send via the existing socket.
      const { currentTick } = useSimulationStore.getState();
      simulationSocket.sendIntent({
        intent,
        target,
        tick: currentTick + 1,
        payload,
      });
    }
  }
};
