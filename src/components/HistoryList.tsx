import { useState, useRef } from "react";
import { TTSHistoryItem } from "../types";
import { Play, Pause, Download, Trash2, Calendar, Clipboard, Check, Volume2 } from "lucide-react";

interface HistoryListProps {
  history: TTSHistoryItem[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
}

export default function HistoryList({ history, onRemoveItem, onClearAll }: HistoryListProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayHistory = (item: TTSHistoryItem) => {
    if (playingId === item.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(item.audioUrl);
    audioRef.current = audio;
    audio.play();
    setPlayingId(item.id);

    audio.onended = () => {
      setPlayingId(null);
    };
    audio.onerror = () => {
      setPlayingId(null);
    };
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-zinc-850">
        <div>
          <h3 className="text-sm font-bold tracking-wide text-gray-800 dark:text-zinc-200 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-indigo-500" /> Riwayat Sintesis Suara
          </h3>
          <p className="text-xs text-gray-400">Dengar kembali atau download riwayat klip suara yang telah dibuat.</p>
        </div>
        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-[10px] uppercase tracking-wider font-bold text-red-500 hover:text-red-750 transition-all px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            Hapus Semua
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-xs">
          Belum ada riwayat suara terbuat. Silakan buat suara pertama Anda di atas!
        </div>
      ) : (
        <div className="space-y-3.5 max-h-[35rem] overflow-y-auto pr-1">
          {history.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-gray-50/50 dark:bg-zinc-950/40 border border-gray-150/65 dark:border-zinc-850/85 rounded-xl flex items-center justify-between gap-4 hover:border-gray-300 dark:hover:border-zinc-800 transition-all group"
            >
              {/* Play buttons & text */}
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => handlePlayHistory(item)}
                  className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-all ${
                    playingId === item.id
                      ? "bg-red-500 text-white shadow-md shadow-red-500/10"
                      : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400"
                  }`}
                >
                  {playingId === item.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-200 dark:bg-zinc-800 rounded text-gray-600 dark:text-zinc-300">
                      {item.type === "single" ? "Single Voice" : "Conversation"}
                    </span>
                    <span className="text-[10px] font-semibold text-gray-500 dark:text-zinc-400">
                      {item.voiceName} ({item.language})
                    </span>
                    <span className="text-[9px] text-gray-400 flex items-center gap-0.5 ml-auto">
                      <Calendar className="w-3 h-3" /> {item.timestamp}
                    </span>
                  </div>

                  {/* Input Text preview */}
                  <p className="text-xs text-gray-700 dark:text-zinc-200 font-medium line-clamp-2 leading-relaxed">
                    {item.inputText}
                  </p>

                  <div className="flex gap-2">
                    <span className="text-[10px] text-gray-400">{item.wordCount} kata</span>
                    {item.accent && <span className="text-[10px] text-gray-400">• Aksen: {item.accent}</span>}
                  </div>
                </div>
              </div>

              {/* Actions List */}
              <div className="flex items-center gap-1">
                {/* Copy text */}
                <button
                  type="button"
                  onClick={() => handleCopyText(item.inputText, item.id)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all"
                  title="Copy Text"
                >
                  {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Clipboard className="w-3.5 h-3.5" />}
                </button>

                {/* Download */}
                <a
                  href={item.audioUrl}
                  download={`Gemini-TTS-${item.voiceName}-${Date.now()}.wav`}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>

                {/* Delete history */}
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                  title="Trash"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
