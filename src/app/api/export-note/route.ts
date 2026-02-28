import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type ExportFormat = "pdf" | "html" | "docx" | "txt" | "md";

type ExportRequestBody = {
  title?: string;
  markdown?: string;
  format?: ExportFormat;
};

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

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

const stripInlineMarkdown = (value: string) =>
  value
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/<[^>]*>/g, "");

const markdownToPlainText = (markdown: string) => {
  const lines = markdown.split("\n");
  const output: string[] = [];
  let inCodeFence = false;

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      inCodeFence = !inCodeFence;
      if (output.length && output[output.length - 1] !== "") {
        output.push("");
      }
      return;
    }

    if (!trimmed) {
      output.push("");
      return;
    }

    if (inCodeFence) {
      output.push(line);
      return;
    }

    const headingMatch = trimmed.match(/^#{1,6}\s+(.*)$/);
    if (headingMatch) {
      output.push(stripInlineMarkdown(headingMatch[1]));
      output.push("");
      return;
    }

    if (trimmed.startsWith("- [ ] ")) {
      output.push(`☐ ${stripInlineMarkdown(trimmed.slice(6))}`);
      return;
    }

    if (trimmed.startsWith("- [x] ") || trimmed.startsWith("- [X] ")) {
      output.push(`☑ ${stripInlineMarkdown(trimmed.slice(6))}`);
      return;
    }

    if (/^[-*+]\s+/.test(trimmed)) {
      output.push(`• ${stripInlineMarkdown(trimmed.replace(/^[-*+]\s+/, ""))}`);
      return;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      output.push(stripInlineMarkdown(trimmed));
      return;
    }

    if (trimmed.startsWith("> ")) {
      output.push(stripInlineMarkdown(trimmed.slice(2)));
      return;
    }

    output.push(stripInlineMarkdown(trimmed));
  });

  return output
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const markdownToSimpleHtml = (markdown: string) => {
  const lines = markdown.split("\n");
  const html: string[] = [];
  let inCodeFence = false;
  let inBulletList = false;
  let inOrderedList = false;

  const closeLists = () => {
    if (inBulletList) {
      html.push("</ul>");
      inBulletList = false;
    }
    if (inOrderedList) {
      html.push("</ol>");
      inOrderedList = false;
    }
  };

  const inline = (value: string) =>
    escapeHtml(value)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, text, href) => {
        const safeHref = String(href).replaceAll('"', "&quot;");
        return `<a href="${safeHref}">${text}</a>`;
      })
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/__([^_]+)__/g, "<strong>$1</strong>")
      .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "<em>$1</em>")
      .replace(/(?<!_)_([^_\n]+)_(?!_)/g, "<em>$1</em>")
      .replace(/~~([^~]+)~~/g, "<del>$1</del>");

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      closeLists();
      if (!inCodeFence) {
        html.push("<pre><code>");
        inCodeFence = true;
      } else {
        html.push("</code></pre>");
        inCodeFence = false;
      }
      return;
    }

    if (inCodeFence) {
      html.push(`${escapeHtml(line)}\n`);
      return;
    }

    if (!trimmed) {
      closeLists();
      html.push('<div class="spacer"></div>');
      return;
    }

    if (trimmed.startsWith("### ")) {
      closeLists();
      html.push(`<h3>${inline(trimmed.slice(4))}</h3>`);
      return;
    }

    if (trimmed.startsWith("## ")) {
      closeLists();
      html.push(`<h2>${inline(trimmed.slice(3))}</h2>`);
      return;
    }

    if (trimmed.startsWith("# ")) {
      closeLists();
      html.push(`<h1>${inline(trimmed.slice(2))}</h1>`);
      return;
    }

    if (trimmed.startsWith("- [ ] ")) {
      if (inOrderedList) {
        html.push("</ol>");
        inOrderedList = false;
      }
      if (!inBulletList) {
        html.push('<ul class="checklist">');
        inBulletList = true;
      }
      html.push(`<li class="todo">☐ ${inline(trimmed.slice(6))}</li>`);
      return;
    }

    if (trimmed.startsWith("- [x] ") || trimmed.startsWith("- [X] ")) {
      if (inOrderedList) {
        html.push("</ol>");
        inOrderedList = false;
      }
      if (!inBulletList) {
        html.push('<ul class="checklist">');
        inBulletList = true;
      }
      html.push(`<li class="todo">☑ ${inline(trimmed.slice(6))}</li>`);
      return;
    }

    if (/^[-*+]\s+/.test(trimmed)) {
      if (inOrderedList) {
        html.push("</ol>");
        inOrderedList = false;
      }
      if (!inBulletList) {
        html.push("<ul>");
        inBulletList = true;
      }
      html.push(`<li>${inline(trimmed.replace(/^[-*+]\s+/, ""))}</li>`);
      return;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      if (inBulletList) {
        html.push("</ul>");
        inBulletList = false;
      }
      if (!inOrderedList) {
        html.push("<ol>");
        inOrderedList = true;
      }
      html.push(`<li>${inline(trimmed.replace(/^\d+\.\s+/, ""))}</li>`);
      return;
    }

    if (trimmed.startsWith("> ")) {
      closeLists();
      html.push(`<blockquote><p>${inline(trimmed.slice(2))}</p></blockquote>`);
      return;
    }

    closeLists();
    html.push(`<p>${inline(trimmed)}</p>`);
  });

  if (inCodeFence) {
    html.push("</code></pre>");
  }
  closeLists();

  return html.join("\n");
};

