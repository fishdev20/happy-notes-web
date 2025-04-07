import { LanguageName, langs } from "@uiw/codemirror-extensions-langs";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const languageAliases: Record<string, LanguageName> = {
  js: "javascript",
  javascript: "javascript",
  jsx: "jsx",
  ts: "typescript",
  typescript: "typescript",
  tsx: "tsx",
  md: "markdown",
  py: "python",
  rb: "ruby",
  csharp: "csharp",
  cs: "csharp",
  sh: "shell",
  bash: "shell",
  zsh: "shell",
  html: "html",
  xml: "xml",
  yml: "yaml",
  yaml: "yaml",
  docker: "dockerfile",
  dockerfile: "dockerfile",
  proto: "protobuf",
  shell: "shell",
  plaintext: "markdown", // fallback
  txt: "markdown",
  scss: "sass",
  less: "less",
  jsonc: "json",
  vue: "vue",
  angular: "angular",
  mysql: "mysql",
  pgsql: "pgsql",
  pl: "perl",
  rs: "rust",
  kt: "kotlin",
  swift: "swift",
  go: "go",
  cpp: "cpp",
  cxx: "cpp",
  hpp: "cpp",
  cc: "cpp",
  c: "c",
  java: "java",
  php: "php",
  lua: "lua",
  r: "r",
  tex: "stex",
  svelte: "svelte",
  toml: "toml",
  clj: "clojure",
  coffee: "coffeescript",
  dart: "dart",
  scala: "scala",
  styl: "stylus",
};

export function getLanguageExtension(language: string) {
  const lower = language.toLowerCase();
  const lang = (languageAliases[lower] || lower) as LanguageName;
  if (lang in langs) {
    try {
      return langs[lang]();
    } catch (err) {
      console.warn(`Failed to load CodeMirror language for: ${lang}`, err);
    }
  }
  console.warn(`Language not supported: ${language}`);
  return langs["markdown"](); // Safe fallback
}
