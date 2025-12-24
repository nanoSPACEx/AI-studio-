export enum UserRole {
  NONE = 'NONE',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

export enum AppView {
  HOME = 'HOME',
  LESSON_PLANNER = 'LESSON_PLANNER', // Teacher
  RUBRIC_GENERATOR = 'RUBRIC_GENERATOR', // Teacher
  VALENCIAN_CULTURE = 'VALENCIAN_CULTURE', // Teacher (New)
  SEARCH_INFO = 'SEARCH_INFO', // Teacher (New - Search)
  ART_ANALYSIS = 'ART_ANALYSIS', // Student
  CREATIVE_PROMPTS = 'CREATIVE_PROMPTS', // Student
  IMAGE_GENERATION = 'IMAGE_GENERATION', // Student (New)
  SAVED = 'SAVED' // New view for saved items
}

export interface EducationalLevel {
  id: string;
  label: string;
}

export const LEVELS: EducationalLevel[] = [
  { id: '1eso', label: '1r ESO' },
  { id: '2eso', label: '2n ESO' },
  { id: '3eso', label: '3r ESO' },
  { id: '4eso', label: '4t ESO' },
  { id: '1bat', label: '1r Batxillerat Artístic' },
  { id: '2bat', label: '2n Batxillerat Artístic' },
];

export interface CurriculumData {
  subject: string;
  competencies: string;
  criteria: string;
  basicKnowledge: string;
  situations?: string; // Situacions d'aprenentatge context
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  image?: string;
}

export type SavedItemType = 'LESSON' | 'RUBRIC' | 'HERITAGE' | 'ANALYSIS' | 'PROMPT' | 'IMAGE' | 'SEARCH';

export interface SavedItem {
  id: string;
  type: SavedItemType;
  title: string;
  content: string; // Text content or Base64 image
  date: number;
  role: UserRole;
}