const buildHtmlDocument = (title: string, markdown: string) => {
  const safeTitle = escapeHtml(title || "Untitled note");
  const body = markdownToSimpleHtml(markdown);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeTitle}</title>
    <style>
      body { font-family: Inter, system-ui, sans-serif; margin: 32px; line-height: 1.5; color: #111827; }
      h1, h2, h3 { margin: 18px 0 8px; }
      p { margin: 6px 0; white-space: pre-wrap; }
      ul, ol { margin: 6px 0 6px 20px; }
      li { margin: 3px 0; }
      code { padding: 1px 4px; border-radius: 4px; background: #f3f4f6; font-size: 0.92em; }
      pre { margin: 8px 0; padding: 10px; border-radius: 8px; background: #f3f4f6; overflow: auto; }
      blockquote { margin: 8px 0; padding-left: 10px; border-left: 3px solid #d1d5db; color: #374151; }
      a { color: #1d4ed8; text-decoration: underline; }
      .spacer { height: 10px; }
    </style>
  </head>
  <body>
    <h1>${safeTitle}</h1>
    ${body}
  </body>
</html>`;
};

const createPdfBuffer = async (title: string, markdown: string) => {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const plainText = markdownToPlainText(markdown);
  const pdf = await PDFDocument.create();
  const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const pageSize = { width: 595.28, height: 841.89 }; // A4 in points
  const margin = 48;
  const contentWidth = pageSize.width - margin * 2;
  const lineHeight = 15;
  const titleSize = 20;
  const bodySize = 11;

  let page = pdf.addPage([pageSize.width, pageSize.height]);
  let cursorY = pageSize.height - margin;

  const wrapText = (text: string, size: number, font: typeof fontRegular) => {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let current = "";

    words.forEach((word) => {
      const candidate = current ? `${current} ${word}` : word;
      const candidateWidth = font.widthOfTextAtSize(candidate, size);
      if (candidateWidth <= contentWidth || !current) {
        current = candidate;
      } else {
        lines.push(current);
        current = word;
      }
    });

    if (current) {
      lines.push(current);
    }

    return lines.length ? lines : [""];
  };

  const drawLine = (line: string, size: number, font: typeof fontRegular, isBold = false) => {
    if (cursorY < margin + lineHeight) {
      page = pdf.addPage([pageSize.width, pageSize.height]);
      cursorY = pageSize.height - margin;
    }

    page.drawText(line, {
      x: margin,
      y: cursorY,
      size,
      font: isBold ? fontBold : font,
      color: rgb(0.07, 0.09, 0.12),
    });
    cursorY -= lineHeight + (isBold ? 3 : 0);
  };

  wrapText(title || "Untitled note", titleSize, fontBold).forEach((line) => {
    drawLine(line, titleSize, fontBold, true);
  });

  cursorY -= 8;

  plainText.split("\n").forEach((line) => {
    if (!line.trim()) {
      cursorY -= 6;
      return;
    }
    wrapText(line, bodySize, fontRegular).forEach((wrapped) => {
      drawLine(wrapped, bodySize, fontRegular);
    });
  });

  const bytes = await pdf.save();
  return Buffer.from(bytes);
};

const createDocxBuffer = async (title: string, markdown: string) => {
  const { Document, HeadingLevel, Packer, Paragraph, TextRun } = await import("docx");
  const paragraphs = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: title || "Untitled note" })],
    }),
  ];

  markdown.split("\n").forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      paragraphs.push(new Paragraph({ text: "" }));
      return;
    }

    if (trimmed.startsWith("### ")) {
      paragraphs.push(new Paragraph({ heading: HeadingLevel.HEADING_3, text: trimmed.slice(4) }));
      return;
    }

    if (trimmed.startsWith("## ")) {
      paragraphs.push(new Paragraph({ heading: HeadingLevel.HEADING_2, text: trimmed.slice(3) }));
      return;
    }

    if (trimmed.startsWith("# ")) {
      paragraphs.push(new Paragraph({ heading: HeadingLevel.HEADING_1, text: trimmed.slice(2) }));
      return;
    }

    if (trimmed.startsWith("- [ ] ")) {
      paragraphs.push(new Paragraph({ text: `☐ ${stripInlineMarkdown(trimmed.slice(6))}` }));
      return;
    }

    if (trimmed.startsWith("- [x] ") || trimmed.startsWith("- [X] ")) {
      paragraphs.push(new Paragraph({ text: `☑ ${stripInlineMarkdown(trimmed.slice(6))}` }));
      return;
    }

    if (/^[-*+]\s+/.test(trimmed)) {
      paragraphs.push(
        new Paragraph({ text: `• ${stripInlineMarkdown(trimmed.replace(/^[-*+]\s+/, ""))}` }),
      );
      return;
    }

    paragraphs.push(new Paragraph({ text: stripInlineMarkdown(trimmed) }));
  });

  const doc = new Document({ sections: [{ properties: {}, children: paragraphs }] });
  return await Packer.toBuffer(doc);
};

const getFormatMeta = (format: ExportFormat) => {
  switch (format) {
    case "pdf":
      return { contentType: "application/pdf", extension: "pdf" };
    case "html":
      return { contentType: "text/html; charset=utf-8", extension: "html" };
    case "docx":
      return {
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        extension: "docx",
      };
    case "txt":
      return { contentType: "text/plain; charset=utf-8", extension: "txt" };
    case "md":
      return { contentType: "text/markdown; charset=utf-8", extension: "md" };
    default:
      return { contentType: "application/octet-stream", extension: "bin" };
  }
};

export async function POST(request: NextRequest) {
  let body: ExportRequestBody;
  try {
    body = (await request.json()) as ExportRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const format = body.format;
  const title = body.title?.trim() || "Untitled note";
  const markdown = body.markdown ?? "";

  if (!format || !["pdf", "html", "docx", "txt", "md"].includes(format)) {
    return NextResponse.json({ error: "Invalid export format." }, { status: 400 });
  }

  try {
    let output: Buffer;

    if (format === "pdf") {
      output = await createPdfBuffer(title, markdown);
    } else if (format === "html") {
      output = Buffer.from(buildHtmlDocument(title, markdown), "utf8");
    } else if (format === "docx") {
      output = await createDocxBuffer(title, markdown);
    } else if (format === "txt") {
      const plain = markdownToPlainText(markdown);
      output = Buffer.from(`${title}\n\n${plain}`.trim(), "utf8");
    } else {
      output = Buffer.from(markdown, "utf8");
    }

    const meta = getFormatMeta(format);
    const filename = `${sanitizeFileName(title)}.${meta.extension}`;

    return new NextResponse(output, {
      status: 200,
      headers: {
        "Content-Type": meta.contentType,
        "Content-Disposition": `attachment; filename=\"${filename}\"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const details = error instanceof Error ? error.message : "Unknown export error.";
    return NextResponse.json({ error: "Failed to export note.", details }, { status: 500 });
  }
}
