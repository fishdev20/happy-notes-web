import { NextRequest, NextResponse } from "next/server";

type AiProvider = "auto" | "ollama" | "openai";

type HealthRequestBody = {
  provider?: AiProvider;
  openAiApiKey?: string;
  ollamaBaseUrl?: string;
  ollamaModel?: string;
};

const DEFAULT_OLLAMA_BASE_URL = "http://127.0.0.1:11434";
const DEFAULT_OLLAMA_MODEL = "qwen2.5:7b-instruct";
const REQUEST_TIMEOUT_MS = 7000;

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
  timeoutMs = REQUEST_TIMEOUT_MS,
) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const checkOllama = async (baseUrl: string, model: string) => {
  try {
    const response = await fetchWithTimeout(`${baseUrl}/api/tags`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      return {
        ok: false as const,
        status: response.status,
        error: "Ollama is reachable but returned an error.",
      };
    }

    const payload = (await response.json()) as {
      models?: Array<{ name?: string; model?: string }>;
    };

    const models = payload.models ?? [];
    const hasModel = models.some((item) => {
      const itemName = item.name ?? item.model ?? "";
      return itemName === model || itemName.startsWith(`${model}:`) || model.startsWith(itemName);
    });

    if (!hasModel) {
      return {
        ok: false as const,
        status: 404,
        error: `Ollama is running, but model \"${model}\" is not installed. Run: ollama pull ${model}`,
      };
    }

    return { ok: true as const, provider: "ollama" as const, model };
  } catch {
    return {
      ok: false as const,
      status: 500,
      error: "Cannot reach Ollama. Make sure it is running on the configured URL.",
    };
  }
};

const checkOpenAI = async (apiKey: string) => {
  try {
    const response = await fetchWithTimeout("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      return {
        ok: false as const,
        status: response.status,
        error: "OpenAI key is invalid or unavailable.",
      };
    }

    return { ok: true as const, provider: "openai" as const };
  } catch {
    return {
      ok: false as const,
      status: 500,
      error: "Cannot reach OpenAI endpoint from server.",
    };
  }
};

export async function POST(request: NextRequest) {
  let body: HealthRequestBody;
  try {
    body = (await request.json()) as HealthRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const provider = normalizeProvider(body.provider ?? process.env.AI_PROVIDER);
  const openAiApiKey = body.openAiApiKey?.trim() || process.env.OPENAI_API_KEY;
  const ollamaBaseUrl =
    body.ollamaBaseUrl?.trim() || process.env.OLLAMA_BASE_URL || DEFAULT_OLLAMA_BASE_URL;
  const ollamaModel = body.ollamaModel?.trim() || process.env.OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL;

  if (provider === "ollama") {
    const result = await checkOllama(ollamaBaseUrl, ollamaModel);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ ok: true, provider: result.provider, model: result.model });
  }

  if (provider === "openai") {
    if (!openAiApiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY is missing." }, { status: 400 });
    }
    const result = await checkOpenAI(openAiApiKey);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ ok: true, provider: result.provider, model: "openai" });
  }

  const ollamaResult = await checkOllama(ollamaBaseUrl, ollamaModel);
  if (ollamaResult.ok) {
    return NextResponse.json({ ok: true, provider: "ollama", model: ollamaModel });
  }

  if (!openAiApiKey) {
    return NextResponse.json(
      {
        error: "No AI provider available.",
        details: ollamaResult.error,
      },
      { status: 500 },
    );
  }

  const openAiResult = await checkOpenAI(openAiApiKey);
  if (!openAiResult.ok) {
    return NextResponse.json(
      {
        error: "Auto mode failed for both Ollama and OpenAI.",
        ollamaError: ollamaResult.error,
        openAiError: openAiResult.error,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, provider: "openai", model: "openai" });
}
