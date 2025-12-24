import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Model constants
const TEXT_MODEL = 'gemini-3-flash-preview';
const VISION_MODEL = 'gemini-2.5-flash-image';
const SEARCH_MODEL = 'gemini-3-pro-preview';

export interface SearchResult {
  content: string;
  sources: { title: string; uri: string }[];
}

/**
 * Generates a lesson plan (Situació d'Aprenentatge) based on LOMLOE for Valencia.
 */
export const generateLessonPlan = async (topic: string, level: string, context?: string): Promise<string> => {
  const prompt = `
    Actua com un expert docent en Educació Plàstica, Visual i Audiovisual a la Comunitat Valenciana.
    Crea una "Situació d'Aprenentatge" (Lesson Plan) breu però completa segons la normativa LOMLOE.
    
    Tema: ${topic}
    Nivell educatiu: ${level}
    Context addicional: ${context || "Cap context específic"}

    L'estructura ha de ser en format Markdown i incloure:
    1. Títol creatiu.
    2. Competències específiques treballades.
    3. Descripció de l'activitat (Pas a pas).
    4. Criteris d'avaluació.
    5. Adaptació DUA (Disseny Universal per a l'Aprenentatge).
    
    Respon íntegrament en Valencià/Català.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        temperature: 0.7,
        systemInstruction: "Ets un assistent pedagògic expert en el currículum valencià d'arts plàstiques."
      }
    });
    return response.text || "No s'ha pogut generar el contingut.";
  } catch (error) {
    console.error("Error generating lesson plan:", error);
    throw error;
  }
};

/**
 * Generates an evaluation rubric.
 */
export const generateRubric = async (projectDescription: string, level: string): Promise<string> => {
  const prompt = `
    Crea una rúbrica d'avaluació en format taula Markdown per a un projecte de plàstica.
    Projecte: ${projectDescription}
    Nivell: ${level}
    
    La rúbrica ha de tindre 4 nivells (Excel·lent, Notable, Suficient, Insuficient) i avaluar 4 criteris clau pertinents al projecte.
    Respon en Valencià.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
    });
    return response.text || "Error generant la rúbrica.";
  } catch (error) {
    console.error("Error generating rubric:", error);
    throw error;
  }
};

/**
 * Generates a heritage-based activity connecting Art concepts with Valencian Culture.
 */
export const generateHeritageActivity = async (concept: string, heritageElement: string, level: string): Promise<string> => {
  const prompt = `
    Ets un expert en pedagogia de les arts a la Comunitat Valenciana.
    Proposa una activitat pràctica d'aula (aplicació didàctica) per a l'assignatura de Plàstica.
    
    Concepte artístic a treballar: ${concept} (ex: Textura, Color, Volum, Composició)
    Element del patrimoni valencià: ${heritageElement} (ex: Falles, Ceràmica, Sorolla, Modernisme, Carnaval)
    Nivell: ${level}

    L'objectiu és connectar la tradició cultural amb l'expressió plàstica contemporània o digital.
    L'estructura de la resposta (Markdown):
    1. **Títol del Projecte**
    2. **Justificació Patrimonial**: Breu explicació de l'element valencià.
    3. **Proposta Pràctica**: Què faran els alumnes exactament? (Pot ser manual o digital).
    4. **Materials/Recursos**: Eines necessàries.
    
    Respon en Valencià. Sigues creatiu i innovador.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        temperature: 0.8
      }
    });
    return response.text || "Error generant l'activitat patrimonial.";
  } catch (error) {
    console.error("Error generating heritage activity:", error);
    throw error;
  }
};

/**
 * Performs a search using Google Search Grounding and synthesizes the information.
 */
export const searchAndSynthesize = async (query: string, format: string): Promise<SearchResult> => {
  const prompt = `
    Actua com un assistent de recerca per a educació artística.
    Cerca informació fiable sobre: "${query}".
    
    Basant-te en la informació trobada, genera un contingut amb el format: "${format}".
    Si és un resum o biografia, fes-ho entenedor per a alumnes de secundària.
    Si és context històric, relaciona-ho amb moviments artístics.
    
    Respon en Valencià.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: SEARCH_MODEL, // Using Pro for search capabilities
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}]
      }
    });

    const text = response.text || "No s'ha pogut generar el contingut.";
    
    // Extract sources from grounding metadata
    const sources: { title: string; uri: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || "Font Web",
            uri: chunk.web.uri
          });
        }
      });
    }

    return { content: text, sources };
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
};

/**
 * Analyzes an image providing constructive feedback for a student.
 */
export const analyzeStudentWork = async (base64Image: string, question: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: VISION_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming jpeg for simplicity, or detect from source
              data: base64Image
            }
          },
          {
            text: `Ets un professor d'art amable i constructiu. Analitza aquesta imatge creada per un alumne. ${question ? `Pregunta de l'alumne: "${question}"` : ''}. 
            Centra't en la composició, l'ús del color i la tècnica. Dona 2 punts forts i 1 consell de millora. Respon en Valencià.`
          }
        ]
      }
    });
    return response.text || "No s'ha pogut analitzar la imatge.";
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
};

/**
 * Generates a creative prompt/challenge for a student.
 */
export const generateCreativeChallenge = async (): Promise<string> => {
  const prompt = `
    Proposa un repte artístic breu i divertit per a un alumne de secundària. 
    Pot estar relacionat amb: cultura valenciana (Sorolla, Falles, Ceràmica), moviments artístics moderns, o tècniques mixtes.
    Dona-ho en una frase inspiradora. Ex: "Dibuixa el teu carrer com si fos un quadre cubista."
    Respon en Valencià.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        temperature: 0.9 // Higher creativity
      }
    });
    return response.text || "Intenta-ho de nou.";
  } catch (error) {
    console.error("Error generating challenge:", error);
    throw error;
  }
};

/**
 * Generates an image based on a prompt and optional reference image.
 */
export const generateImage = async (prompt: string, base64Reference?: string): Promise<string> => {
  try {
    const parts: any[] = [];
    
    // If reference image exists, add it first (as per some examples for image editing/variation)
    if (base64Reference) {
      // Clean base64 header if present
      const cleanBase64 = base64Reference.includes(',') ? base64Reference.split(',')[1] : base64Reference;
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg', // Standardize on jpeg for upload
          data: cleanBase64
        }
      });
    }

    // Add text prompt
    parts.push({ text: prompt || "Generate an artistic image." });

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: VISION_MODEL, // gemini-2.5-flash-image
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    // Extract image from response parts
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No generated image found in response.");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};