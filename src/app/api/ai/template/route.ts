import { TEMPLATE_SYSTEM_PROMPT } from "@/lib/ai/template-system-prompt";
import { NextRequest, NextResponse } from "next/server";

type TemplateRequestBody = {
  userRequest?: string;
  provider?: AiProvider;
  openAiApiKey?: string;
  ollamaBaseUrl?: string;
  ollamaModel?: string;
};

type AiProvider = "auto" | "ollama" | "openai";

const DEFAULT_OLLAMA_BASE_URL = "http://127.0.0.1:11434";
const DEFAULT_OLLAMA_MODEL = "qwen2.5:7b-instruct";
const TEMPLATE_TIMEOUT_MS = 180_000;

const normalizeProvider = (value: string | undefined): AiProvider => {
  const normalized = value?.toLowerCase();
  if (normalized === "ollama" || normalized === "openai" || normalized === "auto") {
    return normalized;
  }
  return "auto";
};

const fetchWithTimeout = async (
  input: string,
  init?: RequestInit,
  timeoutMs = TEMPLATE_TIMEOUT_MS,
) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
};

const callOpenAI = async (systemPrompt: string, apiKey: string) => {
  const upstreamResponse = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1",
      temperature: 0.4,
      messages: [{ role: "system", content: systemPrompt }],
    }),
  });

  if (!upstreamResponse.ok) {
    const errorText = await upstreamResponse.text();
    return {
      ok: false as const,
      status: upstreamResponse.status,
      error: "OpenAI request failed",
      details: errorText,
    };
  }

  const payload = (await upstreamResponse.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const markdown = payload.choices?.[0]?.message?.content?.trim();
  if (!markdown) {
    return { ok: false as const, status: 502, error: "No content returned by OpenAI." };
  }

  return { ok: true as const, markdown, model: "gpt-4.1", provider: "openai" as const };
};

const callOllama = async (systemPrompt: string, baseUrl: string, model: string) => {
  try {
    const upstreamResponse = await fetchWithTimeout(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        prompt: systemPrompt,
        stream: false,
        keep_alive: "10m",
        options: {
          temperature: 0.4,
          num_predict: 1000,
        },
      }),
    });

    if (!upstreamResponse.ok) {
      const errorText = await upstreamResponse.text();
      return {
        ok: false as const,
        status: upstreamResponse.status,
        error: "Ollama request failed",
        details: errorText,
      };
    }

    const payload = (await upstreamResponse.json()) as {
      response?: string;
      error?: string;
    };

    if (payload.error) {
      return {
        ok: false as const,
        status: 502,
        error: "Ollama generation error",
        details: payload.error,
      };
    }

    const markdown = payload.response?.trim();
    if (!markdown) {
      return { ok: false as const, status: 502, error: "No content returned by Ollama." };
    }

    return { ok: true as const, markdown, model, provider: "ollama" as const };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        ok: false as const,
        status: 504,
        error: "Ollama request timed out.",
        details: "Generation took too long. Try a smaller model or shorter request.",
      };
    }
    return {
      ok: false as const,
      status: 500,
      error: "Ollama is unreachable.",
      details: "Check that Ollama is running and the base URL is correct.",
    };
  }
};

export async function POST(request: NextRequest) {
  let body: TemplateRequestBody;
  try {
    body = (await request.json()) as TemplateRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const userRequest = body.userRequest?.trim();
  if (!userRequest) {
    return NextResponse.json({ error: "userRequest is required." }, { status: 400 });
  }

  const systemPrompt = TEMPLATE_SYSTEM_PROMPT.replace("{{USER_REQUEST}}", userRequest);
  const provider = normalizeProvider(body.provider ?? process.env.AI_PROVIDER);
  const openAiApiKey = body.openAiApiKey?.trim() || process.env.OPENAI_API_KEY;
  const ollamaBaseUrl =
    body.ollamaBaseUrl?.trim() || process.env.OLLAMA_BASE_URL || DEFAULT_OLLAMA_BASE_URL;
  const ollamaModel = body.ollamaModel?.trim() || process.env.OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL;

  if (provider === "openai") {
    if (!openAiApiKey) {
      return NextResponse.json(
        { error: "AI_PROVIDER=openai requires OPENAI_API_KEY." },
        { status: 500 },
      );
    }
    const result = await callOpenAI(systemPrompt, openAiApiKey);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, details: result.details },
        { status: result.status },
      );
    }
    return NextResponse.json(result);
  }

  if (provider === "ollama") {
    const result = await callOllama(systemPrompt, ollamaBaseUrl, ollamaModel);
    if (!result.ok) {
      const timeoutHint =
        result.error === "Ollama request timed out."
          ? "Model is running but too slow for current hardware. Try mistral:7b-instruct or reduce prompt length."
          : undefined;
      const unavailableHint =
        result.error === "Ollama is unreachable."
          ? "Start Ollama and verify URL, e.g. http://127.0.0.1:11434"
          : undefined;
      return NextResponse.json(
        {
          error: result.error,
          details: result.details,
          hint:
            timeoutHint ??
            unavailableHint ??
            "Start Ollama and pull the model. Example: ollama pull qwen2.5:7b-instruct",
        },
        { status: result.status },
      );
    }
    return NextResponse.json(result);
  }

  const ollamaResult = await callOllama(systemPrompt, ollamaBaseUrl, ollamaModel);
  if (ollamaResult.ok) {
    return NextResponse.json(ollamaResult);
  }

  if (!openAiApiKey) {
    return NextResponse.json(
      {
        error: "No AI provider available.",
        details: ollamaResult.details,
        hint: "Run Ollama locally (free) or set OPENAI_API_KEY.",
      },
      { status: 500 },
    );
  }

  const openAiResult = await callOpenAI(systemPrompt, openAiApiKey);
  if (!openAiResult.ok) {
    return NextResponse.json(
      {
        error: "Both Ollama and OpenAI failed.",
        ollamaError: ollamaResult.details,
        openAiError: openAiResult.details,
      },
      { status: openAiResult.status },
    );
  }

  return NextResponse.json(openAiResult);
}
