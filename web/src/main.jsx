import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// App.jsx was written against an async key-value store exposed as
// window.storage. In a normal browser, back that interface with localStorage.
if (!window.storage) {
  window.storage = {
    async get(key) {
      const value = localStorage.getItem(key);
      return value === null ? null : { key, value };
    },
    async set(key, value) {
      localStorage.setItem(key, value);
      return { key, value };
    },
  };
}

createRoot(document.getElementById("root")).render(<App />);
