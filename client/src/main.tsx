import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { installLocalApi } from "./py/localApi";
import { py } from "./py/runtime";

// Classic multiple-choice sim calls are answered by the in-browser Python core (no server).
installLocalApi();

// Start loading the in-browser simulators early on the pages that need them (about 15 MB the first time, then cached).
if (/^\/(procedures|simulation|or)/.test(window.location.pathname)) void py.init().catch(() => {});

createRoot(document.getElementById("root")!).render(<App />);
