export interface Student {
  id: string;
  name: string;
  avatar: string;
  points: number;
  exp: number;
  ownedPets: number[]; // Array of pet levels (1: Dog, 2: Cat, 3: Rabbit, 4: Fox)
  equippedPet: number | null; // Currently selected pet level for avatar
  coins: number;
  maxLevelReached: number;
  password?: string;
}

export interface StoryPost {
  id: string;
  author: string;
  content: string;
  imageUrl?: string;
  timestamp: string;
  likes: number;
}

export interface Skill {
  id: string;
  name: string;
  icon: string;
  points: number;
}

export interface Homework {
  id: string;
  question: string;
  imageUrl?: string;
  answer: string;
  coinsReward: number;
  expReward: number;
  completedBy: string[]; // Array of student IDs
  expiresAt: string; // ISO date string
}
