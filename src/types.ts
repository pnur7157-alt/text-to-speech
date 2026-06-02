export interface VoiceOption {
  id: string;
  name: string;
  gender: "Male" | "Female" | "Neutral";
  description: string;
  tags: string[];
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  accents: string[];
}

export interface ToneOption {
  id: string;
  name: string;
  description: string;
  instructions: string;
}

export interface DialogueLine {
  id: string;
  speaker: string;
  voiceName: string; // "Puck" | "Charon" | "Kore" | "Fenrir" | "Zephyr"
  tone: string;
  text: string;
}

export interface TTSHistoryItem {
  id: string;
  type: "single" | "multi";
  inputText: string;
  language: string;
  accent: string;
  tone: string;
  voiceName: string;
  audioUrl: string;
  timestamp: string;
  wordCount: number;
  duration?: number; // optional in seconds
  dialogue?: DialogueLine[];
}

export interface TextPreset {
  id: string;
  title: string;
  category: "Announcement" | "Storytelling" | "Formal" | "Whisper" | "Multi-Speaker";
  language: string;
  text: string;
  accent?: string;
  tone?: string;
  voiceName?: string;
  dialogue?: Omit<DialogueLine, "id">[];
}
