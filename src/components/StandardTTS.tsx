import React, { useState, useRef, useEffect } from "react";
import { VOICES, LANGUAGES, TONES, PRESETS } from "../data";
import { VoiceOption, LanguageOption, ToneOption } from "../types";
import WaveformVisualizer from "./WaveformVisualizer";
import { Play, Pause, Download, Sparkles, Volume2, RotateCcw, AlertCircle, RefreshCw } from "lucide-react";

interface StandardTTSProps {
  onAddHistory: (item: any) => void;
}

export default function StandardTTS({ onAddHistory }: StandardTTSProps) {
  const [text, setText] = useState<string>("");
  const [selectedVoice, setSelectedVoice] = useState<string>("Zephyr");
  const [selectedLang, setSelectedLang] = useState<string>("id");
  const [selectedAccent, setSelectedAccent] = useState<string>("Logat Standar Baku");
  const [selectedTone, setSelectedTone] = useState<string>("natural");
  const [selectedSpeed, setSelectedSpeed] = useState<string>("normal");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Audio Playback states
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [base64Audio, setBase64Audio] = useState<string | null>(null);
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

  // Audio playback event listeners
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
      setError("Kesalahan saat memuat media file audio.");
      setIsPlaying(false);
    };
  };

  // Generate Speech Callback
  const handleGenerate = async () => {
    if (!text.trim()) {
      setError("Masukkan teks terlebih dahulu sebelum melakukan generate.");
      return;
    }

    setLoading(true);
    setError(null);
    setIsPlaying(false);
    setCurrentTime(0);

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          voiceName: selectedVoice,
          language: LANGUAGES.find((l) => l.code === selectedLang)?.name || "Indonesian",
          accent: selectedAccent,
          tone: TONES.find((t) => t.id === selectedTone)?.name || "Natural",
          speed: selectedSpeed,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal melakukan generate model.");
      }

      const base64Str = data.audio;
      setBase64Audio(base64Str);

      const blobUrl = `data:audio/wav;base64,${base64Str}`;
      setAudioUrl(blobUrl);

      // Stop previous playing audio
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(blobUrl);
      audioRef.current = audio;
      setupAudioListeners(audio);

      // Save to parent history
      onAddHistory({
        id: Math.random().toString(36).substr(2, 9),
        type: "single",
        inputText: text.trim(),
        language: LANGUAGES.find((l) => l.code === selectedLang)?.name || "Indonesian",
        accent: selectedAccent,
        tone: TONES.find((t) => t.id === selectedTone)?.name || "Natural",
        voiceName: selectedVoice,
        audioUrl: blobUrl,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        wordCount: text.trim().split(/\s+/).length,
      });

      // Auto start playing
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn("Auto-play blocked or failed", e);
      });

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal menghubungkan ke server.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle Play / Pause
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

  // Seekbar Handlers
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const seekTime = parseFloat(e.target.value);
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  // Format second parameters
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  // Load standard Text Preset
  const handleLoadPreset = (preset: typeof PRESETS[0]) => {
    setText(preset.text);
    if (preset.language === "Bahasa Indonesia") setSelectedLang("id");
    else if (preset.language === "Bahasa Inggris") setSelectedLang("en");
    
    if (preset.voiceName) setSelectedVoice(preset.voiceName);
    
    // Attempt matching accent
    if (preset.accent) {
      setSelectedAccent(preset.accent);
    }
    
    // Attempt matching tone
    const matchedTone = TONES.find((t) => t.name === preset.tone);
    if (matchedTone) {
      setSelectedTone(matchedTone.id);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Parameters Panel */}
      <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-2xl shadow-sm p-6 space-y-6">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-gray-500 uppercase dark:text-zinc-400 flex items-center gap-1.5 mb-1">
            <Volume2 className="w-4 h-4 text-indigo-500" /> Pengaturan Suara
          </h2>
          <p className="text-xs text-gray-400">Atur parameter vokal agar pas dengan suasana suara.</p>
        </div>

        {/* Language & Accent Select */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Bahasa Utama</label>
            <div className="grid grid-cols-4 lg:grid-cols-3 gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setSelectedLang(lang.code)}
                  className={`px-3 py-1.5 text-xs text-center rounded-lg transition-all border font-medium ${
                    selectedLang === lang.code
                      ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 ring-1 ring-indigo-150"
                      : "bg-gray-50 dark:bg-zinc-800/60 border-gray-200 dark:border-zinc-800 text-gray-650 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span className="block truncate font-semibold">{lang.name.replace("Bahasa ", "")}</span>
                  <span className="block text-[10px] text-gray-400 font-normal">{lang.nativeName}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Variasi Aksen / Dialek</label>
            <select
              value={selectedAccent}
              onChange={(e) => setSelectedAccent(e.target.value)}
              className="w-full text-xs font-medium bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 outline-none text-gray-700 dark:text-zinc-300 focus:border-indigo-500"
            >
              {currentLangObj?.accents.map((acc) => (
                <option key={acc} value={acc}>
                  {acc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tone Selection */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Emosi & Gaya Bicara</label>
          <div className="grid grid-cols-2 gap-2">
            {TONES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTone(t.id)}
                className={`p-2.5 rounded-xl border text-left transition-all relative ${
                  selectedTone === t.id
                    ? "bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/80 text-indigo-900 dark:text-indigo-400"
                    : "bg-gray-50/60 dark:bg-zinc-800/30 border-gray-100 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/40"
                }`}
              >
                <div className="text-xs font-semibold">{t.name}</div>
                <div className="text-[10px] text-gray-400 dark:text-zinc-400 mt-0.5 line-clamp-1 truncate">{t.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Premium Persona Voice Grid */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Karakter Pengisi Suara (Voice Persona)</label>
          <div className="space-y-2.5">
            {VOICES.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVoice(v.id)}
                className={`w-full p-3 rounded-xl border text-left transition-all flex justify-between items-start ${
                  selectedVoice === v.id
                    ? "bg-gradient-to-r from-indigo-50/50 to-teal-50/30 dark:from-indigo-950/20 dark:to-teal-950/10 border-indigo-200 dark:border-indigo-800 ring-1 ring-indigo-200/50"
                    : "bg-gray-50/40 dark:bg-zinc-800/20 border-gray-150 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800"
                }`}
              >
                <div className="max-w-[75%]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-800 dark:text-zinc-200">{v.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${
                      v.gender === "Female" 
                        ? "bg-pink-100 dark:bg-pink-950/30 text-pink-700 dark:text-pink-400" 
                        : v.gender === "Male"
                        ? "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400"
                        : "bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400"
                    }`}>{v.gender}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {v.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1 justify-end max-w-[25%] pointer-events-none">
                  {v.tags.slice(0, 1).map((tg) => (
                    <span key={tg} className="text-[9px] bg-gray-200/70 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 px-1.5 py-0.5 rounded">
                      {tg}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Speed Parameters */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Kecepatan Membaca (Speed / Tempo)</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: "very slow", val: "0.75x" },
              { id: "slow", val: "0.9x" },
              { id: "normal", val: "1.0x" },
              { id: "fast", val: "1.2x" },
            ].map((sp) => (
              <button
                key={sp.id}
                type="button"
                onClick={() => setSelectedSpeed(sp.id)}
                className={`py-1.5 text-xs text-center font-semibold rounded-lg border transition-all ${
                  selectedSpeed === sp.id
                    ? "bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-900 text-teal-800 dark:text-teal-400"
                    : "bg-gray-50/60 dark:bg-zinc-800/40 border-gray-200/80 dark:border-zinc-800 text-gray-600 dark:text-zinc-300"
                }`}
              >
                {sp.val}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Editor & Player Panel */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* Presets Grid */}
        <div className="bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-gray-150/60 dark:border-zinc-800">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Pilih Contoh Teks Preset</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {PRESETS.filter((p) => p.category !== "Multi-Speaker").map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleLoadPreset(p)}
                className="p-2.5 text-left text-xs bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800/80 rounded-xl hover:border-indigo-400 transition-all flex justify-between items-center group shadow-sm"
              >
                <div>
                  <div className="font-bold text-gray-700 dark:text-zinc-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{p.title}</div>
                  <div className="text-[10px] text-gray-400 dark:text-zinc-400 mt-0.5">{p.category} | {p.language.replace("Bahasa ", "")}</div>
                </div>
                <Sparkles className="w-3.5 h-3.5 text-gray-350 opacity-0 group-hover:opacity-100 transition-all text-indigo-500" />
              </button>
            ))}
          </div>
        </div>

        {/* Text Area Card */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-sm p-6 flex flex-col gap-4 flex-1">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Teks Yang Ingin Disuarakan</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium ${
              text.length > 900 ? "bg-red-50 text-red-650" : "bg-gray-100 dark:bg-zinc-800/80 text-gray-500"
            }`}>
              {text.length}/1000 karakter
            </span>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 1000))}
            placeholder="Tulis atau paste teks Anda di sini... gunakan bahasa apa saja, system akan menghasilkan suara dengan artikulasi alami dan hembusan napas yang realistis."
            className="w-full h-44 resize-none bg-gray-50 dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-850 rounded-xl p-4 text-sm text-gray-700 dark:text-zinc-200 outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/10 placeholder-gray-400 flex-1 leading-relaxed"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setText("")}
              className="px-3.5 py-3 border border-gray-150-none bg-white dark:bg-zinc-900 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl text-xs text-gray-500 hover:text-gray-700 font-semibold flex items-center gap-1 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Bersihkan
            </button>

            <button
              type="button"
              disabled={loading || !text.trim()}
              onClick={handleGenerate}
              className={`flex-1 py-3 px-5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 text-white transition-all shadow-md ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : text.trim() === ""
                  ? "bg-gray-300 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 shadow-none cursor-not-allowed"
                  : "bg-indigo-650 hover:bg-indigo-700 hover:shadow-indigo-550/20 bg-gradient-to-r from-indigo-650 to-indigo-600 active:scale-[0.98]"
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Sedang Mensintesis Suara...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" /> Sintesis Suara Natural via Gemini
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
                <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-400">Audio Preview Terbuat</h4>
                <p className="text-[10px] text-gray-400">Pembicara: {selectedVoice} | {formatTime(duration)} detik</p>
              </div>
              <a
                href={audioUrl}
                download={`Gemini-TTS-${selectedVoice}-${Date.now()}.wav`}
                className="p-2 bg-white dark:bg-zinc-950 hover:bg-gray-55 dark:hover:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border border-gray-150 dark:border-zinc-800 rounded-xl transition-all shadow-sm flex items-center justify-center text-xs font-bold gap-1.5"
              >
                <Download className="w-4 h-4" /> Download WAV
              </a>
            </div>

            {/* Custom Interactive Player Controls */}
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

              {/* Decorative Audio Wave animation */}
              <WaveformVisualizer isPlaying={isPlaying} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
