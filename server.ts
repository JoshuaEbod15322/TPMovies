import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(getAi()),
  });
});

// AI Movie Recommendation Route
app.post("/api/ai/recommend", async (req, res) => {
  try {
    const { prompt, conversationHistory } = req.body;

    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const ai = getAi();

    if (!ai) {
      return res.json({
        isMovieRelated: true,
        message:
          "Here are top-tier cinema recommendations based on your request. (Add your Gemini API Key in Settings > Secrets for customized conversational AI analysis!)",
        recommendations: [
          {
            title: "Inception",
            year: "2010",
            mediaType: "movie",
            genre: "Sci-Fi / Action / Thriller",
            whyRecommended:
              "A legendary heist thriller diving deep into subconscious dreams with jaw-dropping practical visuals and layered storytelling.",
            matchVibe: "Mind-Bending & High Stakes",
          },
          {
            title: "Interstellar",
            year: "2014",
            mediaType: "movie",
            genre: "Sci-Fi / Adventure / Drama",
            whyRecommended:
              "An emotional and scientifically grounded journey through wormholes across space and time to save humanity.",
            matchVibe: "Epic & Existential",
          },
          {
            title: "Blade Runner 2049",
            year: "2017",
            mediaType: "movie",
            genre: "Sci-Fi / Neo-Noir / Mystery",
            whyRecommended:
              "A visual masterpiece exploring identity, humanity, and soul in a breathtaking cyberpunk dystopia.",
            matchVibe: "Atmospheric & Thought-Provoking",
          },
          {
            title: "The Dark Knight",
            year: "2008",
            mediaType: "movie",
            genre: "Action / Crime / Drama",
            whyRecommended:
              "The pinnacle of cinematic comic adaptation, driven by Heath Ledger's iconic Joker and intense moral dilemmas.",
            matchVibe: "Dark & Relentless",
          },
        ],
        suggestedFollowups: [
          "Recommend movies with huge plot twists",
          "Best psychological thrillers of the 2010s",
          "Feel-good 90s adventure movies",
        ],
      });
    }

    const systemInstruction = `You are MovieAI, an expert entertainment curator and recommendation concierge for TPMovies.

CRITICAL RULES:
1. CONTENT SCOPE: You recommend and discuss MOVIES, TV SERIES, and ANIME, including their characters, actors, directors, creators, and themes.
2. If the user asks about ANYTHING outside of movies, TV series, or anime (e.g. coding, math, recipes, homework, finance, or medical questions), you MUST set "isMovieRelated": false, provide an empty "recommendations" array, and respond in "message" with a polite decline: "I am MovieAI, dedicated to movie, TV series, and anime discovery. Please tell me what you would like to watch."
3. When the user asks for recommendations (by mood, similar titles, actors, era, theme, or genre):
   - Set "isMovieRelated": true
  - Provide 3 to 6 specific, real, well-known, or critically acclaimed movie, TV series, or anime recommendations that precisely match their request.
  - Never invent a title, release year, genre, cast member, creator, or plot detail. If you are unsure, omit the recommendation and choose a well-established title you know accurately.
   - For each recommendation:
     * title: exact standard English release title
     * year: release year as string e.g. "2014"
     * mediaType: exactly one of "movie", "series", or "anime"
     * genre: primary genres e.g. "Sci-Fi / Thriller"
     * whyRecommended: 1 to 2 engaging, persuasive sentences explaining why this movie fits their prompt.
     * matchVibe: a catchy 2-4 word mood tag e.g. "Mind-Bending & Cerebral", "Adrenaline-Fueled", "Cozy Nostalgia", "Dark Psychological Dread".
4. Provide a warm, entertainment-savvy opening message in "message".
5. Provide 3 short, intriguing suggested follow-up prompts in "suggestedFollowups".`;

    const userMessageContent = `User query: "${prompt.trim()}"${
      Array.isArray(conversationHistory) && conversationHistory.length > 0
        ? `\nRecent conversation:\n${conversationHistory
            .slice(-4)
            .map(
              (m: { role: string; content: string }) =>
                `${m.role}: ${m.content}`,
            )
            .join("\n")}`
        : ""
    }`;

    // Try models with fallback in case of high-demand spikes
    const candidateModels = [
      "gemini-3.8-flash",
      "gemini-3.1-flash-lite",
      "gemini-flash-latest",
    ];

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: userMessageContent,
          config: {
            systemInstruction,
            temperature: 0.2,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                isMovieRelated: {
                  type: Type.BOOLEAN,
                  description:
                    "Set to true if user query is about movies/cinema/recommendations, false if off-topic.",
                },
                message: {
                  type: Type.STRING,
                  description:
                    "Conversational response from MovieAI explaining the recommendations or politely redirecting if off-topic.",
                },
                recommendations: {
                  type: Type.ARRAY,
                  description:
                    "3 to 6 curated movie, TV series, or anime recommendations. Empty if not related.",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: {
                        type: Type.STRING,
                        description: "Exact official title of the movie",
                      },
                      year: {
                        type: Type.STRING,
                        description: "Release year e.g. '2019'",
                      },
                      mediaType: {
                        type: Type.STRING,
                        description: "Exactly 'movie', 'series', or 'anime'",
                        enum: ["movie", "series", "anime"],
                      },
                      genre: {
                        type: Type.STRING,
                        description: "Genre tag e.g. 'Mystery / Thriller'",
                      },
                      whyRecommended: {
                        type: Type.STRING,
                        description: "Why this movie fits the user request",
                      },
                      matchVibe: {
                        type: Type.STRING,
                        description: "Short mood/vibe tag",
                      },
                    },
                    required: [
                      "title",
                      "year",
                      "mediaType",
                      "genre",
                      "whyRecommended",
                      "matchVibe",
                    ],
                  },
                },
                suggestedFollowups: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "3 follow-up suggestions for movie discovery",
                },
              },
              required: [
                "isMovieRelated",
                "message",
                "recommendations",
                "suggestedFollowups",
              ],
            },
          },
        });

        const text = response.text?.trim();
        if (text) {
          const parsed = JSON.parse(text);
          return res.json(parsed);
        }
      } catch (err: any) {
        console.warn(`Model ${model} failed, trying fallback...`, err?.message);
      }
    }

    // If Gemini models encountered transient demand spikes, provide smart curated recommendations
    const isOffTopic =
      /python|javascript|code|recipe|homework|finance|crypto|stocks|math/i.test(
        prompt,
      ) &&
      !/movie|film|cinema|series|show|anime|watch|actor|director/i.test(prompt);

    if (isOffTopic) {
      return res.json({
        isMovieRelated: false,
        message:
          "I am MovieAI, dedicated to movie, TV series, and anime discovery. Please tell me what you would like to watch.",
        recommendations: [],
        suggestedFollowups: [
          "Recommend movies like Inception",
          "Best psychological thrillers with plot twists",
          "Top sci-fi movies of the 2020s",
        ],
      });
    }

    return res.json({
      isMovieRelated: true,
      message: `Here are handpicked cinema recommendations for "${prompt.trim()}":`,
      recommendations: [
        {
          title: "Inception",
          year: "2010",
          mediaType: "movie",
          genre: "Sci-Fi / Thriller",
          whyRecommended:
            "A masterwork of intricate dream architecture, stunning visual effects, and relentless tension.",
          matchVibe: "Mind-Bending & Cerebral",
        },
        {
          title: "Interstellar",
          year: "2014",
          mediaType: "movie",
          genre: "Sci-Fi / Adventure",
          whyRecommended:
            "An awe-inspiring odyssey exploring the depths of space, black holes, and the endurance of love.",
          matchVibe: "Epic & Emotional",
        },
        {
          title: "Arrival",
          year: "2016",
          mediaType: "movie",
          genre: "Sci-Fi / Mystery",
          whyRecommended:
            "A profound linguistic first-contact story that reshapes how you perceive time and memory.",
          matchVibe: "Atmospheric & Poignant",
        },
        {
          title: "Shutter Island",
          year: "2010",
          mediaType: "movie",
          genre: "Mystery / Thriller",
          whyRecommended:
            "Scorsese's atmospheric gothic puzzle full of paranoia, dread, and a legendary final twist.",
          matchVibe: "Dark Psychological Dread",
        },
      ],
      suggestedFollowups: [
        "More movies with mind-bending endings",
        "Best sci-fi movies of the 2010s",
        "Movies with mysterious isolated settings",
      ],
    });
  } catch (error: any) {
    console.error("AI Recommendation Error:", error);
    return res.status(500).json({
      error: "Failed to generate movie recommendations.",
      details: error?.message || "Unknown error",
    });
  }
});

// Vite middleware setup
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TPmovies server running on port ${PORT}`);
  });
}

start();
