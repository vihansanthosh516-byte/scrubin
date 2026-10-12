import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { installLocalApi } from "./py/localApi";
import { installErrorReporting } from "./lib/errorReport";
import { py } from "./py/runtime";

// Classic multiple-choice sim calls are answered by the in-browser Python core (no server).
installLocalApi();
installErrorReporting();

// Start loading the in-browser simulators (about 10 MB the first time, then cached): at once on the simulation pages, and in the
// background after the page has settled on the pages people browse before starting one. Skipped on data-saver and very slow links.
{
  const conn = (navigator as any).connection;
  const lean = !!conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ""));
  const path = window.location.pathname;
  const warm = () => void py.init().catch(() => {});
  if (/^\/(simulation|or)/.test(path)) warm();
  else if (!lean && /^\/(procedures|learn)?$/.test(path)) {
    const later = () => ("requestIdleCallback" in window ? (window as any).requestIdleCallback(warm, { timeout: 4000 }) : setTimeout(warm, 2500));
    if (document.readyState === "complete") later();
    else window.addEventListener("load", later, { once: true });
  }
}

createRoot(document.getElementById("root")!).render(<App />);
