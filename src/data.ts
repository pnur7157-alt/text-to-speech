import { VoiceOption, LanguageOption, ToneOption, TextPreset } from "./types";

export const VOICES: VoiceOption[] = [
  {
    id: "Zephyr",
    name: "Zephyr",
    gender: "Neutral",
    description: "Suara hangat berkharisma, seimbang, dan ekspresif. Sangat baik untuk narasi, podcast, dan membacakan dongeng.",
    tags: ["Narasi", "Hangat", "Moderator"],
  },
  {
    id: "Kore",
    name: "Kore",
    gender: "Male",
    description: "Suara pria yang dalam, lembut, dan penuh kehangatan. Cocok untuk panduan meditasi, intonasi bersahabat, atau pembaca berita.",
    tags: ["Dalam", "Tenang", "Pria"],
  },
  {
    id: "Puck",
    name: "Puck",
    gender: "Female",
    description: "Suara wanita yang ceria, cerdas, dan penuh energi hidup. Sempurna untuk percakapan kasual, konten kreatif, dan asisten digital.",
    tags: ["Ceria", "Terang", "Interaktif"],
  },
  {
    id: "Charon",
    name: "Charon",
    gender: "Male",
    description: "Suara formal dengan artikulasi yang jernih, kuat, dan mantap. Pilihan utama untuk presentasi korporat dan materi pembelajaran ilmiah.",
    tags: ["Formal", "Wibawa", "Jelas"],
  },
  {
    id: "Fenrir",
    name: "Fenrir",
    gender: "Male",
    description: "Suara pria yang dramatis, bertekstur, sedikit serak (husky). Memberikan kedalaman emosional tinggi pada dialog fiksi atau monolog singkat.",
    tags: ["Drama", "Husky", "Sinematik"],
  },
];

export const LANGUAGES: LanguageOption[] = [
  {
    code: "id",
    name: "Bahasa Indonesia",
    nativeName: "Bahasa Indonesia",
    accents: ["Logat Standar Baku", "Logat Jawa (Medok)", "Logat Batak", "Logat Sunda", "Logat Melayu"],
  },
  {
    code: "en",
    name: "Bahasa Inggris",
    nativeName: "English",
    accents: ["Aksen Amerika (General American)", "Aksen Inggris (British Received Pronunciation)", "Aksen Australia (Aussie Accent)", "Aksen India (Indian English)"],
  },
  {
    code: "ja",
    name: "Bahasa Jepang",
    nativeName: "日本語",
    accents: ["Aksen Tokyo (Standar)", "Aksen Kyoto (Kansai-ben)", "Aksen Jepang-Inggris (Khas Jepang berbicara Inggris)"],
  },
  {
    code: "ar",
    name: "Bahasa Arab",
    nativeName: "العربية",
    accents: ["Aksen Hijazi (Saudi Arabia)", "Aksen Mesir (Masri)", "Aksen Arab Standar Modern (Fusha)"],
  },
  {
    code: "ko",
    name: "Bahasa Korea",
    nativeName: "한국어",
    accents: ["Aksen Seoul Standard", "Aksen Busan Dialect", "Aksen Lembut Melankolis"],
  },
  {
    code: "fr",
    name: "Bahasa Prancis",
    nativeName: "Français",
    accents: ["Aksen Paris Standard", "Aksen Quebecois (Kanada)", "Aksen Sopan & Lembut"],
  },
  {
    code: "es",
    name: "Bahasa Spanyol",
    nativeName: "Español",
    accents: ["Aksen Madrid (Castilian)", "Aksen Meksiko (Latino)", "Aksen Cepat & Bersemangat"],
  },
];

export const TONES: ToneOption[] = [
  {
    id: "natural",
    name: "Alami & Santai",
    description: "Intonasi harian yang rileks seperti berbicara santai dengan teman dekat.",
    instructions: "natural, flowing, balanced, non-robotic",
  },
  {
    id: "cheerful",
    name: "Gembira & Ceria",
    description: "Nada bersemangat, cerah, penuh senyum, meningkatkan energi pendengar.",
    instructions: "cheerful, bright, excited, high emotional energy, with a smiling voice",
  },
  {
    id: "formal",
    name: "Resmi & Berwibawa",
    description: "Artikulasi yang rapi, nada serius, sangat cocok untuk pengumuman atau presentasi.",
    instructions: "professional, formal, authoratitative, precise, clear pacing",
  },
  {
    id: "whisper",
    name: "Bisikan Lembut",
    description: "Volume intim, hening, penuh kehangatan, sangat pas untuk relaksasi atau asmr.",
    instructions: "whisper tone, soft and intimate, low-volume airiness, calming and gentle",
  },
  {
    id: "excited",
    name: "Sangat Bersemangat",
    description: "Nada tinggi yang penuh kegembiraan dan dinamisme. Cocok untuk iklan atau panggilan aksi.",
    instructions: "extremely enthusiastic, high-impact verbal expression, dynamic and fast-paced",
  },
  {
    id: "sad",
    name: "Sedih & Melankolis",
    description: "Tempo yang agak melambat dengan jeda panjang, penuh empati dan rasa kecewa mendalam.",
    instructions: "deeply sad, melancholic pacing, empathetic, with heavy breaths and emotional pain",
  },
  {
    id: "storytelling",
    name: "Gaya Mendongeng",
    description: "Sarat imajinasi dengan penekanan pada kata kunci dramatik, membuat petualangan hidup.",
    instructions: "storyteller style, rich imaginations, dramatic pauses, high-contrast emotional swings",
  },
];

