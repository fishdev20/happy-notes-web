export type ExportFormat = "pdf" | "html" | "docx" | "txt" | "md";

type ExportNotePayload = {
  title: string;
  markdown: string;
};

const sanitizeFileName = (value: string) => {
  const trimmed = value.trim();
  const fallback = "note";
  const safe = (trimmed || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9-_\s]+/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 64);

  return safe || fallback;
};

const getFileExtension = (format: ExportFormat) => {
  switch (format) {
    case "pdf":
      return "pdf";
    case "html":
      return "html";
    case "docx":
      return "docx";
    case "txt":
      return "txt";
    case "md":
      return "md";
    default:
      return "txt";
  }
};

const extractFilename = (contentDisposition: string | null, fallback: string) => {
  if (!contentDisposition) {
    return fallback;
  }

  const match = contentDisposition.match(/filename="?([^";]+)"?/i);
  return match?.[1] ?? fallback;
};

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const exportNote = async (payload: ExportNotePayload, format: ExportFormat) => {
  const response = await fetch("/api/export-note", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: payload.title,
      markdown: payload.markdown,
      format,
    }),
  });

  if (!response.ok) {
    const contentType = response.headers.get("Content-Type") ?? "";
    if (contentType.includes("application/json")) {
      const errorPayload = (await response.json().catch(() => ({}))) as {
        error?: string;
        details?: string;
      };
      throw new Error(
        errorPayload.details
          ? `${errorPayload.error ?? "Export failed"} (${errorPayload.details})`
          : (errorPayload.error ?? "Export request failed."),
      );
    }

    const rawText = await response.text().catch(() => "");
    throw new Error(rawText || `Export request failed with status ${response.status}.`);
  }

  const blob = await response.blob();
  const fallbackName = `${sanitizeFileName(payload.title)}.${getFileExtension(format)}`;
  const fileName = extractFilename(response.headers.get("Content-Disposition"), fallbackName);

  downloadBlob(blob, fileName);
};
