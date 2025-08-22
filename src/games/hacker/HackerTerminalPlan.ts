/**
 * HACKER TERMINAL SIMULATOR - Game Architecture
 * Teaching real command-line skills through gamified cybersecurity scenarios
 * SAFE LEARNING ENVIRONMENT - No actual system access!
 */

export interface HackerScenario {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  estimatedTime: string;
  learningObjectives: string[];
  initialFiles: VirtualFile[];
  challenges: Challenge[];
  winCondition: WinCondition;
  hints: Hint[];
}

export interface VirtualFile {
  path: string;
  content: string;
  permissions: string;
  owner: string;
  size: number;
  hidden?: boolean;
  encrypted?: boolean;
}

export interface Challenge {
  id: string;
  instruction: string;
  expectedCommands?: string[];
  expectedOutput?: string;
  points: number;
  unlocks?: string[]; // Unlock next challenges or files
}

export interface WinCondition {
  type:
    | "file_found"
    | "password_cracked"
    | "system_accessed"
    | "data_extracted";
  target: string;
  description: string;
  points: number;
}

export interface Hint {
  challengeId: string;
  cost: number; // Points deducted for using hint
  text: string;
  commandExample?: string;
}

export interface TerminalState {
  currentDirectory: string;
  user: string;
  hostname: string;
  commandHistory: string[];
  availableCommands: string[];
  discoveredFiles: string[];
  points: number;
  hintsUsed: number;
  challengesCompleted: string[];
}

// Core Unix/Linux commands we'll simulate
export const AVAILABLE_COMMANDS = {
  // Navigation
  ls: {
    description: "List directory contents",
    usage: "ls [-la] [directory]",
    category: "navigation",
  },
  cd: {
    description: "Change directory",
    usage: "cd [directory]",
    category: "navigation",
  },
  pwd: {
    description: "Print working directory",
    usage: "pwd",
    category: "navigation",
  },

  // File operations
  cat: {
    description: "Display file contents",
    usage: "cat [file]",
    category: "files",
  },
  head: {
    description: "Display first lines of file",
    usage: "head [-n] [file]",
    category: "files",
  },
  tail: {
    description: "Display last lines of file",
    usage: "tail [-n] [file]",
    category: "files",
  },
  grep: {
    description: "Search text patterns",
    usage: "grep [pattern] [file]",
    category: "search",
  },
  find: {
    description: "Find files and directories",
    usage: "find [path] -name [pattern]",
    category: "search",
  },

  // System info
  ps: {
    description: "List running processes",
    usage: "ps [aux]",
    category: "system",
  },
  whoami: {
    description: "Display current user",
    usage: "whoami",
    category: "system",
  },
  id: {
    description: "Display user and group IDs",
    usage: "id",
    category: "system",
  },

  // Network (simulated)
  netstat: {
    description: "Display network connections",
    usage: "netstat [-an]",
    category: "network",
  },
  ping: {
    description: "Test network connectivity",
    usage: "ping [host]",
    category: "network",
  },

  // Hacker tools (educational)
  nmap: {
    description: "Network port scanner",
    usage: "nmap [host]",
    category: "security",
  },
  john: {
    description: "Password cracking tool",
    usage: "john [hashfile]",
    category: "security",
  },
  base64: {
    description: "Encode/decode base64",
    usage: "base64 [-d] [file]",
    category: "security",
  },

  // Help
  help: {
    description: "Show available commands",
    usage: "help [command]",
    category: "help",
  },
  man: {
    description: "Show manual page",
    usage: "man [command]",
    category: "help",
  },
};

