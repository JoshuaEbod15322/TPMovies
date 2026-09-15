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
  if (!apiKey || apiKey === "GEMINI_API_KEY" || apiKey.trim() === "") {
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

function getPromptAwareFallbackRecommendations(prompt: string) {
  const query = prompt.toLowerCase();

  const vibeGroups = [
    {
      name: "mind-bending sci-fi",
      keywords: [
        "mind-bending",
        "sci-fi",
        "science fiction",
        "space",
        "time",
        "brain",
        "psychological",
        "existential",
        "dream",
        "intricate",
      ],
      recommendations: [
        {
          title: "Inception",
          year: "2010",
          mediaType: "movie",
          genre: "Sci-Fi / Action / Thriller",
          whyRecommended:
            "A layered, high-concept mind-bender that plays with perception, memory, and impossible architecture.",
          matchVibe: "Mind-Bending & Cerebral",
        },
        {
          title: "Arrival",
          year: "2016",
          mediaType: "movie",
          genre: "Sci-Fi / Drama / Mystery",
          whyRecommended:
            "Beautifully cerebral and intimate, with a careful focus on language, time, and emotional impact.",
          matchVibe: "Thoughtful & Atmospheric",
        },
        {
          title: "Interstellar",
          year: "2014",
          mediaType: "movie",
          genre: "Sci-Fi / Adventure / Drama",
          whyRecommended:
            "A sweeping cosmic journey that mixes scientific wonder, heart, and existential stakes.",
          matchVibe: "Epic & Emotional",
        },
      ],
    },
    {
      name: "dark thriller",
      keywords: [
        "thriller",
        "dark",
        "twist",
        "mystery",
        "crime",
        "suspense",
        "plot twist",
        "psychological",
      ],
      recommendations: [
        {
          title: "Shutter Island",
          year: "2010",
          mediaType: "movie",
          genre: "Mystery / Thriller",
          whyRecommended:
            "A tense, layered psychological puzzle that keeps slipping deeper into paranoia and doubt.",
          matchVibe: "Dark Psychological Dread",
        },
        {
          title: "Se7en",
          year: "1995",
          mediaType: "movie",
          genre: "Crime / Thriller / Mystery",
          whyRecommended:
            "Brutal, stylish, and relentlessly suspenseful, with an unforgettable sense of dread.",
          matchVibe: "Bleak & Relentless",
        },
        {
          title: "Gone Girl",
          year: "2014",
          mediaType: "movie",
          genre: "Thriller / Mystery / Crime",
          whyRecommended:
            "Sharp, clever, and twisty, it turns every assumption into a trap.",
          matchVibe: "Devious & Clever",
        },
      ],
    },
    {
      name: "feel-good action",
      keywords: [
        "action comedy",
        "fun",
        "feel-good",
        "action",
        "comedy",
        "banter",
        "funny",
        "90s",
        "2000s",
      ],
      recommendations: [
        {
          title: "Hot Fuzz",
          year: "2007",
          mediaType: "movie",
          genre: "Action / Comedy / Crime",
          whyRecommended:
            "An energetic, hilarious action spoof with clever writing and a perfect comedy rhythm.",
          matchVibe: "Sharp & Energetic",
        },
        {
          title: "The Nice Guys",
          year: "2016",
          mediaType: "movie",
          genre: "Action / Comedy / Crime",
          whyRecommended:
            "A witty, chaotic buddy comedy with excellent chemistry and a strong sense of momentum.",
          matchVibe: "Funny & Fast",
        },
        {
          title: "Scott Pilgrim vs. The World",
          year: "2010",
          mediaType: "movie",
          genre: "Action / Comedy / Fantasy",
          whyRecommended:
            "Visually wild and insanely fun, with punchy style and great comedic energy.",
          matchVibe: "Chaotic & Stylish",
        },
      ],
    },
    {
      name: "anime",
      keywords: [
        "anime",
        "japanese animation",
        "cartoon",
        "anime series",
        "animation",
      ],
      recommendations: [
        {
          title: "Spirited Away",
          year: "2001",
          mediaType: "anime",
          genre: "Animation / Fantasy / Adventure",
          whyRecommended:
            "A visually stunning and emotionally resonant fantasy that balances wonder, fear, and discovery.",
          matchVibe: "Dreamlike & Magical",
        },
        {
          title: "Attack on Titan",
          year: "2013",
          mediaType: "anime",
          genre: "Action / Drama / Fantasy",
          whyRecommended:
            "Intense, high-stakes, and emotionally devastating, with enormous world-building and tension.",
          matchVibe: "Epic & Brutal",
        },
        {
          title: "Fullmetal Alchemist: Brotherhood",
          year: "2009",
          mediaType: "anime",
          genre: "Action / Adventure / Fantasy",
          whyRecommended:
            "A smart, heartfelt anime packed with big ideas, strong character arcs, and exceptional pacing.",
          matchVibe: "Epic & Rewarding",
        },
      ],
    },
    {
      name: "horror",
      keywords: [
        "horror",
        "scary",
        "haunting",
        "supernatural",
        "tense",
        "creepy",
      ],
      recommendations: [
        {
          title: "The Conjuring",
          year: "2013",
          mediaType: "movie",
          genre: "Horror / Mystery / Thriller",
          whyRecommended:
            "A classic modern haunted-house horror film with genuine tension and relentless atmosphere.",
          matchVibe: "Creepy & Relentless",
        },
        {
          title: "Get Out",
          year: "2017",
          mediaType: "movie",
          genre: "Horror / Thriller / Mystery",
          whyRecommended:
            "Smart, disturbing, and socially sharp, it blends dread with a devastating sense of unease.",
          matchVibe: "Tense & Unsettling",
        },
        {
          title: "Hereditary",
          year: "2018",
          mediaType: "movie",
          genre: "Horror / Drama / Mystery",
          whyRecommended:
            "A deeply unsettling psychological horror that lingers long after the credits end.",
          matchVibe: "Unnerving & Disturbing",
        },
      ],
    },
  ];

  const matchedGroup = vibeGroups.find((group) =>
    group.keywords.some((keyword) => query.includes(keyword)),
  );

  const baseRecommendations = matchedGroup?.recommendations ?? [
    {
      title: "Inception",
      year: "2010",
      mediaType: "movie",
      genre: "Sci-Fi / Action / Thriller",
      whyRecommended:
        "A classic choice for high-concept, visually ambitious cinema with layered storytelling.",
      matchVibe: "Mind-Bending & High Stakes",
    },
    {
      title: "The Dark Knight",
      year: "2008",
      mediaType: "movie",
      genre: "Action / Crime / Drama",
      whyRecommended:
        "A dark, intense, and character-driven blockbuster that balances spectacle with moral complexity.",
      matchVibe: "Dark & Relentless",
    },
    {
      title: "Spirited Away",
      year: "2001",
      mediaType: "anime",
      genre: "Animation / Fantasy / Adventure",
      whyRecommended:
        "A magical, imaginative journey full of wonder, heart, and unforgettable visual detail.",
      matchVibe: "Dreamlike & Enchanting",
    },
  ];

  return {
    isMovieRelated: true,
    message:
      "Here are recommendations tuned to your prompt. Add your Gemini API key for even more tailored AI suggestions.",
    recommendations: baseRecommendations,
    suggestedFollowups: [
      "Recommend more intense thrillers",
      "Best sci-fi movies with mind-bending twists",
      "Great anime with strong emotional payoff",
    ],
  };
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(getAi()),
  });
});

// AI Movie Recommendation Route
app.post(["/api/ai/recommend", "/api/index", "/"], async (req, res) => {
  try {
    const { prompt, conversationHistory } = req.body;

    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const ai = getAi();

    if (!ai) {
      return res.json(getPromptAwareFallbackRecommendations(prompt));
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

    // Use Gemini model IDs that are currently available in the API.
    // Older 2.x IDs return 404s and force the fallback recommendations.
    const candidateModels = [
      "gemini-3.7-flash",
      "gemini-3.6-flash",
      "gemini-3.5-flash",
      "gemini-3.5-flash-lite",
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
      } catch (error: any) {
        console.error("AI Recommendation Error:", error);
        return res.status(500).json({
          error: "Failed to generate movie recommendations.",
          details: error?.message || "Unknown error",
        });
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

    return res.json(getPromptAwareFallbackRecommendations(prompt));
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

// Vercel imports the Express app as a serverless function. Local development
// still starts the HTTP server through the package scripts.
if (process.env.VERCEL !== "1") {
  start();
}

export default app;
