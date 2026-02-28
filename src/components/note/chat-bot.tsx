"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import useAiSettingsStore from "@/store/use-ai-settings-store";
import useNoteStore from "@/store/use-note-store";
import { Bot, Eraser, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { TypingIndicator } from "../typing-indicator";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type ChatMessage = {
  sender: "chatbot" | "user";
  text: string;
};

type CommandResult = {
  response: string;
  markdownToInsert?: string;
  markdownMode?: "append" | "replace";
};

const quickCommands = [
  "/help",
  "/template sprint planning",
  "/template weekly review",
  "/template 1:1 meeting notes",
];

const commandDocs = [
  { command: "/help", description: "Show available commands." },
  {
    command: "/template <description>",
    description: "Generate a markdown template with real AI and insert it.",
  },
  {
    command: "<description>",
    description: "Send plain text to generate a template directly (no slash needed).",
  },
  { command: "/continue", description: "Generate a continuation paragraph for current note." },
  { command: "/shorten", description: "Rewrite note to a shorter version." },
  { command: "/replace <find> => <replace>", description: "Replace text in note content." },
  { command: "/clear", description: "Clear chatbot conversation." },
];

const introMessage: ChatMessage = {
  sender: "chatbot",
  text: "I generate markdown note templates with AI. Describe what you need or use /template ...",
};

const fallbackText = "No note content yet. Start writing and I can help transform it.";

const toWords = (value: string) => value.trim().split(/\s+/).filter(Boolean);

const toSentences = (value: string) =>
  (value.match(/[^.!?]+[.!?]*/g) ?? []).map((line) => line.trim()).filter(Boolean);

const toLines = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const deriveTags = (content: string) => {
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "for",
    "nor",
    "on",
    "in",
    "with",
    "to",
    "of",
    "is",
    "are",
    "be",
    "this",
    "that",
    "it",
    "as",
    "by",
    "at",
    "from",
  ]);

  const counts = new Map<string, number>();
  for (const token of content.toLowerCase().match(/[a-z0-9-]+/g) ?? []) {
    if (token.length < 4 || stopWords.has(token)) {
      continue;
    }
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
};

const deriveTitle = (content: string) => {
  const heading = content
    .split("\n")
    .find((line) => line.trim().startsWith("#"))
    ?.replace(/^#+\s*/, "")
    .trim();

  if (heading) {
    return heading;
  }

  const firstSentence = toSentences(content)[0];
  if (!firstSentence) {
    return "Untitled note";
  }

  const words = toWords(firstSentence).slice(0, 8);
  return words.join(" ").replace(/[^\w)\]]$/, "");
};

const summarize = (content: string) => {
  const lines = toLines(content);
  if (!lines.length) {
    return fallbackText;
  }

  const keyPoints = lines.slice(0, 5).map((line) => `- ${line}`);
  return ["Summary:", ...keyPoints].join("\n");
};

const createTodo = (content: string, count: number) => {
  const lines = toLines(content);
  if (!lines.length) {
    return ["- [ ] First task", "- [ ] Second task"];
  }
  return lines
    .slice(0, count)
    .map((line) => line.replace(/^[-*]\s+/, ""))
    .map((line) => `- [ ] ${line}`);
};

const continueParagraph = (content: string) => {
  const lastSentence = toSentences(content).slice(-1)[0];
  if (!lastSentence) {
    return "I am just getting started, and I want to build momentum with one clear next action.";
  }
  return `Building on that, the next practical step is to turn "${lastSentence.replace(/"/g, "'")}" into a concrete action with a deadline and owner.`;
};

const shortenContent = (content: string) => {
  const sentences = toSentences(content);
  if (!sentences.length) {
    return fallbackText;
  }

  const keepCount = Math.max(1, Math.ceil(sentences.length / 3));
  return sentences.slice(0, keepCount).join(" ");
};

const parseReplace = (args: string) => {
  const parts = args.split("=>").map((part) => part.trim());
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return null;
  }
  return { findValue: parts[0], replaceValue: parts[1] };
};

