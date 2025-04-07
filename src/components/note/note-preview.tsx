import { getLanguageExtension } from "@/lib/utils";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

const NotePreview = ({ markdownContent }: { markdownContent: string }) => {
  return (
    <div className="prose prose-md h-full w-full p-2 dark:prose-invert">
      <Markdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw]}
        components={{
          a: ({ node, ...props }) => {
            return (
              <a
                {...props}
                onClick={(e) => {
                  e.preventDefault();
                }}
                className="text-blue-500 underline hover:text-blue-700"
              />
            );
          },
          pre: ({ node, ...props }) => (
            <pre {...props} className="!m-0 !p-0 !bg-transparent !shadow-none" />
          ),
          code: ({ className, children, ...rest }) => {
            const language = className?.replace("language-", "") || "plaintext";
            if (!className) {
              // Inline Code
              return (
                <span {...rest} className="bg-gray-300 px-1 py-0.5 rounded text-sm text-black">
                  {children}
                </span>
              );
            }
            // Block Code (Rendered with CodeMirror)
            return (
              <CodeMirror
                value={String(children).trim()}
                extensions={[
                  EditorView.theme({
                    "&": {
                      backgroundColor: "#1e1e1e",
                      borderRadius: "0.5rem",
                      padding: "0.75rem",
                    },
                    ".cm-scroller": {
                      fontSize: "0.875rem",
                      lineHeight: "1.5",
                    },
                  }),
                  getLanguageExtension(language),
                ]}
                theme={vscodeDark}
                editable={false}
                basicSetup={{
                  lineNumbers: false,
                  foldGutter: false,
                  highlightActiveLine: false,
                }}
              />
            );
          },
        }}
      >
        {markdownContent}
      </Markdown>
    </div>
  );
};

export default NotePreview;
