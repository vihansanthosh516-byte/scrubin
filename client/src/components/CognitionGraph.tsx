import React, { useMemo } from "react";
import ReactFlow, { Background, Controls, MiniMap, useEdgesState, useNodesState } from "reactflow";
import "reactflow/dist/style.css";
import { useSimulationStore } from "../state/simulationStore";

// Simple linear chain graph visualisation of cognition data.
// Nodes are colour‑coded by type (see spec). Edges connect chronologically.

const typeStyles: Record<string, { background: string; color: string }> = {
  fact: { background: "#60a5fa", color: "#fff" }, // blue
  belief: { background: "#a78bfa", color: "#fff" }, // purple
  reflection: { background: "#fb923c", color: "#fff" }, // orange
  executiveGoal: { background: "#22c55e", color: "#fff" }, // green
  strategy: { background: "#2dd4bf", color: "#fff" }, // teal
  policyDecision: { background: "#ef4444", color: "#fff" }, // red
  prediction: { background: "#fbbf24", color: "#fff" }, // yellow
  // Additional cognition layers
  episode: { background: "#10b981", color: "#fff" }, // emerald
  factGraph: { background: "#3b82f6", color: "#fff" }, // blue-ish
  beliefStore: { background: "#8b5cf6", color: "#fff" }, // indigo
  reflectionLog: { background: "#f97316", color: "#fff" }, // orange
  executivePlanning: { background: "#34d399", color: "#000" }, // light green
  predictiveWorldModel: { background: "#6366f1", color: "#fff" }, // violet
};

export default function CognitionGraph() {
  const { cognition } = useSimulationStore();

  // Build nodes and edges in a linear fashion.
  const { nodes, edges } = useMemo(() => {
    const nodes: any[] = [];
    const edges: any[] = [];
    let lastNodeId: string | null = null;
    let idCounter = 0;
    const nextId = () => `${idCounter++}`;

    const addNode = (type: string, label: string, data: any) => {
      const nid = nextId();
      nodes.push({
        id: nid,
        data: { label, ...data },
        position: { x: 0, y: 0 },
        style: typeStyles[type] || { background: "#6b7280", color: "#fff" },
        type: "default",
      });
      if (lastNodeId) {
        edges.push({ id: `e${lastNodeId}-${nid}`, source: lastNodeId, target: nid, animated: false, style: { stroke: "#9ca3af" } });
      }
      lastNodeId = nid;
    };

    // Facts (recentFacts)
    (cognition.recentFacts || []).forEach((f: any) => {
      addNode("fact", "Fact", { payload: f });
    });
    // Beliefs (recentBeliefs)
    (cognition.recentBeliefs || []).forEach((b: any) => {
      addNode("belief", "Belief", { payload: b });
    });
    // Reflections (recentReflections)
    (cognition.recentReflections || []).forEach((r: any) => {
      addNode("reflection", "Reflection", { payload: r });
    });
    // Executive Goal
    if (cognition.executiveGoal) {
      addNode("executiveGoal", `Goal: ${cognition.executiveGoal}`, {});
    }
    // Strategy
    if (cognition.strategy) {
      addNode("strategy", `Strategy: ${cognition.strategy}`, {});
    }
    // Policy Decision
    if (cognition.policyDecision) {
      addNode("policyDecision", `Policy: ${cognition.policyDecision}`, {});
    }
    // Prediction
    if (cognition.predictionHorizon !== undefined) {
      addNode("prediction", `Prediction Horizon: ${cognition.predictionHorizon}`, {});
    }

    // Additional cognition layers
    // Episodes
    (cognition.episodes || []).forEach((e: any) => {
      addNode("episode", "Episode", { payload: e });
    });
    // Fact Graph
    (cognition.factGraph || []).forEach((fg: any) => {
      addNode("factGraph", "Fact Graph", { payload: fg });
    });
    // Belief Store
    (cognition.beliefStore || []).forEach((bs: any) => {
      addNode("beliefStore", "Belief Store", { payload: bs });
    });
    // Reflection Log
    (cognition.reflectionLog || []).forEach((rl: any) => {
      addNode("reflectionLog", "Reflection Log", { payload: rl });
    });
    // Executive Planning
    (cognition.executivePlanning || []).forEach((ep: any) => {
      addNode("executivePlanning", "Executive Planning", { payload: ep });
    });
    // Predictive World Model
    (cognition.predictiveWorldModel || []).forEach((pwm: any) => {
      addNode("predictiveWorldModel", "Predictive World Model", { payload: pwm });
    });

    return { nodes, edges };
  }, [cognition]);

  const [nodeState] = useNodesState(nodes);
  const [edgeState] = useEdgesState(edges);

  // Simple onClick – does not mutate state.
  const onNodeClick = (_event: React.MouseEvent, node: any) => {
    console.log("Cognition node clicked:", node);
    // could display a lightweight tooltip or modal – keeping UI‑only.
  };

  return (
    <div style={{ width: "100%", height: 400 }} className="bg-[#1E1A16] rounded-sm border border-[#3A342C]">
      <ReactFlow
        nodes={nodeState}
        edges={edgeState}
        onNodeClick={onNodeClick}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnScroll={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        fitView
      >
        <MiniMap nodeColor={(n) => (n.style?.background as string) || "#9ca3af"} />
        <Controls showZoom={true} showFitView={true} />
        <Background color="#1f2937" gap={16} />
      </ReactFlow>
    </div>
  );
}
