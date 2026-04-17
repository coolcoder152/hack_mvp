"use client";
import { useState } from "react";
import { questions } from "./lib/questions";

export default function Home() {
  const [screen, setScreen] = useState<"start" | "quiz" | "result">("start");
  const [name, setName] = useState("");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);

  const currentQ = questions[index];

  // Start quiz
  const startQuiz = () => {
    if (!name) return alert("Enter your name");
    setScreen("quiz");
  };

  // Handle answer
  const handleAnswer = (opt: string) => {
    if (opt === currentQ.answer) {
      setScore((prev) => prev + 1);
    }

    if (index + 1 < questions.length) {
      setIndex(index + 1);
    } else {
      saveScore();
      setScreen("result");
    }
  };

  // Save leaderboard
  const saveScore = () => {
    const prev = JSON.parse(localStorage.getItem("scores") || "[]");

    const updated = [...prev, { name, score }];
    localStorage.setItem("scores", JSON.stringify(updated));
  };

  // Load leaderboard
  const scores = JSON.parse(localStorage.getItem("scores") || "[]")
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 5);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f1a",
        color: "#e0e0ff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <h1>🔮 Mystic Meme Quiz</h1>

        {/* START SCREEN */}
        {screen === "start" && (
          <>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              style={{
                padding: 10,
                marginTop: 20,
                width: "100%",
                borderRadius: 8,
                border: "none",
              }}
            />

            <button
              onClick={startQuiz}
              style={buttonStyle}
            >
              Enter the Arena
            </button>
          </>
        )}

        {/* QUIZ SCREEN */}
        {screen === "quiz" && currentQ && (
          <>
            <img
              src={currentQ.image}
              width={300}
              style={{ borderRadius: 10 }}
            />

            <h2 style={{ marginTop: 20 }}>{currentQ.question}</h2>

            {currentQ.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                style={buttonStyle}
              >
                {opt}
              </button>
            ))}
          </>
        )}

        {/* RESULT SCREEN */}
        {screen === "result" && (
          <>
            <h2>✨ Your Score: {score}</h2>

            <h3>🏆 Leaderboard</h3>

            {scores.map((s: any, i: number) => (
              <p key={i}>
                {s.name} — {s.score}
              </p>
            ))}

            <button
              onClick={() => {
                setIndex(0);
                setScore(0);
                setScreen("start");
              }}
              style={buttonStyle}
            >
              Play Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const buttonStyle = {
  display: "block",
  width: "100%",
  padding: 12,
  marginTop: 10,
  borderRadius: 10,
  border: "none",
  background: "#1f1f3a",
  color: "white",
  cursor: "pointer",
};