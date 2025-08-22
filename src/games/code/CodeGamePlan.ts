// Code Challenge Game - Plan & Architecture
// A typing game focused on React hooks with smooth animations

import type { GameMetadata } from "../../types/game";

// Game concept: Progressive React hooks challenges
export const codeGameMetadata: GameMetadata = {
  id: "code-challenge",
  title: "React Hooks Challenge",
  description:
    "Learn React hooks through interactive typing challenges with live code preview.",
  category: "educational",
  difficulty: "medium",
  helpfulAspect: "Improves coding skills, muscle memory, and React knowledge",
  estimatedTime: "5-10 minutes",
};

// Challenge progression system
export interface CodeChallenge {
  id: string;
  title: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  hook: string; // useState, useEffect, etc.
  description: string;
  helpfulAspect: string; // What makes this educational
  codeToType: string;
  hints: string[];
  expectedOutput: string;
  visualPreview?: {
    componentName: string;
    initialState: Record<string, unknown>;
    expectedBehavior: string;
  };
}

// Smooth animation config
export const ANIMATION_CONFIG = {
  typing: {
    duration: 0.2,
    ease: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  codePreview: {
    duration: 0.3,
    ease: "cubic-bezier(0.25, 0.8, 0.25, 1)",
  },
  completion: {
    duration: 0.5,
    ease: "cubic-bezier(0.175, 0.885, 0.32, 1.275)", // bounce
  },
  error: {
    duration: 0.15,
    ease: "ease-out",
  },
};

// Sample challenges (progressive difficulty)
export const CODE_CHALLENGES: CodeChallenge[] = [
  {
    id: "useState-basic",
    title: "useState Basics",
    difficulty: 1,
    hook: "useState",
    description: "Create a simple counter with useState",
    helpfulAspect: "Master React state management fundamentals",
    codeToType: `const [count, setCount] = useState(0);

const increment = () => {
  setCount(count + 1);
};

return (
  <button onClick={increment}>
    Count: {count}
  </button>
);`,
    hints: [
      "Import useState from React",
      "Initialize state with 0",
      "Create a function to update count",
      "Display count in JSX",
    ],
    expectedOutput: "Working counter button",
    visualPreview: {
      componentName: "Counter",
      initialState: { count: 0 },
      expectedBehavior: "Button click increments counter",
    },
  },
  {
    id: "useEffect-basic",
    title: "useEffect Cleanup",
    difficulty: 2,
    hook: "useEffect",
    description: "Set up an interval with proper cleanup",
    helpfulAspect: "Learn side effects and preventing memory leaks",
    codeToType: `const [seconds, setSeconds] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    setSeconds(prev => prev + 1);
  }, 1000);

  return () => clearInterval(interval);
}, []);

return <div>Seconds: {seconds}</div>;`,
    hints: [
      "Use useEffect with empty dependency array",
      "Set up setInterval inside useEffect",
      "Return cleanup function",
      "Update state with previous value",
    ],
    expectedOutput: "Timer that increments every second",
    visualPreview: {
      componentName: "Timer",
      initialState: { seconds: 0 },
      expectedBehavior: "Timer increments automatically",
    },
  },
  {
    id: "custom-hook",
    title: "Custom Hook",
    difficulty: 3,
    hook: "custom",
    description: "Create a useLocalStorage custom hook",
    helpfulAspect: "Build reusable logic and understand hook patterns",
    codeToType: `const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });

  const setStoredValue = (newValue) => {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  };

  return [value, setStoredValue];
};`,
    hints: [
      "Initialize state with localStorage value",
      "Parse JSON from localStorage",
      "Create setter that updates both state and localStorage",
      "Return array like useState",
    ],
    expectedOutput: "Reusable localStorage hook",
    visualPreview: {
      componentName: "LocalStorageDemo",
      initialState: { value: "stored" },
      expectedBehavior: "Value persists between page reloads",
    },
  },
];

// Animation states for visual feedback
export interface AnimationState {
  isTyping: boolean;
  hasError: boolean;
  isComplete: boolean;
  currentLine: number;
  charactersTyped: number;
  showHint: boolean;
  previewVisible: boolean;
}

// Scoring system
export const calculateCodeScore = (
  accuracy: number,
  wpm: number,
  challengeDifficulty: number,
  hintsUsed: number
): number => {
  const baseScore = accuracy * wpm * challengeDifficulty * 10;
  const hintPenalty = hintsUsed * 50;
  return Math.max(0, Math.round(baseScore - hintPenalty));
};

// Visual themes for different hook types
export const HOOK_THEMES = {
  useState: {
    color: "#3b82f6",
    icon: "🔄",
    bgGradient: "from-blue-400 to-blue-600",
  },
  useEffect: {
    color: "#10b981",
    icon: "⚡",
    bgGradient: "from-green-400 to-green-600",
  },
  useContext: {
    color: "#f59e0b",
    icon: "🌐",
    bgGradient: "from-yellow-400 to-yellow-600",
  },
  custom: {
    color: "#8b5cf6",
    icon: "🛠️",
    bgGradient: "from-purple-400 to-purple-600",
  },
};
