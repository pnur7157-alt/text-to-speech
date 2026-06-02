import React, { useState, useRef, useEffect } from "react";
import { VOICES, LANGUAGES, TONES, PRESETS } from "../data";
import { DialogueLine } from "../types";
import WaveformVisualizer from "./WaveformVisualizer";
import { Play, Pause, Download, Plus, Trash2, Sparkles, Wand2, Volume2, Info, AlertCircle, RefreshCw } from "lucide-react";

interface ScriptDirectorProps {
  onAddHistory: (item: any) => void;
}

export default function ScriptDirector({ onAddHistory }: ScriptDirectorProps) {
  const [context, setContext] = useState<string>("Dua sahabat lama berpapasan di stasiun kereta saat hujan lebat.");
  const [dialogue, setDialogue] = useState<DialogueLine[]>([
    {
      id: "line-1",
      speaker: "Indah",
      voiceName: "Puck",
      tone: "cheerful",
      text: "Loh, Budi! Kamu mau pulang ke Bandung juga? Wah, kebetulan sekali kita sekereta!",
    },
    {
      id: "line-2",
      speaker: "Budi",
      voiceName: "Kore",
      tone: "natural",
      text: "Eh, Indah! Iya nih, mumpung libur akhir pekan. Wah, sudah berapa tahun tidak bertemu ya?",
    },
  ]);

  const [selectedLang, setSelectedLang] = useState<string>("id");
  const [selectedAccent, setSelectedAccent] = useState<string>("Logat Standar Baku");
  const [selectedSpeed, setSelectedSpeed] = useState<string>("normal");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Audio Playback states
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync selected accents when language changes
  const currentLangObj = LANGUAGES.find((l) => l.code === selectedLang);
  useEffect(() => {
    if (currentLangObj && currentLangObj.accents.length > 0) {
      setSelectedAccent(currentLangObj.accents[0]);
    }
  }, [selectedLang]);

  // Handle dialog audio listeners
  const setupAudioListeners = (audioElem: HTMLAudioElement) => {
    audioElem.onloadedmetadata = () => {
      setDuration(audioElem.duration || 0);
    };
    audioElem.ontimeupdate = () => {
      setCurrentTime(audioElem.currentTime || 0);
    };
    audioElem.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    audioElem.onerror = () => {
      setError("Gagal memuat media file audio.");
      setIsPlaying(false);
    };
  };

  // Add a new line to the dialogue script
  const handleAddLine = () => {
    const nextLineId = Math.random().toString(36).substr(2, 9);
    const validVoices = ["Puck", "Charon", "Kore", "Fenrir", "Zephyr"];
    // Alternate speakers and voices naturally
    const nextVoice = validVoices[dialogue.length % validVoices.length];

    setDialogue([
      ...dialogue,
      {
        id: nextLineId,
        speaker: `Speaker ${dialogue.length + 1}`,
        voiceName: nextVoice,
        tone: "natural",
        text: "",
      },
    ]);
  };

  // Remove a line from dialogue script
  const handleRemoveLine = (id: string) => {
    if (dialogue.length <= 1) {
      setError("Script setidaknya harus memiliki minimal 1 baris dialog.");
      return;
    }
    setDialogue(dialogue.filter((line) => line.id !== id));
  };

  // Handle line state changes
  const handleLineChange = (id: string, field: keyof DialogueLine, value: string) => {
    setDialogue(
      dialogue.map((line) => {
        if (line.id === id) {
          return { ...line, [field]: value };
        }
        return line;
      })
    );
  };

  // Pre-load dialog script from dataset
  const handleLoadScriptPreset = () => {
    const dialoguePreset = PRESETS.find((p) => p.category === "Multi-Speaker");
    if (dialoguePreset && dialoguePreset.dialogue) {
      setContext("Percakapan santai seputar kopi arabika lokal di tengah rintik hujan.");
      const wrapped: DialogueLine[] = dialoguePreset.dialogue.map((line, idx) => ({
        id: `preset-line-${idx}`,
        speaker: line.speaker,
        voiceName: line.voiceName,
        tone: line.tone === "Gembira & Ceria" ? "cheerful" : line.tone === "Bisikan Lembut" ? "whisper" : "natural",
        text: line.text,
      }));
      setDialogue(wrapped);
      setSelectedLang("id");
      setSelectedAccent("Logat Standar Baku");
    }
  };

  // Generate Conversations Callback
  const handleGenerateScript = async () => {
    // Audit empty line texts
    const hasEmptyField = dialogue.some((line) => !line.text.trim());
    if (hasEmptyField) {
      setError("Silakan isi semua kolom teks percakapan terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError(null);
    setIsPlaying(false);
    setCurrentTime(0);

    try {
      const dialoguePayload = dialogue.map((line) => {
        const toneName = TONES.find((t) => t.id === line.tone)?.name || "Natural";
        return {
          speaker: line.speaker,
          voiceName: line.voiceName,
          tone: toneName,
          text: line.text.trim(),
        };
      });

      const response = await fetch("/api/multi-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dialogue: dialoguePayload,
          language: LANGUAGES.find((l) => l.code === selectedLang)?.name || "Indonesian",
          accent: selectedAccent,
          speed: selectedSpeed,
          context: context.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mensintesis naskah.");
      }

      const base64Str = data.audio;
      const blobUrl = `data:audio/wav;base64,${base64Str}`;
      setAudioUrl(blobUrl);

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(blobUrl);
      audioRef.current = audio;
      setupAudioListeners(audio);

      // Save to parent history
      const totalWords = dialogue.reduce((sum, line) => sum + line.text.trim().split(/\s+/).length, 0);
      onAddHistory({
        id: Math.random().toString(36).substr(2, 9),
        type: "multi",
        inputText: `Naskah Percakapan: ${dialogue.length} giliran bicara`,
        language: LANGUAGES.find((l) => l.code === selectedLang)?.name || "Indonesian",
        accent: selectedAccent,
        tone: "Konvensional (Interaktif)",
        voiceName: `${dialogue[0].voiceName} & ${dialogue[1]?.voiceName || "Lainnya"}`,
        audioUrl: blobUrl,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        wordCount: totalWords,
        dialogue: [...dialogue],
      });

      // Play audio automatically
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn("Autoplay block by browser policies", e);
      });

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal menghubungkan ke server.");
    } finally {
      setLoading(false);
    }
  };

  // Audio Play toggle
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        setError("Audio play ditolak oleh browser.");
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const seekValue = parseFloat(e.target.value);
    audioRef.current.currentTime = seekValue;
    setCurrentTime(seekValue);
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Script Controller (Global variables side panel) */}
      <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 space-y-6 shadow-sm self-start">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-gray-500 uppercase dark:text-zinc-400 flex items-center gap-1.5 mb-1">
            <Volume2 className="w-4 h-4 text-indigo-500" /> Aturan Naskah Global
          </h2>
          <p className="text-xs text-gray-400">Parameter umum untuk seluruh aktor drama.</p>
        </div>

        {/* Global Language Setup */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Bahasa Naskah</label>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="w-full text-xs font-semibold bg-gray-50 dark:bg-zinc-855 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-gray-700 dark:text-zinc-300 outline-none focus:border-indigo-550"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Aksen Percakapan</label>
            <select
              value={selectedAccent}
              onChange={(e) => setSelectedAccent(e.target.value)}
              className="w-full text-xs font-medium bg-gray-50 dark:bg-zinc-855 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-gray-700 dark:text-zinc-300 outline-none focus:border-indigo-550"
            >
              {currentLangObj?.accents.map((acc) => (
                <option key={acc} value={acc}>
                  {acc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Kecepatan Dialog</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "slow", label: "Lambat" },
                { id: "normal", label: "Normal" },
                { id: "fast", label: "Cepat" },
              ].map((sp) => (
                <button
                  key={sp.id}
                  type="button"
                  onClick={() => setSelectedSpeed(sp.id)}
                  className={`py-1.5 text-xs text-center font-bold rounded-lg border transition-all ${
                    selectedSpeed === sp.id
                      ? "bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-900 text-teal-800 dark:text-teal-400"
                      : "bg-gray-50/65 dark:bg-zinc-800 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-350"
                  }`}
                >
                  {sp.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Informative Help Alert */}
        <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-indigo-800 dark:text-indigo-400 text-xs font-bold">
            <Info className="w-4 h-4 shrink-0" />
            Tips Sutradara Naskah
          </div>
          <p className="text-[10px] text-indigo-950/70 dark:text-indigo-400/80 leading-relaxed">
            Berikan nama pembicara yang konsisten di tiap baris. Model akan menyesuaikan jeda antar pembicara agar terasa intim seperti mendengarkan klip drama nyata.
          </p>
          <button
            type="button"
            onClick={handleLoadScriptPreset}
            className="w-full mt-1.5 py-2 px-3 bg-white dark:bg-zinc-950 hover:bg-indigo-50/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg text-[10px] font-bold transition-all text-center flex items-center justify-center gap-1.5"
          >
            <Wand2 className="w-3.5 h-3.5 text-indigo-600" /> Auto-Load Dialog Sample
          </button>
        </div>
      </div>

      {/* Dialog lines board and playbacks */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Scenario / Context Area */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Konteks / Latar Panggung (Scene Context)</label>
          <input
            type="text"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Contoh: Diskusi hangat di cafe, atau debat formal dengan intonasi serius..."
            className="w-full text-xs font-medium bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 px-3.5 py-3 rounded-xl text-gray-700 dark:text-zinc-200 outline-none focus:border-indigo-500"
          />
        </div>

        {/* Script Board */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Naskah Percakapan Percakapan</h3>

          {/* Lines rendering */}
          <div className="space-y-4 max-h-[38rem] overflow-y-auto pr-1">
            {dialogue.map((line, idx) => (
              <div
                key={line.id}
                className="p-4 bg-gray-50/55 dark:bg-zinc-950/40 border border-gray-200/80 dark:border-zinc-850 rounded-xl space-y-3 relative group"
              >
                {/* Line Header controls */}
                <div className="flex flex-wrap items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    {/* Speaker name */}
                    <input
                      type="text"
                      value={line.speaker}
                      onChange={(e) => handleLineChange(line.id, "speaker", e.target.value)}
                      placeholder="Nama Aktor"
                      className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800/80 rounded px-2 py-1 text-xs font-bold text-gray-800 dark:text-zinc-100 w-24 outline-none focus:border-indigo-400"
                    />

                    {/* Voice selector */}
                    <select
                      value={line.voiceName}
                      onChange={(e) => handleLineChange(line.id, "voiceName", e.target.value)}
                      className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800/80 rounded px-2 py-1 text-[10px] font-bold text-gray-600 dark:text-zinc-355 outline-none focus:border-indigo-400"
                    >
                      {VOICES.map((v) => (
                        <option key={v.id} value={v.id}>
                          Vokal {v.name}
                        </option>
                      ))}
                    </select>

                    {/* Tone Selector */}
                    <select
                      value={line.tone}
                      onChange={(e) => handleLineChange(line.id, "tone", e.target.value)}
                      className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800/80 rounded px-2 py-1 text-[10px] font-medium text-gray-650 dark:text-zinc-355 outline-none focus:border-indigo-400"
                    >
                      {TONES.map((t) => (
                        <option key={t.id} value={t.id}>
                          Nada: {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {dialogue.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(line.id)}
                      className="p-1 px-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-all text-xs"
                      title="Hapus baris dialog"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Line Dialogue Text */}
                <textarea
                  value={line.text}
                  onChange={(e) => handleLineChange(line.id, "text", e.target.value.slice(0, 300))}
                  placeholder={`Spontanitas percakapan dari ${line.speaker}...`}
                  rows={2}
                  className="w-full resize-none border border-gray-200 dark:border-zinc-800 px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 text-xs text-gray-700 dark:text-zinc-200 outline-none focus:border-indigo-500/80 placeholder-gray-400"
                />
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-zinc-850">
            <button
              type="button"
              onClick={handleAddLine}
              className="px-4 py-3 border border-dashed border-gray-300 dark:border-zinc-800 text-gray-650 dark:text-zinc-400 hover:text-indigo-650 dark:hover:text-indigo-400 hover:border-indigo-400 dark:hover:border-indigo-850 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 flex-1 transition-all"
            >
              <Plus className="w-4 h-4" /> Tambah Baris Aktor
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleGenerateScript}
              className={`flex-1 py-3 px-5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 text-white transition-all shadow-md ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-650 hover:bg-indigo-700 bg-gradient-to-r from-indigo-650 to-indigo-600 active:scale-[0.98]"
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Mensintesis Percakapan...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" /> Satukan & Rekam Percakapan
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50/80 border border-red-200 dark:bg-red-950/10 dark:border-red-900/40 rounded-xl text-xs text-red-650 dark:text-red-400 flex items-start gap-2 animate-pulse">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}
        </div>

        {/* Audio Player Card */}
        {audioUrl && (
          <div className="bg-gradient-to-r from-gray-50 to-indigo-50/20 dark:from-zinc-900/60 dark:to-indigo-950/10 border border-indigo-100 dark:border-zinc-800/80 rounded-2xl p-5 space-y-4 shadow-sm animate-fadeIn">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-400">Hasil Rekaman Percakapan</h4>
                <p className="text-[10px] text-gray-400">Total Durasi: {formatTime(duration)} detik | Multi-Aktor</p>
              </div>
              <a
                href={audioUrl}
                download={`Gemini-Dialogue-${Date.now()}.wav`}
                className="p-2 bg-white dark:bg-zinc-950 hover:bg-gray-55 dark:hover:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border border-gray-150 dark:border-zinc-800 rounded-xl transition-all shadow-sm flex items-center justify-center text-xs font-bold gap-1.5"
              >
                <Download className="w-4 h-4" /> Download Format WAV
              </a>
            </div>

            {/* Timeline Wavebar */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-650 text-white shadow-md active:scale-95 transition-all hover:bg-indigo-700"
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                </button>

                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-[10px] font-semibold text-gray-500 font-mono">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={duration || 1}
                    step="0.05"
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1 bg-gray-200 dark:bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>

              {/* Wav visualizer */}
              <WaveformVisualizer isPlaying={isPlaying} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