const generateTemplateWithAI = async (
  description: string,
  markdownContent: string,
  aiSettings: {
    provider: "auto" | "ollama" | "openai";
    ollamaBaseUrl: string;
    ollamaModel: string;
    openAiApiKey: string;
  },
): Promise<CommandResult> => {
  const context = markdownContent.trim();
  const trimmedContext = context.slice(0, 900);
  const enrichedRequest = context
    ? `${description}\n\nCurrent note context:\n${trimmedContext}`
    : description;

  const response = await fetch("/api/ai/template", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userRequest: enrichedRequest,
      provider: aiSettings.provider,
      ollamaBaseUrl: aiSettings.ollamaBaseUrl,
      ollamaModel: aiSettings.ollamaModel,
      openAiApiKey: aiSettings.openAiApiKey,
    }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      details?: string;
      hint?: string;
    };
    return {
      response: payload.error
        ? [
            `AI error: ${payload.error}`,
            payload.details ? `Details: ${payload.details}` : "",
            payload.hint ? `Hint: ${payload.hint}` : "",
          ]
            .filter(Boolean)
            .join("\n")
        : "AI request failed. Check your provider settings in /settings.",
    };
  }

  const payload = (await response.json()) as { markdown?: string; model?: string };
  if (!payload.markdown) {
    return { response: "AI returned an empty response." };
  }

  return {
    response: payload.markdown,
    markdownToInsert: payload.markdown,
    markdownMode: "replace",
  };
};

const executeCommand = async (
  input: string,
  markdownContent: string,
  aiSettings: {
    provider: "auto" | "ollama" | "openai";
    ollamaBaseUrl: string;
    ollamaModel: string;
    openAiApiKey: string;
  },
): Promise<CommandResult> => {
  const [command, ...restArgs] = input.trim().split(/\s+/);
  const args = restArgs.join(" ").trim();
  const normalized = command.toLowerCase();

  if (normalized === "/help") {
    return {
      response: [
        "Available commands:",
        ...commandDocs.map((item) => `- ${item.command}: ${item.description}`),
      ].join("\n"),
    };
  }

  if (normalized === "/clear") {
    return { response: "Conversation cleared." };
  }

  if (normalized === "/summarize") {
    const summary = summarize(markdownContent);
    return { response: summary, markdownToInsert: summary, markdownMode: "append" };
  }

  if (normalized === "/title") {
    const title = deriveTitle(markdownContent);
    return { response: `Suggested title: ${title}` };
  }

  if (normalized === "/tags") {
    const tags = deriveTags(markdownContent);
    return {
      response: tags.length
        ? `Suggested tags: ${tags.map((tag) => `#${tag}`).join(" ")}`
        : fallbackText,
    };
  }

  if (normalized === "/todo") {
    const parsed = Number(args);
    const count = Number.isFinite(parsed) && parsed > 0 ? Math.min(12, Math.floor(parsed)) : 5;
    const todo = createTodo(markdownContent, count).join("\n");
    return { response: todo, markdownToInsert: todo, markdownMode: "append" };
  }

  if (normalized === "/template") {
    if (!args) {
      return { response: "Usage: /template <description>" };
    }
    return await generateTemplateWithAI(args, markdownContent, aiSettings);
  }

  if (normalized === "/continue") {
    const paragraph = continueParagraph(markdownContent);
    return { response: paragraph, markdownToInsert: paragraph, markdownMode: "append" };
  }

  if (normalized === "/shorten") {
    const shortened = shortenContent(markdownContent);
    return {
      response: "Created a shorter version of your note.",
      markdownToInsert: shortened,
      markdownMode: "replace",
    };
  }

  if (normalized === "/replace") {
    const parsed = parseReplace(args);
    if (!parsed) {
      return { response: "Usage: /replace <find> => <replace>" };
    }
    const nextValue = markdownContent.split(parsed.findValue).join(parsed.replaceValue);
    if (nextValue === markdownContent) {
      return { response: `No matches found for "${parsed.findValue}".` };
    }
    return {
      response: `Replaced "${parsed.findValue}" with "${parsed.replaceValue}".`,
      markdownToInsert: nextValue,
      markdownMode: "replace",
    };
  }

  if (normalized.startsWith("/")) {
    return { response: `Unknown command: ${input}. Type /help.` };
  }

  return await generateTemplateWithAI(input, markdownContent, aiSettings);
};

