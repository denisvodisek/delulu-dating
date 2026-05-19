const PNG_OPTS = {
  pixelRatio: 3,
  cacheBust: true,
  backgroundColor: undefined as string | undefined,
};

async function renderPng(el: HTMLElement): Promise<string | null> {
  try {
    const { toPng } = await import("html-to-image");
    return await toPng(el, PNG_OPTS);
  } catch {
    return null;
  }
}

/** Save export card as PNG (always downloads). */
export async function downloadExportImage(
  el: HTMLElement,
  filename: string,
): Promise<"download" | "error"> {
  const dataUrl = await renderPng(el);
  if (!dataUrl) return "error";
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
  return "download";
}

/** Share via system sheet when available; otherwise download. */
export async function shareExportImage(
  el: HTMLElement,
  filename: string,
): Promise<"share" | "download" | "error"> {
  const dataUrl = await renderPng(el);
  if (!dataUrl) return "error";
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], filename, { type: "image/png" });
    if (typeof navigator !== "undefined" && navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: "Delulu Dating", text: "Delulu Dating" });
      return "share";
    }
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    a.click();
    return "download";
  } catch {
    return "error";
  }
}
