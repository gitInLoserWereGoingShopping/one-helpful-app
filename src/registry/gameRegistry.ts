import type { GameComponent } from "../types/game";
import { ReactionGame } from "../games/reaction/ReactionGame";
import { CodeChallengeGame } from "../games/code/CodeChallenge";
import { PuzzleBlastGame } from "../games/puzzle/PuzzleBlast";
import { HackerTerminalGame } from "../games/hacker/HackerTerminal";

// Modular game registry - easy to add new games!
export const GAME_REGISTRY: GameComponent[] = [
  {
    metadata: {
      id: "reaction-speed",
      title: "Reaction Speed Test",
      description:
        "Test and improve your reaction time with this simple but effective game.",
      category: "reflex",
      difficulty: "easy",
      helpfulAspect:
        "Improves reaction time and focus - useful for driving, sports, and daily alertness",
      estimatedTime: "2-3 minutes",
    },
    Component: ReactionGame,
  },
  {
    metadata: {
      id: "code-challenge",
      title: "React Hooks Challenge",
      description:
        "Learn React hooks through interactive typing challenges with live code preview.",
      category: "educational",
      difficulty: "medium",
      helpfulAspect:
        "Improves coding skills, muscle memory, and React knowledge",
      estimatedTime: "5-10 minutes",
    },
    Component: CodeChallengeGame,
  },
  {
    metadata: {
      id: "puzzle-blast",
      title: "Puzzle Blast Adventure",
      description:
        "Strategic puzzle game with explosive chain reactions and knowledge treasure collection.",
      category: "puzzle",
      difficulty: "medium",
      helpfulAspect:
        "Enhances strategic thinking, pattern recognition, and problem-solving skills",
      estimatedTime: "10-15 minutes",
    },
    Component: PuzzleBlastGame,
  },
  {
    metadata: {
      id: "hacker-terminal",
      title: "Terminal Hacker Simulator",
      description:
        "Learn command-line skills through gamified cybersecurity scenarios in a safe environment.",
      category: "educational",
      difficulty: "easy",
      helpfulAspect:
        "Teaches real terminal commands, file system navigation, and cybersecurity awareness",
      estimatedTime: "5-10 minutes",
    },
    Component: HackerTerminalGame,
  },

  // More games will be added here - each one completely modular!
  // Future games could include:
  // - Memory pattern game (puzzle category)
  // - Typing speed test (utility category)
  // - Math quick-fire (educational category)
  // - Color matching (reflex category)
  // - Word association (strategy category)
];

// Helper function to get games by category
export const getGamesByCategory = (category: string) => {
  return GAME_REGISTRY.filter((game) => game.metadata.category === category);
};

// Helper function to get game by ID
export const getGameById = (id: string) => {
  return GAME_REGISTRY.find((game) => game.metadata.id === id);
};