export const PRESETS: TextPreset[] = [
  {
    id: "preset-1",
    title: "Pengumuman Bandara Internasional",
    category: "Announcement",
    language: "Bahasa Indonesia",
    accent: "Logat Standar Baku",
    tone: "Resmi & Berwibawa",
    voiceName: "Charon",
    text: "Perhatian kepada para penumpang pesawat udara Garuda Indonesia dengan nomor penerbangan G-A delapan satu dua tujuan Denpasar Bali. Pintu keberangkatan telah dibuka di Gate empat B. Silakan mempersiapkan kartu pas naik dan dokumen identitas Anda untuk pemeriksaan. Terima kasih.",
  },
  {
    id: "preset-2",
    title: "Kisah Kancil & Buaya (Dongeng Alami)",
    category: "Storytelling",
    language: "Bahasa Indonesia",
    accent: "Logat Sunda",
    tone: "Gaya Mendongeng",
    voiceName: "Zephyr",
    text: "Di tepi sebuah hutan rimba yang rindang, mengalirlah sebuah sungai berair jernih yang sangat lebar. Di sanalah sang Kancil yang cerdik melepas penat di bawah pohon rindang. Sambil mengunyah rerumputan hijau, matanya tertuju pada barisan pohon buah segar di seberang sungai. Namun... ada banyak sekali buaya lapar yang menanti di dalam air. Bagaimana ya, kancil menyeberanginya?",
  },
  {
    id: "preset-3",
    title: "Bisikan Asmaradhana (ASMR Shalat Malam)",
    category: "Whisper",
    language: "Bahasa Indonesia",
    accent: "Logat Standar Baku",
    tone: "Bisikan Lembut",
    voiceName: "Puck",
    text: "Ketika malam telah larut... dan bising dunia mulai memudar. Pejamkanlah matamu perlahan. Tarik napas dalam-dalam, lalu embuskan secara perlahan. Rasakan keheningan malam ini menyelimuti dirimu dengan kedamaian utuh. Kamu sudah menunaikan hari ini dengan sangat baik. Sekarang, saatnya beristirahat.",
  },
  {
    id: "preset-4",
    title: "English Presentation (UK Posh)",
    category: "Formal",
    language: "Bahasa Inggris",
    accent: "Aksen Inggris (British Received Pronunciation)",
    tone: "Resmi & Berwibawa",
    voiceName: "Charon",
    text: "Good afternoon, ladies and gentlemen. Today, I would like to showcase our recent milestones in artificial intelligence. By emphasizing native phonetics and breathing tempos, our latest speech generation network completely minimizes any computational delay, yielding an exceptionally smooth and human-like output. Enjoy the speech.",
  },
  {
    id: "preset-5",
    title: "Podcast Diskusi Kopi Malam (Dialog)",
    category: "Multi-Speaker",
    language: "Bahasa Indonesia",
    accent: "Logat Standar Baku",
    tone: "Alami & Santai",
    voiceName: "Zephyr",
    text: "",
    dialogue: [
      {
        speaker: "Riko",
        voiceName: "Kore",
        tone: "Alami & Santai",
        text: "Kopi buatanmu malam ini aromanya harum sekali, Sarah. Kamu pakai biji kopi apa?",
      },
      {
        speaker: "Sarah",
        voiceName: "Puck",
        tone: "Gembira & Ceria",
        text: "Wah, jeli sekali kamu! Ini biji kopi arabika lokal dari pegunungan Sindoro, dipanggang dengan tingkat kematangan medium.",
      },
      {
        speaker: "Riko",
        voiceName: "Kore",
        tone: "Bisikan Lembut",
        text: "Pantas rasanya lembut sekali di lidah, ada sedikit rasa manis buah di ujungnya. Sangat cocok dinikmati sambil berbincang di tengah rintik hujan ini.",
      },
    ],
  },
];
