// Core game types for modular architecture
export interface GameMetadata {
  id: string;
  title: string;
  description: string;
  category: "reflex" | "puzzle" | "strategy" | "educational" | "utility";
  difficulty: "easy" | "medium" | "hard";
  helpfulAspect: string; // What makes this game helpful/educational
  estimatedTime: string; // e.g., "2-5 minutes"
}

export interface GameStats {
  score: number;
  timeSpent: number;
  completedAt: Date;
  improvements?: string[]; // Helpful suggestions for next time
  [key: string]: unknown; // Allow additional properties for flexibility
}

export interface GameProps {
  onComplete: (stats: GameStats) => void;
  onExit: () => void;
}

export interface GameComponent {
  metadata: GameMetadata;
  Component: React.ComponentType<GameProps>;
}
