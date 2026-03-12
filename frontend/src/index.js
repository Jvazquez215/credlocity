import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

// Suppress ResizeObserver loop error (harmless, caused by Radix UI components)
// This is a known issue with ResizeObserver and is not a real error
if (typeof window !== 'undefined') {
  // Override ResizeObserver to suppress the error
  const OriginalResizeObserver = window.ResizeObserver;
  window.ResizeObserver = class ResizeObserver extends OriginalResizeObserver {
    constructor(callback) {
      super((entries, observer) => {
        // Use requestAnimationFrame to prevent loop errors
        window.requestAnimationFrame(() => {
          callback(entries, observer);
        });
      });
    }
  };

  // Also suppress the error in the error handler
  const originalError = console.error;
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('ResizeObserver')) {
      return;
    }
    originalError.apply(console, args);
  };

  // Suppress in window error event
  window.addEventListener('error', (e) => {
    if (e.message && e.message.includes('ResizeObserver')) {
      e.stopImmediatePropagation();
      e.preventDefault();
      return false;
    }
  }, true);
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
