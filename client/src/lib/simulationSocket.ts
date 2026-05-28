import { useSimulationStore, DVKProof } from "../state/simulationStore";

class SimulationSocket {
  private ws: WebSocket | null = null;

  connectSimulation(
    simId: string,
    mode: "live" | "dvk",
    onTick: (state: any, tick: number) => void
  ) {
    if (this.ws) {
      this.ws.close();
    }

    const store = useSimulationStore.getState();

    // ✅ CRITICAL FIX: keep mode in sync everywhere
    store.setMode(mode);
    store.setConnectionStatus("connecting");

    this.ws = new WebSocket(`ws://localhost:8000/session/${simId}/ws`);

    this.ws.onopen = () => {
      store.setConnectionStatus("connected");
      console.log(`WebSocket connected: ${simId} (${mode})`);
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        console.log("WS MESSAGE:", data);

        // ✅ ALWAYS extract usable state (no strict filtering)
        const state =
          data.state ||
          data.summary ||
          data.payload ||
          data.currentState ||
          data;

        const tick =
          data.tick ??
          state.tick ??
          store.currentTick ??
          0;

        // DVK path (optional)
        if (data.type === "dvk_tick") {
          const proof: DVKProof = {
            tick: data.tick,
            state_hash: data.state_hash,
            ces_hash: data.ces_hash,
            proof_id: data.proof_id,
            causal_events: data.causal_events,
            state: data.state,
          };

          store.addDvkProof(proof);

          // still feed UI
          onTick(proof.state, proof.tick);
          return;
        }

        // ✅ MAIN FIX: always update UI (NO mode gating)
        onTick(state, tick);
      } catch (e) {
        console.error("WS parse error:", e);
      }
    };

    this.ws.onclose = () => {
      store.setConnectionStatus("disconnected");
      console.log("WebSocket disconnected");
    };

    this.ws.onerror = (err) => {
      store.setConnectionStatus("error");
      console.error("WebSocket error:", err);
    };
  }

  sendIntent(intentPayload: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error("WebSocket not connected");
      return;
    }

    const { intent, target, payload } = intentPayload;

    if (intent === "SURGICAL_DECISION") {
      const optionId = payload?.optionId ?? payload?.option_id;

      if (!optionId) {
        console.error("Missing optionId:", payload);
        return;
      }

      const message = {
        command: "decide",
        data: {
          option_id: optionId,
          target,
        },
      };

      this.ws.send(JSON.stringify(message));
      console.log("DECISION SENT:", message);
      return;
    }

    this.ws.send(
      JSON.stringify({
        command: "intent",
        data: intentPayload,
      })
    );
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const simulationSocket = new SimulationSocket();