export enum GraphicCategory {
  POSTER = 'POSTER',
  BANNER = 'BANNER',
  NEWSPAPER = 'NEWSPAPER',
  COVER = 'COVER',
  ARTWORK = 'ARTWORK',
  ISOMETRIC = 'ISOMETRIC',
  MENU = 'MENU',
  TRAVEL = 'TRAVEL',
  CARD = 'CARD',
  INFOGRAPHIC = 'INFOGRAPHIC',
  NOTEBOOK_STYLE = 'NOTEBOOK_STYLE'
}

export interface PromptInputs {
  subject: string;
  style: string;
  mood: string;
  colors: string;
  elements: string;
  additionalInfo?: string;
  referenceImage?: string;
  dataFileContent?: string; // New: Content read from uploaded text/csv files
  promptCount: number;
  selectedRatio?: string; // New: Specific aspect ratio choice (mainly for Infographic)
  notebookFormat?: string; // New: Sub-format for NotebookLM style (FAQ, Study Guide, etc.)
}

export interface GeneratedResult {
  id: string;
  category: GraphicCategory;
  originalInputs: PromptInputs;
  prompts: string[];
  imageUrl?: string;
  createdAt: number;
}

export interface GeminiResponse {
  text: string;
}