/** Export a DOM node as PNG and share or download. */
export async function shareExportImage(
  el: HTMLElement,
  filename: string,
): Promise<"share" | "download" | "error"> {
  try {
    const { toPng } = await import("html-to-image");
    const dataUrl = await toPng(el, { pixelRatio: 3, cacheBust: true });
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
