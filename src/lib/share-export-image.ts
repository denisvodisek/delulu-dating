const PNG_OPTS = {
  pixelRatio: 3,
  cacheBust: true,
  backgroundColor: undefined as string | undefined,
};

/** Unhide off-screen export nodes so html-to-image can paint pixels. */
function revealForCapture(el: HTMLElement): () => void {
  const chain: HTMLElement[] = [];
  for (let node: HTMLElement | null = el; node; node = node.parentElement) {
    chain.push(node);
  }

  const snapshot = chain.map((node) => ({
    opacity: node.style.opacity,
    visibility: node.style.visibility,
    position: node.style.position,
    left: node.style.left,
    top: node.style.top,
    zIndex: node.style.zIndex,
    pointerEvents: node.style.pointerEvents,
  }));

  for (const node of chain) {
    node.style.opacity = "1";
    node.style.visibility = "visible";
    node.style.pointerEvents = "none";
  }
  const root = chain[chain.length - 1];
  if (root) {
    root.style.position = "fixed";
    root.style.left = "0";
    root.style.top = "0";
    root.style.zIndex = "-1";
  }

  return () => {
    chain.forEach((node, i) => {
      const s = snapshot[i];
      node.style.opacity = s.opacity;
      node.style.visibility = s.visibility;
      node.style.position = s.position;
      node.style.left = s.left;
      node.style.top = s.top;
      node.style.zIndex = s.zIndex;
      node.style.pointerEvents = s.pointerEvents;
    });
  };
}

async function renderPng(el: HTMLElement): Promise<string | null> {
  const restore = revealForCapture(el);
  try {
    const { toPng } = await import("html-to-image");
    return await toPng(el, PNG_OPTS);
  } catch {
    return null;
  } finally {
    restore();
  }
}

async function pngBlob(el: HTMLElement): Promise<Blob | null> {
  const dataUrl = await renderPng(el);
  if (!dataUrl) return null;
  const res = await fetch(dataUrl);
  return res.blob();
}

function triggerDownload(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
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
