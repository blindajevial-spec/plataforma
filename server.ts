import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { getChileanTerritorialFallback } from "./src/data/chileanTerritorialDirectory";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Helper to initialize GoogleGenAI client on-demand with correct User-Agent telemetry
function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Please configure it in the Settings > Secrets panel.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// -------------------------------------------------------------
// 1. API: Image Generation & Editing (gemini-3.1-flash-image)
// -------------------------------------------------------------
app.post("/api/gemini/generate-image", async (req, res) => {
  try {
    const {
      prompt,
      baseImageBase64, // Optional: if provided, performs Image-to-Image editing
      mimeType = "image/png",
      aspectRatio = "1:1",
      imageSize = "1K",
      style = "photorealistic"
    } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "El prompt descriptivo es requerido." });
    }

    const ai = getGenAIClient();
    const model = "gemini-3.1-flash-image";

    let parts: any[] = [];

    // If an existing image is provided for editing
    if (baseImageBase64) {
      // Clean data URI prefix if present
      const cleanBase64 = baseImageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
      parts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: mimeType || "image/png",
        },
      });
      parts.push({
        text: `Edita esta imagen para Blindaje Vial SpA (sistema chileno de seguridad operacional y control de drogas/alcohol en transporte de pasajeros): ${prompt}. Mantén la máxima calidad y coherencia visual con la normativa de seguridad chilena.`
      });
    } else {
      parts.push({
        text: `Genera una imagen profesional de alta definición para Blindaje Vial SpA (Plataforma y Programa de Seguridad Operacional para Transporte de Pasajeros y Carga en Chile): ${prompt}. Estilo: ${style}, con detalles nítidos, estética corporativa industrial y de seguridad vial.`
      });
    }

    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: (aspectRatio as any) || "1:1",
          imageSize: (imageSize as any) || "1K",
        },
      },
    });

    let generatedImageUrl: string | null = null;
    let textFeedback: string | null = null;

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const mime = part.inlineData.mimeType || "image/png";
          generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          textFeedback = part.text;
        }
      }
    }

    if (!generatedImageUrl) {
      return res.status(500).json({
        error: "El modelo no devolvió datos binarios de imagen.",
        details: textFeedback
      });
    }

    return res.json({
      success: true,
      imageUrl: generatedImageUrl,
      feedback: textFeedback,
      prompt,
      modelUsed: model,
      aspectRatio
    });
  } catch (error: any) {
    const isQuota =
      error?.status === 429 ||
      error?.message?.includes("429") ||
      error?.message?.includes("quota") ||
      error?.message?.includes("RESOURCE_EXHAUSTED");

    if (isQuota) {
      console.warn("Gemini Image API quota limit reached (429 RESOURCE_EXHAUSTED).");
    } else {
      console.error("Error generating/editing image with Gemini:", error);
    }

    return res.status(isQuota ? 429 : 500).json({
      error: isQuota
        ? "Se ha superado temporalmente la cuota de la API de Gemini (Error 429 RESOURCE_EXHAUSTED). Por favor intente más tarde o proporcione una clave con cuota activa en Settings."
        : (error?.message || "Error al procesar la generación o edición de imagen."),
      code: isQuota ? "QUOTA_EXHAUSTED" : (error?.status || "GENERATION_FAILED"),
      isQuotaExceeded: isQuota
    });
  }
});

// -------------------------------------------------------------
// 2. API: Google Maps Grounding (gemini-3.8-flash / googleMaps tool)
// -------------------------------------------------------------
app.post("/api/gemini/maps-grounding", async (req, res) => {
  const {
    query,
    category = "laboratorio", // 'laboratorio' | 'mutualidad' | 'terminal' | 'comisaria' | 'clinica'
    latitude = -33.4489, // Default: Santiago, Chile
    longitude = -70.6693,
    region = "Región Metropolitana"
  } = req.body;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "La consulta de búsqueda geográfica es requerida." });
  }

  try {
    const ai = getGenAIClient();
    const model = "gemini-3.8-flash";

    const promptText = `Eres el Asistente de Geo-Referenciación y Logística Territorial de Blindaje Vial SpA en Chile.
El usuario necesita información geográfica actualizada sobre: "${query}" en la ${region} (categoría: ${category}).

Instrucciones:
1. Identifica laboratorios toxicológicos acreditados (NCh-ISO/IEC 17025 para confirmación de drogas y alcohol), centros de mutualidades (ACHS, Mutual de Seguridad, IST), terminales de buses/garitas de transporte público (Red Movilidad, buses interurbanos) o centros policiales/médicos pertinentes.
2. Proporciona direcciones precisas, comunas, horarios de atención aproximados y tiempos de respuesta habituales en Chile.
3. Menciona la relevancia operativa para el protocolo de Blindaje Vial (derivación de muestras salivales con cadena de custodia, controles preventivos pre-turno o post-accidente).`;

    const response = await ai.models.generateContent({
      model,
      contents: promptText,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: Number(latitude) || -33.4489,
              longitude: Number(longitude) || -70.6693,
            },
          },
        },
      },
    });

    const markdownText = response.text || "No se obtuvieron detalles descriptivos.";
    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;
    const groundingChunks = groundingMetadata?.groundingChunks || [];

    // Extract all structured map links and place sources from groundingChunks
    const extractedPlaces: Array<{ title: string; uri: string; snippet?: string }> = [];

    for (const chunk of groundingChunks) {
      if ((chunk as any).maps) {
        const mapsData = (chunk as any).maps;
        const uri = mapsData.uri || "";
        const title = mapsData.title || "Ubicación en Google Maps";
        let snippet = "";
        if (mapsData.placeAnswerSources?.reviewSnippets && mapsData.placeAnswerSources.reviewSnippets.length > 0) {
          snippet = mapsData.placeAnswerSources.reviewSnippets[0].content || "";
        }
        if (uri) {
          extractedPlaces.push({ title, uri, snippet });
        }
      }
    }

    // If Gemini model returned no places with grounding, supplement with verified Chilean directory
    if (extractedPlaces.length === 0) {
      const fallback = getChileanTerritorialFallback(
        query,
        category,
        region,
        Number(latitude) || -33.4489,
        Number(longitude) || -70.6693
      );
      extractedPlaces.push(...fallback.places);
    }

    return res.json({
      success: true,
      text: markdownText,
      places: extractedPlaces,
      groundingChunks,
      searchCenter: { latitude, longitude, region },
      modelUsed: model,
      isFallback: false
    });
  } catch (error: any) {
    const isQuota =
      error?.status === 429 ||
      error?.message?.includes("429") ||
      error?.message?.includes("quota") ||
      error?.message?.includes("RESOURCE_EXHAUSTED") ||
      error?.status === "RESOURCE_EXHAUSTED";

    console.warn(
      `[Blindaje Vial Geo] Gemini Maps Grounding ${isQuota ? "cuota agotada (429 RESOURCE_EXHAUSTED)" : "no disponible"}. Activando Directorio Territorial Homologado de Contingencia.`
    );

    // Return the high quality Chilean verified directory instead of failing with 500 error
    const fallbackResponse = getChileanTerritorialFallback(
      query,
      category,
      region,
      Number(latitude) || -33.4489,
      Number(longitude) || -70.6693
    );

    return res.json(fallbackResponse);
  }
});

// -------------------------------------------------------------
// Server Start with Vite Middleware
// -------------------------------------------------------------
async function startServer() {
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
    console.log(`Blindaje Vial Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
