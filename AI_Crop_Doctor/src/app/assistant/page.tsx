"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Volume2 } from "lucide-react";
import coachAvatar from "@/assets/coach-avatar.png";
import { AppShell, AppHeader } from "@/components/app-shell";
import { MicButton } from "@/components/crop-ui";
import { askCropCoach } from "@/services/crop-api";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  from: "coach" | "farmer";
  text: string;
}

const SUGGESTIONS = [
  "Is my tomato leaf healthy?",
  "When should I harvest?",
  "What should I do for Early Blight?",
  "Which crop is suitable this month?",
  "How long does tomato take to grow?",
  "What should I do after disease detection?",
];

function parseBoldText(text: string) {
  const regex = /\*\*(.*?)\*\*/g;
  const elements = [];
  let lastIndex = 0;
  let match;
  let keyCount = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.slice(lastIndex, match.index));
    }
    elements.push(
      <strong key={keyCount++} className="font-bold">
        {match[1]}
      </strong>,
    );
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }
  return elements.length > 0 ? elements : text;
}

function renderRich(text: string) {
  return text.split("\n").map((line, i) => {
    if (!line.trim()) return <span key={i} className="block h-2" />;
    const bullet = line.trim().startsWith("- ");
    const cleanLine = bullet ? line.trim().slice(2) : line;
    return (
      <span key={i} className={cn("block", bullet && "pl-3 before:mr-1.5 before:content-['•']")}>
        {parseBoldText(cleanLine)}
      </span>
    );
  });
}

function ChatBubble({
  message,
  onSpeak,
}: {
  message: ChatMessage;
  onSpeak: (text: string) => void;
}) {
  const coach = message.from === "coach";
  return (
    <div className={cn("flex gap-2", coach ? "justify-start" : "justify-end")}>
      {coach ? (
        <img
          src={typeof coachAvatar === "string" ? coachAvatar : coachAvatar.src}
          alt=""
          width={768}
          height={768}
          loading="lazy"
          className="size-9 shrink-0 self-end"
        />
      ) : null}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-soft",
          coach ? "rounded-bl-md bg-card" : "rounded-br-md bg-primary text-primary-foreground",
        )}
      >
        {renderRich(message.text)}
        {coach ? (
          <button
            type="button"
            onClick={() => onSpeak(message.text)}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            <Volume2 className="size-4" aria-hidden /> Listen
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function AssistantScreen() {
  const t = useT();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", from: "coach", text: t("assistant.welcome") },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  // Clean up Web Speech API synthesis & recognition on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        if (recognitionRef.current) recognitionRef.current.stop();
      }
    };
  }, []);

  const send = async (text: string) => {
    const value = text.trim();
    if (!value || thinking) return;
    setInput("");
    setMessages((m) => [...m, { id: `f-${Date.now()}`, from: "farmer", text: value }]);
    setThinking(true);
    const answer = await askCropCoach(value);
    setMessages((m) => [...m, { id: `c-${Date.now()}`, from: "coach", text: answer }]);
    setThinking(false);
  };

  // Browser-native Text-To-Speech (TTS) for Coach messages
  const speakMessage = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    // Stop whitefly warnings or blight reading first
    window.speechSynthesis.cancel();

    // Remove markdown formatting characters for cleaner narration
    const cleanText = text.replace(/\*\*/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  // Browser-native Speech-To-Text (STT) Speech Recognition
  const toggleSpeechRecognition = () => {
    if (typeof window === "undefined") return;

    const win = window as unknown as Record<string, unknown>;
    const SpeechRecognition =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (win["SpeechRecognition"] as any) || (win["webkitSpeechRecognition"] as any);
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported on this browser. Try Chrome or Safari.");
      return;
    }

    if (listening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setListening(false);
      return;
    }

    setListening(true);
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (event: any) => {
      const resultText = event.results[0][0].transcript;
      if (resultText) {
        setInput(resultText);
        send(resultText);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onerror = (e: any) => {
      console.error("Speech recognition error:", e);
      setListening(false);
    };

    rec.onend = () => {
      setListening(false);
    };

    recognitionRef.current = rec;
    rec.start();
  };

  return (
    <AppShell>
      <AppHeader
        title={t("assistant.name")}
        subtitle="Answers from your crop database"
        backTo="/home"
      />

      <div className="flex-1 space-y-3 px-5 py-5 pb-36">
        {messages.map((m) => (
          <ChatBubble key={m.id} message={m} onSpeak={speakMessage} />
        ))}
        {thinking ? (
          <div
            className="flex items-center gap-2 pl-11 text-xs text-muted-foreground"
            aria-live="polite"
          >
            <span className="size-2 animate-bounce rounded-full bg-primary" />
            Crop Coach is checking the crop database…
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      <div className="fixed bottom-20 left-0 right-0 z-30 mx-auto max-w-screen-sm bg-background/80 backdrop-blur-md space-y-3 px-5 py-3 border-t border-border/40">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => void send(s)}
              className="min-h-11 shrink-0 rounded-full border border-border bg-card px-4 text-xs font-medium shadow-soft"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={listening ? "Listening to your voice..." : t("assistant.placeholder")}
            aria-label={t("assistant.placeholder")}
            className={cn(
              "min-h-13 flex-1 rounded-2xl border border-input bg-card px-4 text-sm shadow-soft outline-none focus:border-primary transition-all",
              listening &&
                "border-primary ring-2 ring-primary/20 bg-primary-soft/10 placeholder:text-primary/70",
            )}
          />
          <MicButton active={listening} onClick={toggleSpeechRecognition} />
          <button
            type="submit"
            aria-label="Send question"
            disabled={thinking}
            className="flex size-13 items-center justify-center rounded-2xl bg-primary text-primary-foreground disabled:opacity-50"
          >
            <Send className="size-5" aria-hidden />
          </button>
        </form>
        {listening ? (
          <p
            className="text-center text-xs text-primary animate-pulse font-medium"
            aria-live="polite"
          >
            🎙️ Dictating your question... speak now!
          </p>
        ) : null}
      </div>
    </AppShell>
  );
}
