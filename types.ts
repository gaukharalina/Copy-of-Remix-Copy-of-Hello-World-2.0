
export enum GreetingVibe {
  CYBERPUNK = 'Cyberpunk',
  SHAKESPEAREAN = 'Shakespearean',
  PIRATE = 'Pirate',
  GEN_Z = 'Gen-Z / Brainrot',
  POETIC = 'Poetic',
  MINIMALIST = 'Minimalist',
  GALACTIC = 'Galactic Overlord'
}

export interface GreetingRecord {
  id: string;
  text: string;
  vibe: GreetingVibe;
  language: string;
  timestamp: number;
  imageUrl?: string;
  audioData?: string;
}

export interface GeminiResponse {
  text: string;
  imageUrl?: string;
}
