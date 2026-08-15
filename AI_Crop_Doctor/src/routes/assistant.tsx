import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Volume2 } from "lucide-react";
import coachAvatar from "@/assets/coach-avatar.png";
import { AppShell, AppHeader } from "@/components/app-shell";
import { MicButton } from "@/components/crop-ui";
import { askCropCoach } from "@/services/crop-api";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Crop Doctor" },
      {
        name: "description",
        content:
          "Crop Coach answers tomato questions on watering, growth duration, harvesting and disease treatment using the app's crop knowledge base.",
      },
      { property: "og:title", content: "AI Crop Doctor" },
      {
        property: "og:description",
        content: "A friendly agricultural AI coach grounded in the app's crop database.",
      },
    ],
  }),
  component: AssistantScreen,
});

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
      </strong>
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
      <span
        key={i}
        className={cn(
          "block",
          bullet && "pl-3 before:mr-1.5 before:content-['•']",
        )}
      >
        {parseBoldText(cleanLine)}
      </span>
    );
  });
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const coach = message.from === "coach";
  return (
    <div className={cn("flex gap-2", coach ? "justify-start" : "justify-end")}>
      {coach ? (
        <img
          src={coachAvatar}
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
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary"
          >
            <Volume2 className="size-4" aria-hidden /> Listen
          </button>
        ) : null}
      </div>
    </div>
  );
}

function AssistantScreen() {
  const t = useT();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", from: "coach", text: t("assistant.welcome") },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

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

  return (
    <AppShell>
      <AppHeader
        title={t("assistant.name")}
        subtitle="Answers from your crop database"
        backTo="/home"
      />

      <div className="flex-1 space-y-3 px-5 py-5">
        {messages.map((m) => (
          <ChatBubble key={m.id} message={m} />
        ))}
        {thinking ? (
          <div className="flex items-center gap-2 pl-11 text-xs text-muted-foreground" aria-live="polite">
            <span className="size-2 animate-bounce rounded-full bg-primary" />
            Crop Coach is checking the crop database…
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      <div className="sticky bottom-24 space-y-3 px-5">
        <div className="flex gap-2 overflow-x-auto pb-1">
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
            placeholder={t("assistant.placeholder")}
            aria-label={t("assistant.placeholder")}
            className="min-h-13 flex-1 rounded-2xl border border-input bg-card px-4 text-sm shadow-soft outline-none focus:border-primary"
          />
          <MicButton active={listening} onClick={() => setListening((v) => !v)} />
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
          <p className="text-center text-xs text-muted-foreground" aria-live="polite">
            Voice input is prepared in this build; speech-to-text connects with the backend update.
          </p>
        ) : null}
      </div>
    </AppShell>
  );
}
