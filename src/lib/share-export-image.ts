const PNG_OPTS = {
  pixelRatio: 3,
  cacheBust: true,
  backgroundColor: undefined as string | undefined,
};

/** Ensure export node is paintable without moving it into the viewport (avoids scroll jump). */
function revealForCapture(el: HTMLElement): () => void {
  const nodes: HTMLElement[] = [el];
  const host = el.parentElement;
  if (host) nodes.push(host);

  const snapshot = nodes.map((node) => ({
    opacity: node.style.opacity,
    visibility: node.style.visibility,
  }));

  for (const node of nodes) {
    node.style.opacity = "1";
    node.style.visibility = "visible";
  }

  return () => {
    nodes.forEach((node, i) => {
      node.style.opacity = snapshot[i].opacity;
      node.style.visibility = snapshot[i].visibility;
    });
  };
}

async function renderPng(el: HTMLElement): Promise<string | null> {
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  const restore = revealForCapture(el);
  try {
    const { toPng } = await import("html-to-image");
    return await toPng(el, PNG_OPTS);
  } catch {
    return null;
  } finally {
    restore();
    window.scrollTo(scrollX, scrollY);
  }
}

async function pngBlob(el: HTMLElement): Promise<Blob | null> {
  const dataUrl = await renderPng(el);
  if (!dataUrl) return null;
  const res = await fetch(dataUrl);
  return res.blob();
}

function triggerDownload(dataUrl: string, filename: string) {
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.rel = "noopener";
  a.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0;";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.scrollTo(scrollX, scrollY);
}

async function copyPngToClipboard(blob: Blob): Promise<boolean> {
  if (!navigator.clipboard?.write) return false;
  try {
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return true;
  } catch {
    return false;
  }
}

async function tryShareFile(file: File): Promise<boolean> {
  if (!navigator.share) return false;
  const payload: ShareData = { files: [file] };
  if (navigator.canShare && !navigator.canShare(payload)) return false;
  try {
    await navigator.share(payload);
    return true;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") return false;
    return false;
  }
}

/** Save export card as PNG (always downloads). */
export async function downloadExportImage(
  el: HTMLElement,
  filename: string,
): Promise<"download" | "error"> {
  const dataUrl = await renderPng(el);
  if (!dataUrl) return "error";
  triggerDownload(dataUrl, filename);
  return "download";
}

export type ShareExportOutcome = "share" | "clipboard" | "download" | "error";

/**
 * Share PNG via system sheet (files only — no title/text).
 * Falls back to clipboard, then download, when file share is unavailable.
 */
export async function shareExportImage(
  el: HTMLElement,
  filename: string,
): Promise<ShareExportOutcome> {
  const blob = await pngBlob(el);
  if (!blob) return "error";

  const file = new File([blob], filename, { type: "image/png" });

  if (await tryShareFile(file)) return "share";

  if (await copyPngToClipboard(blob)) return "clipboard";

  const dataUrl = await renderPng(el);
  if (!dataUrl) return "error";
  triggerDownload(dataUrl, filename);
  return "download";
}
