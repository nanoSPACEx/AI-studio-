import { CurriculumData } from "../types";

export const CURRICULUM_DB: Record<string, CurriculumData[]> = {
  '1eso': [
    {
      subject: "Laboratori de Creació Audiovisual",
      competencies: "CE1 (Explorar), CE2 (Elaborar), CE3 (Participar), CE4 (Compartir).",
      criteria: "CA.5.1 (Anàlisi), CA.5.2 (Producció), CA.5.3 (Planificació), CA.5.4 (Difusió).",
      basicKnowledge: `
        Bloc 1. Fonaments del llenguatge audiovisual: Imatge fixa i moviment, Llenguatge audiovisual bàsic.
        Bloc 2. Producció Audiovisual: Planificació, Preproducció, producció i postproducció, Difusió.
      `,
      situations: "SA1: Animació, imatge en moviment (Joguets òptics, Stopmotion). SA2: Disseny de personatges (Pixel art, 3D). SA3: Fotografia (Fotomuntatges). SA4: Cine (Cinefòrum, Cartelleria). SA5: Projecte de creació audiovisual (Spot publicitari)."
    }
  ],
  '2eso': [
    {
      subject: "Educació Plàstica, Visual i Audiovisual (EPVA)",
      competencies: "CE1 (Analitzar), CE2 (Compartir), CE3 (Comunicar), CE4 (Recursos digitals), CE5 (Crear col·lectivament).",
      criteria: "C1.1-C1.5 (Cerca i anàlisi), C2.1-C2.3 (Vocabulari i discurs), C3.1-C3.5 (Experimentació i ideació), C4.1-C4.3 (Digital i normativa), C5.1-C5.5 (Planificació i difusió col·lectiva).",
      basicKnowledge: `
        Bloc 1. Percepció i anàlisi: Exploració de l'entorn (patrimoni tangible/intangible), Alfabetització visual (lleis percepció, elements morfologics).
        Bloc 2. Experimentació i creació: Tècniques seques/humides, Geometria plana, Àmbits d'aplicació (disseny, publicitat), Processos de treball.
      `,
      situations: "SA1: Welcome to Visual Arts. SA2: Working with Lines. SA3: The Curve is Beautiful. SA4: Polygons. SA5: Let's be Balanced. SA6: Build up a Birdhouse. SA7: The Language of Light. SA8: Surrounded by Colors."
    },
    {
      subject: "Taller d'aprofundiment EPVA: Vinaròs en Colors",
      competencies: "CE1 (Analitzar propostes), CE2 (Compartir idees), CE3 (Comunicar emocions), CE4 (Recursos digitals), CE5 (Produccions col·lectives).",
      criteria: "CA1.3, CA1.4, CA2.3, CA3.1-3.5, CA4.1-4.2, CA5.1-5.4.",
      basicKnowledge: `
        Bloc 1. Percepció i anàlisi: Exploració de l'entorn (Vinaròs), Alfabetització visual.
        Bloc 2. Experimentació i creació: Tècniques graficoplàstiques, Processos de treball individual i col·lectiu.
      `,
      situations: "SA1: Carnaval (disseny gràfic i tècnic). SA2: Espai Urbà i Festes i patrimoni (projecte artístic, urbansketch). SA3: Projecte audiovisual (storyboard, vídeo)."
    }
  ],
  '1bat': [
    {
      subject: "Cultura Audiovisual",
      competencies: "CE1, CE2, CE3, CE4, CE5, CE6.",
      criteria: "C1.1-1.3, C2.1-2.3, C3.1-3.3, C4.1-4.3, C5.1-5.3, C6.1-6.3.",
      basicKnowledge: `
        Bloc 1. Imatge fixa i en moviment: Història del cine, mitjans de comunicació, anàlisi i creació d'imatges segons funció/iconicitat.
        Bloc 2. Narració i Expressió: Guió, narrativa, tipus de pla, moviments de càmera.
        Bloc 3. Gramàtica i Planificació: Composició, color, so, muntatge, postproducció.
      `,
      situations: "SA1: Imagen Fixa (Projectes fotogràfics). SA2: Imagen en Moviment (Cine). SA3: Narració (Guió, Curtmetratge). SA4: Expressió Audiovisual (Càmera). SA5: Gramàtica del llenguatge. SA6: Preproducció. SA7: Postproducció. SA8: Tècniques d'animació. SA9: Mons Virtuals (Infografies)."
    }
  ]
};

export const getCurriculumForLevel = (levelId: string): CurriculumData[] => {
  return CURRICULUM_DB[levelId] || [];
};
