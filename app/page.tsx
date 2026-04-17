"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { questions } from "./lib/questions";
import { speak, startListening } from "./lib/voice";

const EvilEye = dynamic(() => import("./components/EvilEye"), { ssr: false });

export default function Home() {
  const [screen, setScreen] = useState<"start" | "quiz" | "result">("start");
  const [name, setName] = useState("");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<{ name: string; score: number }[]>([]);
  const [voiceMode, setVoiceMode] = useState(false);
  const [listening, setListening] = useState(false);
  const progressRef = useRef<HTMLDivElement | null>(null);

  const currentQ = questions[index];
  const progress = ((index + 1) / questions.length) * 100;

  useEffect(() => {
    if (!progressRef.current) return;
    progressRef.current.style.width = `${progress}%`;
  }, [progress]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("scores") || "[]");

    const sorted = stored
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 5);

    setScores(sorted);
  }, []);

  const startQuiz = () => {
    if (!name) return alert("Enter your name");
    setScreen("quiz");
  };

  const handleAnswer = (opt: string) => {
    if (selected) return; // prevent double click
    setSelected(opt);

    if (opt === currentQ.answer) {
      setScore((prev) => prev + 1);
    }

    setTimeout(() => {
      if (index + 1 < questions.length) {
        setIndex(index + 1);
        setSelected(null);
      } else {
        saveScore();
        setScreen("result");
      }
    }, 600);
  };

  const saveScore = () => {
    if (typeof window === "undefined") return;

    const prev = JSON.parse(localStorage.getItem("scores") || "[]");
    const updated = [...prev, { name, score }];
    localStorage.setItem("scores", JSON.stringify(updated));

    const sorted = updated
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 5);
    setScores(sorted);
  };

  const enhanceMysticTone = (text: string) => {
    return `... ${text}`;
  };

  const checkVoiceAnswer = async (transcript: string) => {
    const localMatch = currentQ.options.find((opt) =>
      transcript.includes(opt.toLowerCase())
    );

    if (localMatch) {
      speak("Ah... you have chosen wisely...", () => {
        handleAnswer(localMatch);
      });
      return;
    }

    try {
      const res = await fetch("/api/grok", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript,
          options: currentQ.options,
        }),
      });

      const data = await res.json();

      if (data.answer) {
        const mysticText = enhanceMysticTone(
          data.response || "The spirits acknowledge your answer..."
        );

        speak(mysticText, () => {
          handleAnswer(data.answer);
        });
      } else {
        speak("The spirits are uncertain... try again.", () => {
          setListening(true);
          startListening((t) => {
            setListening(false);
            void checkVoiceAnswer(t);
          });
        });
      }
    } catch {
      speak("A disturbance in the ether... try again.", () => {
        setListening(true);
        startListening((t) => {
          setListening(false);
          void checkVoiceAnswer(t);
        });
      });
    }
  };

  useEffect(() => {
    if (!voiceMode || screen !== "quiz") return;

    const text = `Question ${index + 1}. ${currentQ.question}`;
    speak(text, () => {
      setListening(true);
      startListening((transcript) => {
        setListening(false);
        void checkVoiceAnswer(transcript);
      });
    });
  }, [index, voiceMode, screen]);

  useEffect(() => {
    if (screen !== "quiz" || !voiceMode) {
      setListening(false);
    }
  }, [screen, voiceMode]);

  return (
    <div className="app-shell">
      <div className="evil-eye-bg" aria-hidden="true">
        <EvilEye
          eyeColor="#18023c"
          backgroundColor="#120f17"
          intensity={2}
          pupilSize={0.6}
          irisWidth={0.35}
          glowIntensity={0.25}
          scale={1.5}
          noiseScale={1}
          pupilFollow={1}
          flameSpeed={0.2}
        />
      </div>
      <div className="mystic-overlay" aria-hidden="true" />

      <div className="app-content">
        <div className={`container ${screen === "quiz" ? "quiz-container" : ""}`}>
          {screen === "quiz" && currentQ ? (
            <div key={index} className="quiz-layout fade-slide">
              <div className="quiz-question-card">
                <div>
                  <div className="title-row">
                    <h1 className="title">🔮 Mystic Meme Quiz</h1>
                    <button
                      onClick={() => setVoiceMode((v) => !v)}
                      className="btn voice-toggle"
                    >
                      🎤 {voiceMode ? "Voice ON" : "Voice OFF"}
                    </button>
                  </div>
                  <div className="progress-wrap">
                    <div className="progress-meta">
                      <span>Question {index + 1}</span>
                      <span>
                        {index + 1}/{questions.length}
                      </span>
                    </div>
                    <div className="progress">
                      <div ref={progressRef} className="progress-fill" />
                    </div>
                  </div>
                </div>

                <div className="question-block">
                  <h2 className="question">{currentQ.question}</h2>
                  {voiceMode && listening && (
                    <p className="listening">🎧 Listening...</p>
                  )}
                  <div className="options">
                    {currentQ.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleAnswer(opt)}
                        className={`btn option-btn ${
                          selected === opt ? "option-selected" : ""
                        } ${selected && selected !== opt ? "option-dimmed" : ""}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="quiz-image-card">
                <div className="quiz-image-inner">
                  <Image
                    src={currentQ.image}
                    alt="Meme question"
                    fill
                    unoptimized
                    className="quiz-image"
                    priority
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="title-row">
                <h1 className="title">🔮 Mystic Meme Quiz</h1>
                <button
                  onClick={() => setVoiceMode((v) => !v)}
                  className="btn voice-toggle"
                >
                  🎤 {voiceMode ? "Voice ON" : "Voice OFF"}
                </button>
              </div>

              {/* START */}
              {screen === "start" && (
                <>
                  <p className="subtitle">
                    "Only the chosen ones can decode the memes..."
                  </p>

                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="input"
                  />

                  <button onClick={startQuiz} className="btn">
                    Enter the Arena
                  </button>
                </>
              )}

              {/* RESULT */}
              {screen === "result" && (
                <>
                  <h2 className="score">✨ Your Score: {score}</h2>

                  <div className="leaderboard">
                    <h3>🏆 Leaderboard</h3>
                    {scores.map((s: any, i: number) => (
                      <div key={i} className="row">
                        <span className="row-user">
                          <span className="rank-badge">#{i + 1}</span>
                          <span>{s.name}</span>
                        </span>
                        <span>{s.score}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setIndex(0);
                      setScore(0);
                      setSelected(null);
                      setScreen("start");
                    }}
                    className="btn"
                  >
                    Play Again
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}