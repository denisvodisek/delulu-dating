"use client";

type Props = {
  onDownload: () => void;
  onShare: () => void;
  downloadLabel: string;
  shareLabel: string;
  workingLabel: string;
  busy: boolean;
  soft?: boolean;
  fullWidth?: boolean;
};

export function ShareExportButtonPair({
  onDownload,
  onShare,
  downloadLabel,
  shareLabel,
  workingLabel,
  busy,
  soft = false,
  fullWidth = false,
}: Props) {
  return (
    <div className={`flex w-full flex-col gap-3${fullWidth ? "" : " max-w-sm"}`}>
      <button
        type="button"
        disabled={busy}
        onClick={(e) => {
          e.preventDefault();
          onDownload();
        }}
        className={
          soft
            ? "puffy-btn puffy-btn-lg puffy-btn-soft flex w-full items-center justify-center gap-2 disabled:cursor-wait disabled:opacity-70"
            : "puffy-btn puffy-btn-lg flex w-full items-center justify-center gap-2 disabled:cursor-wait disabled:opacity-70"
        }
      >
        <span className="material-symbols-outlined text-base">download</span>
        {busy ? workingLabel : downloadLabel}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={(e) => {
          e.preventDefault();
          onShare();
        }}
        className={
          soft
            ? "puffy-btn puffy-btn-lg flex w-full items-center justify-center gap-2 disabled:cursor-wait disabled:opacity-70"
            : "puffy-btn puffy-btn-lg puffy-btn-soft flex w-full items-center justify-center gap-2 disabled:cursor-wait disabled:opacity-70"
        }
      >
        <span className="material-symbols-outlined text-base">share</span>
        {busy ? workingLabel : shareLabel}
      </button>
    </div>
  );
}
