"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useAiSettingsStore, { AiProvider } from "@/store/use-ai-settings-store";
import useToastStore from "@/store/use-toast-store";
import { Eye, EyeOff, PlugZap, Save, Shield } from "lucide-react";
import { useState } from "react";

const OLLAMA_MODELS = ["qwen2.5:7b-instruct", "llama3.1:8b", "mistral:7b-instruct", "gemma2:9b"];

export default function SettingsPage() {
  const {
    provider,
    ollamaBaseUrl,
    ollamaModel,
    openAiApiKeyEncrypted,
    setProvider,
    setOllamaBaseUrl,
    setOllamaModel,
    setOpenAiApiKey,
    clearOpenAiApiKey,
    getOpenAiApiKey,
    hasOpenAiApiKey,
    resetToFreeLocal,
  } = useAiSettingsStore();
  const pushToast = useToastStore((state) => state.pushToast);

  const [apiKeyDraft, setApiKeyDraft] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const existingKey = getOpenAiApiKey();
  const keyMaskedPreview = !existingKey
    ? "Not set"
    : existingKey.length < 10
      ? "••••••••"
      : `${existingKey.slice(0, 6)}••••••${existingKey.slice(-4)}`;

  const handleSaveSettings = () => {
    if (apiKeyDraft.trim()) {
      setOpenAiApiKey(apiKeyDraft);
      setApiKeyDraft("");
    }

    pushToast({
      variant: "success",
      title: "Settings saved",
      description: "AI provider configuration updated.",
    });
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const keyForTest = apiKeyDraft.trim() || getOpenAiApiKey();
      const response = await fetch("/api/ai/health", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider,
          ollamaBaseUrl,
          ollamaModel,
          openAiApiKey: keyForTest,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        details?: string;
        model?: string;
        provider?: string;
      };

      if (!response.ok) {
        pushToast({
          variant: "error",
          title: "Connection failed",
          description: payload.error ?? "Could not connect to selected AI provider.",
        });
        return;
      }

      pushToast({
        variant: "success",
        title: "AI connected",
        description: `Connected to ${payload.provider ?? provider} (${payload.model ?? "model"}).`,
      });
    } catch {
      pushToast({
        variant: "error",
        title: "Connection failed",
        description: "Network error while testing AI connection.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold">AI Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure your AI provider. Use local Ollama for free usage, or use your own OpenAI key.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Provider</CardTitle>
          <CardDescription>Choose how Happy Notes connects to AI models.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="provider">AI provider</Label>
            <Select value={provider} onValueChange={(value) => setProvider(value as AiProvider)}>
              <SelectTrigger id="provider" className="w-full">
                <SelectValue placeholder="Choose provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto (Ollama first, OpenAI fallback)</SelectItem>
                <SelectItem value="ollama">Ollama (free local LLM)</SelectItem>
                <SelectItem value="openai">OpenAI (use your API key)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Free Local Setup</p>
                <p className="text-xs text-muted-foreground">
                  Recommended: Ollama + qwen2.5:7b-instruct for zero API cost.
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={resetToFreeLocal}>
                Use Free Local
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Run once: ollama pull qwen2.5:7b-instruct
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>OpenAI Key</CardTitle>
          <CardDescription>
            Stored locally in your browser in obfuscated form and hidden by default.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="openai-key">API key</Label>
            <div className="flex gap-2">
              <Input
                id="openai-key"
                type={showKey ? "text" : "password"}
                placeholder="sk-..."
                value={apiKeyDraft}
                onChange={(event) => setApiKeyDraft(event.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowKey((value) => !value)}
                aria-label={showKey ? "Hide API key" : "Show API key"}
              >
                {showKey ? <EyeOff /> : <Eye />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Current key: {keyMaskedPreview}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setApiKeyDraft(getOpenAiApiKey())}
            >
              Load Existing Key
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={clearOpenAiApiKey}
              disabled={!openAiApiKeyEncrypted || !hasOpenAiApiKey()}
            >
              Clear Stored Key
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Local LLM (Ollama)</CardTitle>
          <CardDescription>Configure your local endpoint and model.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ollama-url">Base URL</Label>
            <Input
              id="ollama-url"
              value={ollamaBaseUrl}
              onChange={(event) => setOllamaBaseUrl(event.target.value)}
              placeholder="http://127.0.0.1:11434"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ollama-model">Model</Label>
            <Select value={ollamaModel} onValueChange={setOllamaModel}>
              <SelectTrigger id="ollama-model" className="w-full">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {OLLAMA_MODELS.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connection Test</CardTitle>
          <CardDescription>Fast health check for provider + model availability.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button type="button" onClick={handleSaveSettings}>
            <Save /> Save Settings
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleTestConnection}
            disabled={isTesting}
          >
            <PlugZap className={isTesting ? "animate-pulse" : ""} />
            {isTesting ? "Testing..." : "Test AI Connection"}
          </Button>
          <Button type="button" variant="ghost" disabled>
            <Shield /> Keys stay in your browser storage
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
