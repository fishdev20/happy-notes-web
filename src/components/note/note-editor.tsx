import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { useTheme } from "next-themes";
import { Suspense } from "react";

interface NoteEditorProps {
  value: string;
  onChange: (value: string) => void;
}
export default function NoteEditor({ value, onChange }: NoteEditorProps) {
  const { theme } = useTheme();
  return (
    <Suspense fallback={<>Loading...</>}>
      <CodeMirror
        className="h-full w-full editor rounded-sm relative overflow-auto"
        value={value}
        onChange={onChange}
        placeholder="Write your markdown here..."
        extensions={[
          markdown({ base: markdownLanguage, codeLanguages: languages }),
          EditorView.lineWrapping,
          EditorView.theme({
            "&": {
              backgroundColor: "transparent !important",
              maxWidth: "100%",
            },
            ".cm-gutters": {
              backgroundColor: "transparent !important",
              border: "none",
            },
            ".cm-gutterElement": {
              backgroundColor: "transparent !important",
            },
            ".cm-lineNumbers": {
              backgroundColor: "transparent !important",
            },
          }),
        ]}
        basicSetup={{
          foldGutter: false,
          highlightActiveLine: false,
          highlightActiveLineGutter: false,
        }}
        theme={theme === "dark" ? vscodeDark : vscodeLight}
      />
    </Suspense>
  );
}
