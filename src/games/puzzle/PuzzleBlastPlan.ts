// Puzzle Blast Adventure - Game Plan & Architecture
// Point-and-blast puzzle game with explosive animations and hidden treasures

import type { GameMetadata } from "../../types/game";

// Game concept: Blast puzzle pieces to reveal hidden knowledge treasures
export const puzzleBlastMetadata: GameMetadata = {
  id: "puzzle-blast",
  title: "Knowledge Blast Adventure",
  description:
    "Blast puzzle pieces to reveal hidden knowledge gems and create explosive chain reactions!",
  category: "puzzle",
  difficulty: "medium",
  helpfulAspect:
    "Improves pattern recognition, strategic thinking, and reaction timing",
  estimatedTime: "3-8 minutes",
};

// Types of treasures hidden inside pieces (not materials like Minecraft!)
export interface KnowledgeTreasure {
  id: string;
  name: string;
  icon: string;
  color: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  points: number;
  description: string;
}

export const KNOWLEDGE_TREASURES: KnowledgeTreasure[] = [
  // Common treasures
  {
    id: "wisdom-spark",
    name: "Wisdom Spark",
    icon: "✨",
    color: "#fbbf24",
    rarity: "common",
    points: 10,
    description: "A tiny flash of insight",
  },
  {
    id: "idea-fragment",
    name: "Idea Fragment",
    icon: "💡",
    color: "#34d399",
    rarity: "common",
    points: 15,
    description: "Piece of a brilliant idea",
  },
  {
    id: "memory-crystal",
    name: "Memory Crystal",
    icon: "🔮",
    color: "#60a5fa",
    rarity: "common",
    points: 20,
    description: "Crystallized memory",
  },

  // Rare treasures
  {
    id: "skill-gem",
    name: "Skill Gem",
    icon: "💎",
    color: "#a855f7",
    rarity: "rare",
    points: 50,
    description: "Pure concentrated skill",
  },
  {
    id: "creativity-orb",
    name: "Creativity Orb",
    icon: "🌟",
    color: "#f472b6",
    rarity: "rare",
    points: 75,
    description: "Swirling creative energy",
  },
  {
    id: "logic-core",
    name: "Logic Core",
    icon: "⚙️",
    color: "#06b6d4",
    rarity: "rare",
    points: 100,
    description: "Perfectly logical essence",
  },

  // Epic treasures
  {
    id: "inspiration-shard",
    name: "Inspiration Shard",
    icon: "🚀",
    color: "#f97316",
    rarity: "epic",
    points: 200,
    description: "Raw inspirational power",
  },
  {
    id: "mastery-essence",
    name: "Mastery Essence",
    icon: "👑",
    color: "#eab308",
    rarity: "epic",
    points: 300,
    description: "The essence of true mastery",
  },

  // Legendary treasures
  {
    id: "enlightenment-fragment",
    name: "Enlightenment Fragment",
    icon: "🌠",
    color: "#c084fc",
    rarity: "legendary",
    points: 500,
    description: "A piece of pure enlightenment",
  },
];

// Types of puzzle pieces
export interface PuzzlePiece {
  id: string;
  x: number;
  y: number;
  type: "basic" | "reinforced" | "crystal" | "explosive" | "mystery";
  color: string;
  health: number;
  maxHealth: number;
  treasures: KnowledgeTreasure[];
  isExploding: boolean;
  isDestroyed: boolean;
  chainMultiplier: number;
}

// Animation configurations for smooth explosions
export const ANIMATION_CONFIG = {
  explosion: {
    duration: 0.8,
    ease: "cubic-bezier(0.25, 0.8, 0.25, 1)",
    particleCount: 12,
    particleSpeed: 150,
    particleLife: 1.2,
  },
  treasureReveal: {
    duration: 0.6,
    ease: "cubic-bezier(0.175, 0.885, 0.32, 1.275)", // bounce
    delay: 0.3, // after explosion starts
  },
  chainReaction: {
    duration: 0.4,
    ease: "cubic-bezier(0.4, 0, 0.2, 1)",
    delay: 0.1, // staggered
  },
  scorePopup: {
    duration: 1.0,
    ease: "cubic-bezier(0.25, 0.8, 0.25, 1)",
    floatDistance: 50,
  },
};

