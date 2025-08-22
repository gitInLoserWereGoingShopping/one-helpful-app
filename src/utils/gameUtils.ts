// Shared functional utilities for all games
export const gameUtils = {
  // Timer utilities
  formatTime: (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  },

  // Score utilities
  calculateScore: (
    baseScore: number,
    timeBonus: number,
    accuracy: number
  ): number => {
    return Math.round(baseScore * accuracy * (1 + timeBonus));
  },

  // Random utilities
  randomInt: (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  randomChoice: <T>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)];
  },

  // Helpful feedback generator
  generateFeedback: (
    score: number,
    timeSpent: number,
    category: string
  ): string[] => {
    const feedback: string[] = [];

    if (score > 80) {
      feedback.push("Excellent performance! 🎉");
    } else if (score > 60) {
      feedback.push("Good job! Keep practicing to improve. 👍");
    } else {
      feedback.push("Nice try! Practice makes perfect. 💪");
    }

    if (timeSpent < 30) {
      feedback.push("Quick reflexes! ⚡");
    }

    // Category-specific helpful tips
    switch (category) {
      case "reflex":
        feedback.push(
          "Tip: Regular practice improves reaction time and focus."
        );
        break;
      case "puzzle":
        feedback.push(
          "Tip: Pattern recognition skills transfer to problem-solving in daily life."
        );
        break;
      case "educational":
        feedback.push(
          "Tip: Learning through play helps with memory retention."
        );
        break;
      default:
        feedback.push("Tip: Gaming can improve cognitive flexibility!");
    }

    return feedback;
  },

  // Local storage helpers for persistence
  saveStats: (gameId: string, stats: Record<string, unknown>): void => {
    const key = `game_stats_${gameId}`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    existing.push({ ...stats, timestamp: Date.now() });
    localStorage.setItem(key, JSON.stringify(existing));
  },

  getStats: (gameId: string): Record<string, unknown>[] => {
    const key = `game_stats_${gameId}`;
    return JSON.parse(localStorage.getItem(key) || "[]");
  },

  getBestScore: (gameId: string): number => {
    const stats = gameUtils.getStats(gameId);
    return stats.length > 0
      ? Math.max(...stats.map((s) => (s.score as number) || 0))
      : 0;
  },
};

// Helpful constants with darkish mode compatible colors
export const ENCOURAGEMENT_MESSAGES = [
  "You're improving with each try! 🌟",
  "Practice is the key to mastery! 🔑",
  "Every expert was once a beginner! 🚀",
  "Small progress is still progress! 📈",
  "Challenge yourself and grow! 🌱",
];

export const GAME_CATEGORIES = {
  reflex: {
    icon: "⚡",
    color: "#fb923c",
    helpfulAspect: "Improves reaction time and focus",
  }, // Bright orange for darkish
  puzzle: {
    icon: "🧩",
    color: "#34d399",
    helpfulAspect: "Enhances problem-solving skills",
  }, // Bright green
  strategy: {
    icon: "♟️",
    color: "#22d3ee",
    helpfulAspect: "Develops strategic thinking",
  }, // Bright cyan
  educational: {
    icon: "🎓",
    color: "#a855f7",
    helpfulAspect: "Learning through engagement",
  }, // Bright violet
  utility: {
    icon: "🛠️",
    color: "#fbbf24",
    helpfulAspect: "Practical skill development",
  }, // Bright amber
};
