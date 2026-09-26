import { useEffect } from "react";
import { useLocation } from "wouter";

// Saved cases now live in the simulation engine; resuming happens from My Simulations.
export default function ResumeSimulation() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("sessionId");
    setLocation(id ? `/simulation?case=${id}` : "/my-simulations");
  }, [setLocation]);
  return null;
}