// Piece type configurations
export const PIECE_TYPES = {
  basic: {
    health: 1,
    color: "#64748b",
    treasureCount: [1, 2], // min, max
    explosionRadius: 0,
    points: 10,
  },
  reinforced: {
    health: 2,
    color: "#475569",
    treasureCount: [2, 3],
    explosionRadius: 0,
    points: 25,
  },
  crystal: {
    health: 1,
    color: "#8b5cf6",
    treasureCount: [2, 4],
    explosionRadius: 1, // affects adjacent pieces
    points: 50,
  },
  explosive: {
    health: 1,
    color: "#f97316",
    treasureCount: [1, 2],
    explosionRadius: 2, // big boom!
    points: 75,
  },
  mystery: {
    health: 3,
    color: "#1f2937",
    treasureCount: [3, 6],
    explosionRadius: 0,
    points: 100,
  },
};

// Level progression
export interface Level {
  id: number;
  name: string;
  gridSize: { width: number; height: number };
  targetScore: number;
  timeLimit?: number; // seconds, optional
  pieceDistribution: {
    basic: number;
    reinforced: number;
    crystal: number;
    explosive: number;
    mystery: number;
  };
  specialRules?: string[];
}

export const LEVELS: Level[] = [
  {
    id: 1,
    name: "First Blast",
    gridSize: { width: 6, height: 6 },
    targetScore: 500,
    pieceDistribution: {
      basic: 70,
      reinforced: 20,
      crystal: 10,
      explosive: 0,
      mystery: 0,
    },
    specialRules: ["Learn the basics of blasting"],
  },
  {
    id: 2,
    name: "Chain Reactions",
    gridSize: { width: 7, height: 7 },
    targetScore: 1000,
    pieceDistribution: {
      basic: 50,
      reinforced: 30,
      crystal: 15,
      explosive: 5,
      mystery: 0,
    },
    specialRules: ["Crystal pieces create chain reactions"],
  },
  {
    id: 3,
    name: "Explosive Discovery",
    gridSize: { width: 8, height: 8 },
    targetScore: 2000,
    timeLimit: 120,
    pieceDistribution: {
      basic: 40,
      reinforced: 25,
      crystal: 20,
      explosive: 10,
      mystery: 5,
    },
    specialRules: [
      "Mystery pieces hold rare treasures",
      "Time limit adds pressure",
    ],
  },
];

// Game state interface
export interface BlastGameState {
  level: number;
  score: number;
  timeRemaining?: number;
  grid: (PuzzlePiece | null)[][];
  treasureCollection: Record<string, number>;
  combo: number;
  isGameComplete: boolean;
  isPaused: boolean;
  explosions: ExplosionAnimation[];
  floatingScores: ScorePopup[];
}

export interface ExplosionAnimation {
  id: string;
  x: number;
  y: number;
  startTime: number;
  particles: Particle[];
}

export interface Particle {
  id: string;
  startX: number;
  startY: number;
  velocityX: number;
  velocityY: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface ScorePopup {
  id: string;
  x: number;
  y: number;
  score: number;
  startTime: number;
  color: string;
}

// Utility functions
export const generateRandomTreasures = (count: number): KnowledgeTreasure[] => {
  const treasures: KnowledgeTreasure[] = [];
  for (let i = 0; i < count; i++) {
    const rarity = Math.random();
    let rarityType: "common" | "rare" | "epic" | "legendary";

    if (rarity < 0.6) rarityType = "common";
    else if (rarity < 0.85) rarityType = "rare";
    else if (rarity < 0.97) rarityType = "epic";
    else rarityType = "legendary";

    const availableTreasures = KNOWLEDGE_TREASURES.filter(
      (t) => t.rarity === rarityType
    );
    if (availableTreasures.length > 0) {
      treasures.push(
        availableTreasures[
          Math.floor(Math.random() * availableTreasures.length)
        ]
      );
    }
  }
  return treasures;
};

export const calculateChainMultiplier = (chainLength: number): number => {
  return Math.min(5, 1 + (chainLength - 1) * 0.5); // Max 5x multiplier
};

export const calculateLevelScore = (
  baseScore: number,
  timeBonus: number,
  treasureBonus: number,
  chainBonus: number
): number => {
  return Math.round(baseScore + timeBonus + treasureBonus + chainBonus);
};