export default function Chatbot() {
  const { markdownContent, setMarkdownContent } = useNoteStore();
  const provider = useAiSettingsStore((state) => state.provider);
  const ollamaBaseUrl = useAiSettingsStore((state) => state.ollamaBaseUrl);
  const ollamaModel = useAiSettingsStore((state) => state.ollamaModel);
  const getOpenAiApiKey = useAiSettingsStore((state) => state.getOpenAiApiKey);
  const [messages, setMessages] = useState<ChatMessage[]>([introMessage]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = (nextInput?: string) => {
    const trimmed = (nextInput ?? userInput).trim();
    if (!trimmed || isTyping) {
      return;
    }

    if (trimmed.toLowerCase() === "/clear") {
      setMessages([introMessage]);
      setUserInput("");
      return;
    }

    setMessages((previous) => [...previous, { sender: "user", text: trimmed }]);
    setUserInput("");
    setIsTyping(true);

    window.setTimeout(async () => {
      const result = await executeCommand(trimmed, markdownContent, {
        provider,
        ollamaBaseUrl,
        ollamaModel,
        openAiApiKey: getOpenAiApiKey(),
      });
      setMessages((previous) => [...previous, { sender: "chatbot", text: result.response }]);

      if (result.markdownToInsert) {
        if (result.markdownMode === "replace") {
          setMarkdownContent(result.markdownToInsert);
        } else {
          setMarkdownContent((currentValue) => `${currentValue}\n\n${result.markdownToInsert}`);
        }
      }

      setIsTyping(false);
    }, 350);
  };

  return (
    <div className="fixed bottom-6 right-6">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-primary text-primary-foreground"
          >
            <Bot className="h-8 w-8" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex h-[600px] w-full flex-col sm:max-w-[500px]" align="end">
          <div className="border-b">
            <div className="flex items-center gap-2 p-2 text-center text-lg font-medium">
              <Avatar className="h-8 w-8 border">
                <AvatarImage src="/placeholder-user.jpg" alt="Chatbot" />
                <AvatarFallback>
                  <Bot />
                </AvatarFallback>
              </Avatar>
              Happy Bot
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto"
                onClick={() => setMessages([introMessage])}
                aria-label="Clear chat"
              >
                <Eraser className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4" ref={messagesContainerRef}>
            <div className="grid gap-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.sender}-${index}-${message.text}`}
                  className={`flex items-start gap-3 ${message.sender === "user" ? "justify-end" : ""}`}
                >
                  {message.sender === "chatbot" && (
                    <Avatar className="h-8 w-8 border">
                      <AvatarImage src="/placeholder-user.jpg" alt="Chatbot" />
                      <AvatarFallback>
                        <Bot />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`${
                      message.sender === "chatbot"
                        ? "bg-muted"
                        : "bg-primary text-primary-foreground"
                    } max-w-[80%] rounded-lg p-3 whitespace-pre-wrap`}
                  >
                    <p>{message.text}</p>
                  </div>
                  {message.sender === "user" && (
                    <Avatar className="h-8 w-8 border">
                      <AvatarImage src="/placeholder-user.jpg" alt="User" />
                      <AvatarFallback>
                        <User />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isTyping && <TypingIndicator />}
            </div>
          </div>
          <div className="space-y-2 border-t p-2">
            <div className="flex flex-wrap gap-2">
              {quickCommands.map((command) => (
                <Button
                  key={command}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendMessage(command)}
                >
                  {command}
                </Button>
              ))}
            </div>
            <div className="relative">
              <Textarea
                placeholder="Describe the template you want..."
                name="message"
                id="message"
                rows={1}
                value={userInput}
                onChange={(event) => setUserInput(event.target.value)}
                className="min-h-[48px] resize-none rounded-2xl border border-neutral-400 p-4 pr-16 shadow-sm"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                type="button"
                size="icon"
                className="absolute top-3 right-3 h-8 w-8"
                onClick={() => handleSendMessage()}
                disabled={isTyping}
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
