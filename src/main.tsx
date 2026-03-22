import React from "react";
import ReactDOM from "react-dom/client";
import { AppProviders } from "./app/providers";
import "./index.css";

async function enableMocking() {
  const useMocks = import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS === "true";
  if (!useMocks) {
    return;
  }

  const { worker } = await import("./mocks/browser");
  await worker.start({
    onUnhandledRequest: "bypass",
  });
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

enableMocking().then(() => {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AppProviders />
    </React.StrictMode>
  );
});
