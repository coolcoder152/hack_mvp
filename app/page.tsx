"use client";

import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateSteps = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setError("");
    setOutput("");

    try {
      const res = await fetch("/api/task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task: input }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setOutput(data.result);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif", maxWidth: 700 }}>
      <h1>AI Task Decomposer</h1>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter a big task..."
        style={{
          width: "100%",
          padding: 10,
          marginTop: 10,
          marginBottom: 10,
        }}
      />

      <button onClick={generateSteps} disabled={loading}>
        {loading ? "Generating..." : "Generate"}
      </button>

      {error && (
        <p style={{ color: "red", marginTop: 20 }}>{error}</p>
      )}

      <div
        style={{
          marginTop: 20,
          whiteSpace: "pre-wrap",
          lineHeight: 1.6,
        }}
      >
        {output}
      </div>
    </div>
  );
}