import { useState, useEffect } from "react";
import StandardTTS from "./components/StandardTTS";
import ScriptDirector from "./components/ScriptDirector";
import HistoryList from "./components/HistoryList";
import { TTSHistoryItem } from "./types";
import { Volume2, Sparkles, Languages, Settings2, Code, FileText, CheckCircle } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"standard" | "script">("standard");
  const [history, setHistory] = useState<TTSHistoryItem[]>([]);

  // Load history from localStorage on mounting
  useEffect(() => {
    try {
      const stored = localStorage.getItem("gemini_tts_history");
      if (stored) {
        const parsed = JSON.parse(stored);
        // Regenerate Blob URLs from stored base64 strings
        const restored = parsed.map((item: any) => {
          if (item._base64Audio) {
            const byteCharacters = atob(item._base64Audio);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: "audio/wav" });
            const blobUrl = URL.createObjectURL(blob);
            return {
              ...item,
              audioUrl: blobUrl,
            };
          }
          return item;
        });
        setHistory(restored);
      }
    } catch (e) {
      console.warn("Could not load history from localStorage", e);
    }
  }, []);

  // Save history helper (limits to latest 8 recordings to protect localStorage quota limitations)
  const handleAddHistory = (newItem: any) => {
    setHistory((prev) => {
      const updated = [newItem, ...prev].slice(0, 8);
      
      // Attempt caching base64 to localStorage for persistent playbacks
      try {
        const serializable = updated.map((item) => {
          if (item.audioUrl && item.audioUrl.startsWith("data:")) {
            const base64Parts = item.audioUrl.split(",");
            const base64Data = base64Parts[1] || base64Parts[0];
            return {
              ...item,
              audioUrl: "", // Clear URL to avoid storing broken local blobs
              _base64Audio: base64Data, // Save raw base64 data instead
            };
          }
          return item;
        });
        localStorage.setItem("gemini_tts_history", JSON.stringify(serializable));
      } catch (quotaError) {
        console.warn("Storage quota exceeded, caching without raw audio bytes.");
        // Fallback: save meta only
        const metaOnly = updated.map((item) => ({ ...item, audioUrl: "", _base64Audio: "" }));
        localStorage.setItem("gemini_tts_history", JSON.stringify(metaOnly));
      }

      return updated;
    });
  };

  const handleRemoveHistoryItem = (id: string) => {
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      try {
        const serializable = filtered.map((item) => {
          if (item.audioUrl && item.audioUrl.startsWith("data:")) {
            const base64Parts = item.audioUrl.split(",");
            return { ...item, audioUrl: "", _base64Audio: base64Parts[1] || base64Parts[0] };
          }
          return item;
        });
        localStorage.setItem("gemini_tts_history", JSON.stringify(serializable));
      } catch (e) {
        console.error(e);
      }
      return filtered;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem("gemini_tts_history");
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 text-gray-800 dark:text-zinc-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-950 pb-16 transition-colors duration-250">
      {/* Dynamic Top Indicator */}
      <div className="bg-slate-900 text-white text-[11px] font-mono py-1.5 px-4 flex justify-between items-center tracking-wider">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>GEMINI-TTS-3.1 ENGINE ONLINE</span>
        </div>
        <div className="hidden md:flex gap-4 items-center opacity-80">
          <span>LATENCY: LOW (DYNAMIC BREATH)</span>
          <span>STATION ID: CLOUD-API</span>
        </div>
      </div>

      {/* Hero Header */}
      <header className="max-w-7xl mx-auto px-4 pt-10 pb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-150/60 dark:border-zinc-800/50">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2 py-1.5 bg-indigo-600 text-white rounded-xl shadow-lg flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-indigo-50" />
            </div>
            <span className="text-xs font-bold font-mono tracking-widest text-indigo-650 dark:text-indigo-400 uppercase">
              STUDIO AUDIO REALISTIS
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white sm:text-4xl">
            Vocalis AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-teal-500">Natural Speech</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Sintesis teks menjadi suara manusia beresolusi tinggi dengan intonasi emosional alami, hembusan napas halus, pengucapan multi-aksen, dan dukungan bahasa komprehensif didukung Gemini 3.1 TTS.
          </p>
        </div>

        {/* Feature quick badges */}
        <div className="flex flex-wrap gap-2.5 max-w-xs justify-start md:justify-end">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/20 text-indigo-750 dark:text-indigo-450 px-2.5 py-1 rounded-lg border border-indigo-100/50 dark:border-indigo-900/30">
            <Languages className="w-3.5 h-3.5" /> Multi-Language
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-teal-50 dark:bg-teal-950/20 text-teal-750 dark:text-teal-450 px-2.5 py-1 rounded-lg border border-teal-100/50 dark:border-teal-900/30">
            <Sparkles className="w-3.5 h-3.5" /> High Realism
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/20 text-amber-750 dark:text-[#f59e0b] px-2.5 py-1 rounded-lg border border-amber-100/50 dark:border-amber-900/30">
            <Settings2 className="w-3.5 h-3.5" /> Vocal Expressive
          </span>
        </div>
      </header>

      {/* Primary Layout Controls */}
      <main className="max-w-7xl mx-auto px-4 mt-8 space-y-8">
        
        {/* Navigation Switch Tabs */}
        <div className="flex bg-gray-100/80 dark:bg-zinc-900/80 p-1.5 rounded-2xl border border-gray-150 dark:border-zinc-800 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab("standard")}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === "standard"
                ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm font-extrabold scale-[1.02]"
                : "text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200"
            }`}
          >
            <FileText className="w-4 h-4" /> Pembaca Teks (TTS)
          </button>
          <button
            onClick={() => setActiveTab("script")}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === "script"
                ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm font-extrabold scale-[1.02]"
                : "text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200"
            }`}
          >
            <Code className="w-4 h-4" /> Sutradara Naskah (Dialogue)
          </button>
        </div>

        {/* Viewport Render wrapper */}
        <div className="space-y-8 transition-all duration-300">
          {activeTab === "standard" ? (
            <StandardTTS onAddHistory={handleAddHistory} />
          ) : (
            <ScriptDirector onAddHistory={handleAddHistory} />
          )}

          {/* Separation divider card */}
          <div className="border-t border-gray-200/50 dark:border-zinc-850" />

          {/* History Management */}
          <HistoryList
            history={history}
            onRemoveItem={handleRemoveHistoryItem}
            onClearAll={handleClearHistory}
          />

          {/* App Informational section detailing underlying tech */}
          <section className="bg-white dark:bg-zinc-900 border border-gray-105/90 dark:border-zinc-850 p-6 rounded-2xl shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-widest flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> Cara Kerja Vocalis Spektrogram
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <div className="text-xs font-bold text-gray-900 dark:text-zinc-300">1. Konversi Prompt Deskriptif</div>
                <p className="text-[11px] text-gray-400 dark:text-zinc-400 leading-relaxed">
                  Pilihan logat lokal (Jawa, Melayu, dsb.) dan nada bicara (berbisik, mendongeng) disusun menjadi parameter instruksi vokal linguistik khusus sebelum dikirim ke Gemini Neural Network.
                </p>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-gray-900 dark:text-zinc-300">2. Kompilasi Vokal 24kHz</div>
                <p className="text-[11px] text-gray-400 dark:text-zinc-400 leading-relaxed">
                  Model Gemini 3.1 TTS menghasilkan sinyal audio linier beresolusi tinggi 24000 sampel per detik yang mempertahankan hembusan nafas antar klausa secara realistis dan otentik.
                </p>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-gray-900 dark:text-zinc-300">3. Pembuatan Wadah WAV</div>
                <p className="text-[11px] text-gray-400 dark:text-zinc-400 leading-relaxed">
                  Server kami membungkus sinyal PCM biner mentah ke dalam kontainer file RIFF/WAVE 16-bit kompatibel secara instan sehingga dapat langsung dinikmati dan diunduh di semua gawai browser.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
