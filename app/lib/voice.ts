export function speak(text: string, onEnd?: () => void) {
  if (typeof window === "undefined") return;

  const formatText = (value: string) => {
    return value
      .replace(/\./g, "... ")
      .replace(/,/g, ", ")
      .replace(/!/g, "... ");
  };

  if (speechSynthesis.getVoices().length === 0) {
    speechSynthesis.onvoiceschanged = () => {
      speechSynthesis.onvoiceschanged = null;
      speak(text, onEnd);
    };
    return;
  }

  const utterance = new SpeechSynthesisUtterance();
  utterance.text = formatText(text);
  utterance.rate = 0.85;
  utterance.pitch = 1.15;
  utterance.volume = 1;

  const voices = speechSynthesis.getVoices();
  const preferred =
    voices.find((v) => v.name.includes("Google UK English Female")) ||
    voices.find((v) => v.name.includes("Google UK English Male")) ||
    voices.find((v) => v.name.includes("Microsoft Zira")) ||
    voices.find((v) => v.name.includes("Female")) ||
    voices[0];

  if (preferred) utterance.voice = preferred;

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

export function startListening(onResult: (text: string) => void) {
  if (typeof window === "undefined") return;

  const SpeechRecognition =
    (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech recognition not supported in this browser");
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.lang = "en-US";
  recognition.interimResults = false;

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript.toLowerCase();
    onResult(transcript);
  };

  recognition.start();
}
