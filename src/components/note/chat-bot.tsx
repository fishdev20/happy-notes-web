import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import useNoteStore from "@/store/use-note-store";
import { Bot, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { TypingIndicator } from "../typing-indicator";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export default function Chatbot() {
  const { markdownContent, setMarkdownContent } = useNoteStore();
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [userInput, setUserInput] = useState<string>("");
  const [isFirstTime, setIsFirstTime] = useState<boolean>(true);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Show introductory message if it's the first time the user opens the chatbot
  useEffect(() => {
    if (isFirstTime) {
      setMessages([
        {
          sender: "chatbot",
          text: "Hello! I'm your chatbot. I can generate markdown for you!",
        },
        {
          sender: "chatbot",
          text: "Here are some commands you can try:\n- `/header`: Generate a header\n- `/help`: List all commands\n- `/bold`: Add bold text\n- `/italic`: Add italic text",
        },
      ]);
      setIsFirstTime(false);
    }
  }, [isFirstTime]);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  console.log(messagesEndRef);

  // Function to simulate typing effect
  const simulateTyping = (text: string, callback: () => void) => {
    console.log(text);
    let index = 0;
    console.log(text[index]);
    const interval = setInterval(() => {
      setMarkdownContent(markdownContent.concat(text[index]));
      console.log(markdownContent);
      index++;
      if (index === text.length) {
        clearInterval(interval);
        callback();
      }
    }, 100); // Adjust typing speed (100ms per character)
  };

  const handleSendMessage = () => {
    if (userInput.trim() === "") return;
    let newMessages = [...messages];

    newMessages.push({
      sender: "user",
      text: userInput,
    });

    setIsTyping(true);
    setMessages([...newMessages, { sender: "chatbot", text: "..." }]);

    setTimeout(() => {
      let markdownResponse = "";
      let shouldInsertToMarkdown = false;
      if (userInput.startsWith("/")) {
        const command = userInput.toLowerCase().trim();

        switch (command) {
          case "/header1":
            markdownResponse = `# Heading1`;
            shouldInsertToMarkdown = true;
            break;
          case "/header2":
            markdownResponse = `# Heading2`;
            shouldInsertToMarkdown = true;
            break;
          case "/header3":
            markdownResponse = `# Heading3`;
            shouldInsertToMarkdown = true;
            break;

          case "/bold":
            markdownResponse = `**This is bold text**\nUse \`**text**\` to make text bold.`;
            shouldInsertToMarkdown = true;
            break;

          case "/italic":
            markdownResponse = `*This is italic text*\nUse \`*text*\` to italicize.`;
            shouldInsertToMarkdown = true;
            break;

          case "/blockquote":
            markdownResponse = `> This is a blockquote.\nUse \`>\` to create a blockquote.`;
            shouldInsertToMarkdown = true;
            break;

          case "/list":
            markdownResponse = `- Item 1\n- Item 2\n- Item 3\nUse \`-\` for bullet lists.`;
            shouldInsertToMarkdown = true;
            break;

          case "/orderedlist":
            markdownResponse = `1. First item\n2. Second item\n3. Third item\nUse numbers for ordered lists.`;
            shouldInsertToMarkdown = true;
            break;

          case "/code":
            markdownResponse = `\`\`\`js\nconsole.log("Hello, world!");\n\`\`\`\nUse triple backticks for code blocks.`;
            shouldInsertToMarkdown = true;
            break;

          case "/inlinecode":
            markdownResponse = `Use \`const name = "Chatbot"\` for inline code.`;
            shouldInsertToMarkdown = true;
            break;

          case "/link":
            markdownResponse = `[OpenAI](https://www.openai.com)\nUse \`[text](url)\` to create a link.`;
            shouldInsertToMarkdown = true;
            break;

          case "/image":
            markdownResponse = `![Alt text](https://via.placeholder.com/150)\nUse \`![alt](url)\` for images.`;
            shouldInsertToMarkdown = true;
            break;

          case "/horizontal":
            markdownResponse = `---\nUse \`---\` for a horizontal rule.`;
            shouldInsertToMarkdown = true;
            break;

          case "/table":
            markdownResponse = `| Syntax | Description |\n| ----------- | ----------- |\n| Header | Title |\n| Paragraph | Text |\nUse pipes and hyphens to create tables.`;
            shouldInsertToMarkdown = true;
            break;

          case "/task":
            markdownResponse = `- [x] Completed task\n- [ ] Incomplete task\nUse \`- [ ]\` for task lists.`;
            shouldInsertToMarkdown = true;
            break;

          case "/help":
            markdownResponse = [
              "**Available Markdown Commands:**",
              "- `/header1` – Add H1 headers",
              "- `/header2` – Add H2 headers",
              "- `/header3` – Add H3 headers",
              "- `/bold` – Bold text",
              "- `/italic` – Italic text",
              "- `/blockquote` – Add a quote block",
              "- `/list` – Bullet list",
              "- `/orderedlist` – Numbered list",
              "- `/code` – Code block",
              "- `/inlinecode` – Inline code",
              "- `/link` – Add hyperlink",
              "- `/image` – Embed image",
              "- `/horizontal` – Horizontal line",
              "- `/table` – Markdown table",
              "- `/task` – Task checklist",
              "- `/help` – Show this help",
            ].join("\n");
            break;

          default:
            markdownResponse = `❌ Command not recognized: \`${command}\`. Type \`/help\` for a list of available commands.`;
            break;
        }
      } else {
        markdownResponse = `Sorry, I don't recognize the command "${userInput}". Try typing /help for a list of commands.`;
      }

      // const updatedMessages = [...newMessages, { sender: "chatbot", text: markdownResponse }];
      // setMessages(updatedMessages);

      newMessages.push({
        sender: "chatbot",
        text: markdownResponse,
      });

      setMessages(newMessages);
      setUserInput("");
      setIsTyping(false);
      if (shouldInsertToMarkdown) {
        setMarkdownContent(markdownContent.concat(markdownResponse));
      }
    }, 1500);
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
            <Bot className="w-8 h-8" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="sm:max-w-[500px] w-full h-[600px] flex flex-col" align="end">
          <div className="border-b">
            <div className=" flex gap-2 text-lg font-medium text-center p-2">
              <Avatar className="w-8 h-8 border">
                <AvatarImage src="/placeholder-user.jpg" alt="Chatbot" />
                <AvatarFallback>
                  <Bot />
                </AvatarFallback>
              </Avatar>
              Happy bot
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4" ref={messagesEndRef}>
            <div className="grid gap-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${message.sender === "user" ? "justify-end" : ""}`}
                >
                  {message.sender === "chatbot" && (
                    <Avatar className="w-8 h-8 border">
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
                    } rounded-lg p-3 max-w-[80%]`}
                  >
                    {message.text === "..." ? <TypingIndicator /> : <p>{message.text}</p>}
                  </div>
                  {message.sender === "user" && (
                    <Avatar className="w-8 h-8 border">
                      <AvatarImage src="/placeholder-user.jpg" alt="User" />
                      <AvatarFallback>
                        <User />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
            <div ref={messagesEndRef} />
          </div>
          <div className="border-t p-2">
            <div className="relative">
              <Textarea
                placeholder="Type your message..."
                name="message"
                id="message"
                rows={1}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="min-h-[48px] rounded-2xl resize-none p-4 border border-neutral-400 shadow-sm pr-16"
              />
              <Button
                type="button"
                size="icon"
                className="absolute w-8 h-8 top-3 right-3"
                onClick={handleSendMessage}
                disabled={isTyping}
              >
                <Send className="w-4 h-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
