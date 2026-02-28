import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AiProvider = "auto" | "ollama" | "openai";

const OBFUSCATION_PREFIX = "hnk::";

const obfuscateKey = (value: string) => {
  if (!value.trim()) return "";
  const transformed = value
    .split("")
    .map((char, index) => String.fromCharCode(char.charCodeAt(0) ^ (13 + (index % 7))))
    .join("");
  return `${OBFUSCATION_PREFIX}${btoa(transformed)}`;
};

const deobfuscateKey = (value: string) => {
  if (!value) return "";
  const raw = value.startsWith(OBFUSCATION_PREFIX) ? value.slice(OBFUSCATION_PREFIX.length) : value;
  try {
    const transformed = atob(raw);
    return transformed
      .split("")
      .map((char, index) => String.fromCharCode(char.charCodeAt(0) ^ (13 + (index % 7))))
      .join("");
  } catch {
    return "";
  }
};

type AiSettingsState = {
  provider: AiProvider;
  ollamaBaseUrl: string;
  ollamaModel: string;
  openAiApiKeyEncrypted: string;
  setProvider: (provider: AiProvider) => void;
  setOllamaBaseUrl: (url: string) => void;
  setOllamaModel: (model: string) => void;
  setOpenAiApiKey: (key: string) => void;
  clearOpenAiApiKey: () => void;
  getOpenAiApiKey: () => string;
  hasOpenAiApiKey: () => boolean;
  resetToFreeLocal: () => void;
};

const useAiSettingsStore = create<AiSettingsState>()(
  persist(
    (set, get) => ({
      provider: "auto",
      ollamaBaseUrl: "http://127.0.0.1:11434",
      ollamaModel: "qwen2.5:7b-instruct",
      openAiApiKeyEncrypted: "",
      setProvider: (provider) => set({ provider }),
      setOllamaBaseUrl: (ollamaBaseUrl) => set({ ollamaBaseUrl }),
      setOllamaModel: (ollamaModel) => set({ ollamaModel }),
      setOpenAiApiKey: (key) => set({ openAiApiKeyEncrypted: obfuscateKey(key.trim()) }),
      clearOpenAiApiKey: () => set({ openAiApiKeyEncrypted: "" }),
      getOpenAiApiKey: () => deobfuscateKey(get().openAiApiKeyEncrypted),
      hasOpenAiApiKey: () => Boolean(deobfuscateKey(get().openAiApiKeyEncrypted).trim()),
      resetToFreeLocal: () =>
        set({
          provider: "ollama",
          ollamaBaseUrl: "http://127.0.0.1:11434",
          ollamaModel: "qwen2.5:7b-instruct",
        }),
    }),
    {
      name: "happy-notes-ai-settings",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        provider: state.provider,
        ollamaBaseUrl: state.ollamaBaseUrl,
        ollamaModel: state.ollamaModel,
        openAiApiKeyEncrypted: state.openAiApiKeyEncrypted,
      }),
    },
  ),
);

export default useAiSettingsStore;
