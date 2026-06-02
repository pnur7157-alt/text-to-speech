import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));

  // Initialize Gemini API client on the server
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  // Single speaker TTS endpoint
  app.post("/api/tts", async (req, res) => {
    try {
      const { text, voiceName, language, accent, tone, speed } = req.body;

      if (!text || typeof text !== "string" || text.trim() === "") {
        return res.status(400).json({ error: "Text is required and cannot be empty." });
      }

      if (!apiKey) {
        return res.status(500).json({ 
          error: "GEMINI_API_KEY is not configured on the server. Please add your key in Settings > Secrets." 
        });
      }

      const validVoices = ["Puck", "Charon", "Kore", "Fenrir", "Zephyr"];
      const selectedVoice = validVoices.includes(voiceName) ? voiceName : "Zephyr";

      const accentInstr = accent ? `with a highly realistic ${accent} accent` : "";
      const toneInstr = tone ? `in an extremely realistic, expressive, and natural ${tone} tone` : "in a natural, flowing, human-like voice style";
      const languageInstr = language ? `in the ${language} language, obeying precise pronunciation rules` : "";
      const speedInstr = speed ? `at ${speed} speed` : "at a natural, conversational speaking pace";

      // Formulate detailed, expressive TTS instruction prompt
      const instruction = `Please pronounce the following text clearly and realistically. Emulate natural human breathing, lifelike cadences, and human-like emotional delivery.
Parameters:
- Voice Persona: ${selectedVoice}
- Tone / Emotion: ${toneInstr}
- Accent / Regionality: ${accentInstr}
- Language: ${languageInstr}
- Pace / Tempo: ${speedInstr}

Read the text exactly. Do not add any introductory or ending sentences, only speak the text.

Text to pronouce:
"${text}"`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: instruction }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: selectedVoice },
            },
          },
        },
      });

      const rawPcmBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!rawPcmBase64) {
        return res.status(500).json({ error: "Failed to generate realistic speech. Model did not return audio data." });
      }

      // Convert raw PCM to a valid WAV file with a single channel at 24000Hz
      const pcmBuffer = Buffer.from(rawPcmBase64, "base64");
      const wavBuffer = addWavHeader(pcmBuffer, 24000);
      const wavBase64 = wavBuffer.toString("base64");

      return res.json({
        audio: wavBase64,
        format: "audio/wav",
        promptUsed: instruction,
        wordCount: text.split(/\s+/).length,
      });

    } catch (error: any) {
      console.error("TTS single endpoint error:", error);
      return res.status(500).json({ error: error.message || "An unexpected error occurred during TTS synthesis." });
    }
  });

  // Multi-Speaker generated conversational dialogue endpoint
  app.post("/api/multi-tts", async (req, res) => {
    try {
      const { dialogue, language, accent, speed, context } = req.body;

      if (!dialogue || !Array.isArray(dialogue) || dialogue.length === 0) {
        return res.status(400).json({ error: "A valid list of dialogue turns is required." });
      }

      if (!apiKey) {
        return res.status(500).json({ 
          error: "GEMINI_API_KEY is not configured on the server. Please add your key in Settings > Secrets." 
        });
      }

      const validVoices = ["Puck", "Charon", "Kore", "Fenrir", "Zephyr"];
      const speakerVoiceConfigs = dialogue.map((line: any, idx: number) => {
        const name = line.speaker || `Speaker ${idx + 1}`;
        const selectedVoice = validVoices.includes(line.voiceName) ? line.voiceName : validVoices[idx % validVoices.length];
        return {
          speaker: name,
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoice },
          },
        };
      });

      const speedText = speed ? `at ${speed} speed` : "at standard speaking pace";
      const accentText = accent ? `with highly natural ${accent} accents` : "";
      const languageText = language ? `in ${language} language` : "";
      const contextText = context ? `Context / Scenario is: ${context}` : "A realistic conversation between the speakers.";

      const scriptLines = dialogue.map((line: any, idx: number) => {
        const speaker = line.speaker || `Speaker ${idx + 1}`;
        const toneText = line.tone ? `(${line.tone})` : "";
        return `${speaker}: ${toneText} ${line.text}`;
      }).join("\n");

      // System instruction for multi-speaker TTS model
      const prompt = `Perform a high-fidelity natural recording of the scripted dialogue below.
Ensure realistic conversation pacing, subtle pause transitions between shifts, human-like cadence, and authentic vocal emotions according to the script tags.
General Parameters:
- Scenario context: ${contextText}
- Core language: ${languageText}
- General accent profile: ${accentText}
- Reading speed: ${speedText}

DIALOGUE SCRIPT:
${scriptLines}

Obey the dialogue speakers and texts strictly. Generate full-fidelity multi-speaker audio and do not append or speak any extra metadata words.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: speakerVoiceConfigs,
            },
          },
        },
      });

      const rawPcmBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!rawPcmBase64) {
        return res.status(500).json({ error: "Failed to generate multi-speaker dialogue speech." });
      }

      const pcmBuffer = Buffer.from(rawPcmBase64, "base64");
      const wavBuffer = addWavHeader(pcmBuffer, 24000);
      const wavBase64 = wavBuffer.toString("base64");

      return res.json({
        audio: wavBase64,
        format: "audio/wav",
        promptUsed: prompt,
      });

    } catch (error: any) {
      console.error("Multi-speaker TTS endpoint error:", error);
      return res.status(500).json({ error: error.message || "An error occurred during conversational compilation." });
    }
  });

  // Setup Vite development server or production static serving middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TTS Server is running on port ${PORT}`);
  });
}

/**
 * Packs 16-bit Mono Linear PCM data buffer into a playable WAV container.
 */
function addWavHeader(pcmBuffer: Buffer, sampleRate: number = 24000): Buffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const subChunk2Size = pcmBuffer.length;
  const chunkSize = 36 + subChunk2Size;

  const header = Buffer.alloc(44);
  header.write("RIFF", 0);                  // ChunkID
  header.writeUInt32LE(chunkSize, 4);       // ChunkSize (file size - 8)
  header.write("WAVE", 8);                  // Format
  header.write("fmt ", 12);                 // Subchunk1ID
  header.writeUInt32LE(16, 16);             // Subchunk1Size (16 for PCM)
  header.writeUInt16LE(1, 20);              // AudioFormat (1 for uncompressed PCM)
  header.writeUInt16LE(numChannels, 22);    // NumChannels
  header.writeUInt32LE(sampleRate, 24);    // SampleRate
  header.writeUInt32LE(byteRate, 28);      // ByteRate
  header.writeUInt16LE(blockAlign, 32);     // BlockAlign
  header.writeUInt16LE(bitsPerSample, 34);  // BitsPerSample
  header.write("data", 36);                 // Subchunk2ID
  header.writeUInt32LE(subChunk2Size, 40);  // Subchunk2Size

  return Buffer.concat([header, pcmBuffer]);
}

startServer();