// Pre-built scenarios for progressive learning
export const HACKER_SCENARIOS: HackerScenario[] = [
  {
    id: "beginner-recon",
    title: "System Reconnaissance",
    description:
      "Learn basic system exploration commands in a safe environment",
    difficulty: "beginner",
    estimatedTime: "5-7 minutes",
    learningObjectives: [
      "Navigate file system with cd, ls, pwd",
      "Examine file contents with cat, head, tail",
      "Understand file permissions and ownership",
      "Use grep for basic text searching",
    ],
    initialFiles: [
      {
        path: "/home/user/documents/notes.txt",
        content:
          "Remember: password for backup server is in the config folder\nMeeting at 3pm about the security audit\nNew employee starts Monday - setup account",
        permissions: "-rw-r--r--",
        owner: "user",
        size: 156,
      },
      {
        path: "/home/user/.config/backup.conf",
        content:
          "server=backup.company.com\nport=22\nuser=admin\n# password: c0mP4ny123!\nencryption=aes256",
        permissions: "-rw-------",
        owner: "user",
        size: 89,
        hidden: true,
      },
      {
        path: "/var/log/auth.log",
        content:
          "Failed login attempt from 192.168.1.100\nSuccessful login: admin from 192.168.1.50\nFailed login attempt from 192.168.1.100\nPassword change requested for user: backup_admin",
        permissions: "-rw-r--r--",
        owner: "root",
        size: 203,
      },
    ],
    challenges: [
      {
        id: "explore_home",
        instruction:
          "Explore the user's home directory. What files can you find?",
        expectedCommands: ["ls", "ls -la"],
        points: 100,
        unlocks: ["examine_files"],
      },
      {
        id: "examine_files",
        instruction:
          "Read the contents of notes.txt. What information does it contain?",
        expectedCommands: ["cat /home/user/documents/notes.txt"],
        points: 150,
        unlocks: ["find_config"],
      },
      {
        id: "find_config",
        instruction:
          "The notes mention a config folder. Find and examine the backup configuration.",
        expectedCommands: [
          "ls -la /home/user/.config/",
          "cat /home/user/.config/backup.conf",
        ],
        points: 200,
        unlocks: ["search_logs"],
      },
      {
        id: "search_logs",
        instruction: "Check the system logs for any suspicious login attempts.",
        expectedCommands: [
          "cat /var/log/auth.log",
          'grep "Failed" /var/log/auth.log',
        ],
        points: 250,
      },
    ],
    winCondition: {
      type: "password_cracked",
      target: "c0mP4ny123!",
      description:
        "Extract the backup server password from the configuration files",
      points: 500,
    },
    hints: [
      {
        challengeId: "explore_home",
        cost: 25,
        text: 'Use "ls -la" to see hidden files (those starting with .)',
        commandExample: "ls -la /home/user",
      },
      {
        challengeId: "find_config",
        cost: 50,
        text: "Hidden files start with a dot. Check the .config directory",
        commandExample: "ls -la /home/user/.config",
      },
    ],
  },

  {
    id: "intermediate-network",
    title: "Network Infiltration",
    description: "Practice network reconnaissance and service enumeration",
    difficulty: "intermediate",
    estimatedTime: "8-12 minutes",
    learningObjectives: [
      "Use nmap for port scanning",
      "Analyze network services",
      "Identify potential vulnerabilities",
      "Practice process analysis with ps",
    ],
    initialFiles: [
      {
        path: "/tmp/scan_results.txt",
        content:
          "PORT     STATE SERVICE\n22/tcp   open  ssh\n80/tcp   open  http\n443/tcp  open  https\n3306/tcp open  mysql\n8080/tcp open  http-proxy",
        permissions: "-rw-r--r--",
        owner: "user",
        size: 125,
      },
      {
        path: "/etc/services",
        content:
          "ssh             22/tcp\nhttp            80/tcp\nhttps           443/tcp\nmysql           3306/tcp\ntelnet          23/tcp",
        permissions: "-r--r--r--",
        owner: "root",
        size: 98,
      },
    ],
    challenges: [
      {
        id: "scan_target",
        instruction: "Perform a port scan on target system 192.168.1.100",
        expectedCommands: ["nmap 192.168.1.100"],
        points: 200,
        unlocks: ["analyze_services"],
      },
      {
        id: "analyze_services",
        instruction:
          "Which services are running on open ports? Check the services file.",
        expectedCommands: [
          "cat /etc/services",
          'grep -E "(ssh|http|mysql)" /etc/services',
        ],
        points: 250,
        unlocks: ["identify_vulnerability"],
      },
    ],
    winCondition: {
      type: "system_accessed",
      target: "mysql_database",
      description:
        "Identify the vulnerable MySQL service for potential exploitation",
      points: 750,
    },
    hints: [],
  },
];

// Special achievements for motivation
export const ACHIEVEMENTS = {
  first_command: {
    name: "First Steps",
    description: "Executed your first command",
    icon: "🖥️",
  },
  file_finder: {
    name: "Digital Detective",
    description: "Found 5 hidden files",
    icon: "🔍",
  },
  password_hunter: {
    name: "Password Hunter",
    description: "Cracked your first password",
    icon: "🔐",
  },
  network_ninja: {
    name: "Network Ninja",
    description: "Completed network reconnaissance",
    icon: "🥷",
  },
  command_master: {
    name: "Command Master",
    description: "Used 20 different commands",
    icon: "⚡",
  },
  speed_hacker: {
    name: "Speed Hacker",
    description: "Completed scenario in under 3 minutes",
    icon: "🚀",
  },
};

export type AchievementKey = keyof typeof ACHIEVEMENTS;
