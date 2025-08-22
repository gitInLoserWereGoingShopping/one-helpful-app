import React, { useState, useEffect, useRef } from "react";
import type { GameProps } from "../../types/game";
import { ThemeProvider } from "../../styles/ThemeProvider";
import "./HackerTerminal.css";

interface TerminalState {
  currentDirectory: string;
  user: string;
  hostname: string;
  points: number;
  filesFound: number;
  commandsUsed: number;
  aiAssistantActive: boolean;
  scanningMode: boolean;
  neuralNetworkStatus: "idle" | "scanning" | "analyzing" | "complete";
}

interface VirtualFile {
  path: string;
  content: string;
  permissions: string;
  owner: string;
}

export const HackerTerminalGame: React.FC<GameProps> = ({ onExit }) => {
  const [terminalState, setTerminalState] = useState<TerminalState>({
    currentDirectory: "/home/user",
    user: "hacker",
    hostname: "kali-linux",
    points: 0,
    filesFound: 0,
    commandsUsed: 0,
    aiAssistantActive: false,
    scanningMode: false,
    neuralNetworkStatus: "idle",
  });

  // Mission objective tracking
  const [completedObjectives, setCompletedObjectives] = useState<Set<string>>(
    new Set()
  );
  const [easterEggsFound, setEasterEggsFound] = useState<Set<string>>(
    new Set()
  );
  const [isSystemMelting, setIsSystemMelting] = useState(false);

  // Command history and hints
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [hoveredObjective, setHoveredObjective] = useState<string | null>(null);
  const [showMatrixRain, setShowMatrixRain] = useState(false);

  const [currentCommand, setCurrentCommand] = useState("");
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    "🤖 AI-POWERED HACKER TERMINAL v2.0 🤖",
    "Neural network cybersecurity training environment",
    'Type "help" for commands or "ai" to activate AI assistant',
    "AI Status: Ready for neural analysis",
    "Find the hidden password using AI-enhanced tools!",
    "",
  ]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [outputHeight, setOutputHeight] = useState(60); // Percentage of terminal height for output
  const [latestCommandIndex, setLatestCommandIndex] = useState(-1);

  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalOutputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Create keystroke sound effect
  const playKeystrokeSound = () => {
    try {
      // Create a short beep sound using Web Audio API
      const AudioContextClass =
        window.AudioContext || (window as unknown as typeof AudioContext);
      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Set frequency for a soft hacker beep (higher pitch for typing feel)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        600,
        audioContext.currentTime + 0.1
      );

      // Set volume (soft sound)
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.1
      );

      // Play the sound for 100ms
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch {
      // Silently fail if audio context is not supported
      console.log("Audio not supported");
    }
  };

  // Handle input changes with keystroke sound
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Play sound only on actual character input (not deletion)
    if (newValue.length > currentCommand.length) {
      playKeystrokeSound();
    }

    setCurrentCommand(newValue);
  };

  // Matrix Rain Component
  const MatrixRain: React.FC = () => {
    const [rainDrops, setRainDrops] = useState<
      Array<{ id: number; left: number; duration: number; chars: string }>
    >([]);

    useEffect(() => {
      if (!showMatrixRain) {
        setRainDrops([]);
        return;
      }

      const generateRainDrop = () => {
        const chars = "0123456789ABCDEF!@#$%^&*()_+-=[]{}|;:,.<>?";
        const rainChars = Array.from(
          { length: 20 },
          () => chars[Math.floor(Math.random() * chars.length)]
        ).join("");

        return {
          id: Math.random(),
          left: Math.random() * 100,
          duration: 2 + Math.random() * 3,
          chars: rainChars,
        };
      };

      const interval = setInterval(() => {
        setRainDrops((prev) => {
          const newDrops = [...prev.slice(-15), generateRainDrop()]; // Keep last 15 drops
          return newDrops;
        });
      }, 200);

      return () => clearInterval(interval);
    }, []); // Empty dependency array since showMatrixRain is used for conditional rendering

    if (!showMatrixRain) return null;

    return (
      <div className="matrix-rain">
        {rainDrops.map((drop) => (
          <div
            key={drop.id}
            className="matrix-column"
            style={{
              left: `${drop.left}%`,
              animationDuration: `${drop.duration}s`,
            }}
          >
            {drop.chars.split("").map((char, i) => (
              <div key={i} style={{ opacity: 1 - i * 0.1 }}>
                {char}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  // Virtual file system
  const virtualFiles: VirtualFile[] = [
    {
      path: "/home/user/notes.txt",
      content:
        "Meeting notes:\n- Security audit scheduled\n- Check backup server config\n- Password policy update needed",
      permissions: "-rw-r--r--",
      owner: "user",
    },
    {
      path: "/home/user/.bashrc",
      content:
        '# Bash configuration\nexport PATH=$PATH:/usr/local/bin\nalias ll="ls -la"\n# Secret: backup_pass=Sup3rS3cur3!',
      permissions: "-rw-r--r--",
      owner: "user",
    },
    {
      path: "/home/user/.ssh/config",
      content:
        "Host production\n  HostName 192.168.1.200\n  User admin\n  Port 2222\n# Easter Egg: admin_key=H4ck3r_M0d3_0n",
      permissions: "-rw-------",
      owner: "user",
    },
    {
      path: "/var/log/auth.log",
      content:
        "Authentication attempts:\nFailed login: user@192.168.1.100\nSuccessful login: admin@192.168.1.50\nSuspicious activity detected",
      permissions: "-rw-r--r--",
      owner: "root",
    },
    {
      path: "/var/log/system.log",
      content:
        "System startup log:\n[OK] Network interface up\n[OK] SSH daemon started\n[WARN] Unusual network traffic detected\n# Hidden: debug_mode=tr4c3_3n4bl3d",
      permissions: "-rw-r--r--",
      owner: "root",
    },
    {
      path: "/etc/passwd",
      content:
        "root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:User:/home/user:/bin/bash\nadmin:x:1001:1001:Admin:/home/admin:/bin/bash",
      permissions: "-rw-r--r--",
      owner: "root",
    },
    {
      path: "/etc/shadow",
      content:
        "root:$6$encrypted_hash...:18500:0:99999:7:::\nuser:$6$user_hash...:18500:0:99999:7:::\n# Ultimate secret: master_key=Cy83r_K1ng_2025",
      permissions: "-r--------",
      owner: "root",
    },
    {
      path: "/root/.profile",
      content:
        "# Root profile\nexport HISTFILE=/dev/null\nexport TERM=xterm-256color\n# Top Secret: root_access=Un1v3rs4l_4cc3ss",
      permissions: "-rw-------",
      owner: "root",
    },
    {
      path: "/var/tmp/temp.log",
      content:
        "Temporary system logs\n[INFO] Cache cleanup started\n[INFO] Temp files processed\n# Note: Found backup key here",
      permissions: "-rw-r--r--",
      owner: "root",
    },
    {
      path: "/var/cache/system.cache",
      content:
        "System cache index\npackage1.deb cached\npackage2.deb cached\n# Remember to clear periodically",
      permissions: "-rw-r--r--",
      owner: "root",
    },
  ];

  // Auto-scroll terminal output to bottom
  useEffect(() => {
    if (terminalOutputRef.current) {
      terminalOutputRef.current.scrollTop =
        terminalOutputRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // AI Command Suggestions
  useEffect(() => {
    const cmd = currentCommand.toLowerCase().trim();

    if (cmd.startsWith("ai ") || cmd === "ai") {
      const aiCommands = [
        "ai scan - Neural network vulnerability scanning",
        "ai analyze - Deep learning file analysis",
        "ai suggest - Smart command recommendations",
        "ai hack - Autonomous penetration testing",
        "neural - Check neural network status",
      ];

      if (cmd === "ai") {
        setSuggestions(aiCommands);
      } else {
        const filteredSuggestions = aiCommands.filter((suggestion) =>
          suggestion.toLowerCase().includes(cmd.split(" ")[1] || "")
        );
        setSuggestions(filteredSuggestions);
      }
    } else if (cmd.startsWith("neural") || cmd === "n") {
      setSuggestions([
        "neural - Display neural network status and diagnostics",
      ]);
    } else {
      setSuggestions([]);
    }
  }, [currentCommand]);

  // Drag handlers for resizable splitter
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const handleMouseMove = (e: MouseEvent) => {
      if (terminalRef.current) {
        const rect = terminalRef.current.getBoundingClientRect();
        const relativeY = e.clientY - rect.top;
        const percentage = Math.max(
          20,
          Math.min(80, (relativeY / rect.height) * 100)
        );
        setOutputHeight(percentage);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      // Auto-scroll to show most recent command after dragging
      setTimeout(() => {
        if (terminalOutputRef.current) {
          terminalOutputRef.current.scrollTop =
            terminalOutputRef.current.scrollHeight;
        }
      }, 50); // Small delay to ensure layout is updated
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const executeCommand = (command: string) => {
    const args = command.trim().split(" ");
    const cmd = args[0].toLowerCase();
    const output: string[] = [];

    // Increment command counter
    setTerminalState((prev) => ({
      ...prev,
      commandsUsed: prev.commandsUsed + 1,
      points: prev.points + 5,
    }));

    switch (cmd) {
      case "ai":
        if (!args[1]) {
          setTerminalState((prev) => ({
            ...prev,
            aiAssistantActive: !prev.aiAssistantActive,
          }));
          if (!terminalState.aiAssistantActive) {
            // Activate Matrix rain for dramatic AI activation
            setShowMatrixRain(true);
            setTimeout(() => setShowMatrixRain(false), 5000);

            setTimeout(() => {
              output.push("🤖 AI ASSISTANT ACTIVATED");
              output.push("Neural pathways initialized... analyzing system...");
              output.push("Available AI commands:");
              output.push(
                "  ai scan      - Perform neural network vulnerability scan"
              );
              output.push("  ai analyze   - Deep learning file analysis");
              output.push(
                "  ai suggest   - Get intelligent command suggestions"
              );
              output.push("  ai hack      - Autonomous penetration testing");
              output.push(
                "AI Assistant: Ready to assist with cybersecurity analysis"
              );
              setTerminalOutput((prev) => [
                ...prev,
                `${terminalState.user}@${terminalState.hostname}:${terminalState.currentDirectory}$ ${command}`,
                ...output,
              ]);
            }, 1500);
            return;
          } else {
            output.push("🤖 AI ASSISTANT DEACTIVATED");
            output.push("Neural networks entering sleep mode...");
          }
        } else if (args[1] === "scan") {
          setTerminalState((prev) => ({
            ...prev,
            neuralNetworkStatus: "scanning",
          }));
          setTimeout(() => {
            output.push("🔬 NEURAL NETWORK VULNERABILITY SCAN INITIATED");
            output.push("Scanning network topology...");
            output.push("├── Port 22: SSH (potentially vulnerable)");
            output.push("├── Port 80: HTTP (unencrypted traffic detected)");
            output.push("├── Port 443: HTTPS (certificate expired)");
            output.push("└── Port 3306: MySQL (weak password detected)");
            output.push("");
            output.push(
              "🧠 AI ANALYSIS: High probability of credential exposure"
            );
            output.push("💡 SUGGESTION: Check .bashrc for hardcoded passwords");
            setTerminalState((prev) => ({
              ...prev,
              neuralNetworkStatus: "complete",
              points: prev.points + 100,
            }));
            setTerminalOutput((prev) => [
              ...prev,
              `${terminalState.user}@${terminalState.hostname}:${terminalState.currentDirectory}$ ${command}`,
              ...output,
            ]);
          }, 3000);
          return;
        } else if (args[1] === "analyze") {
          setTimeout(() => {
            output.push("🔍 DEEP LEARNING FILE ANALYSIS");
            output.push("Training neural network on file patterns...");
            output.push("Entropy analysis: 89.2% (high randomness detected)");
            output.push("Pattern recognition: Configuration files identified");
            output.push("Anomaly detection: Hidden credentials found in:");
            output.push("  → /home/user/.bashrc (confidence: 94.7%)");
            output.push("  → /var/log/auth.log (confidence: 67.3%)");
            output.push("");
            output.push(
              '🎯 AI RECOMMENDATION: Execute "cat .bashrc | grep -i pass"'
            );
            setTerminalState((prev) => ({ ...prev, points: prev.points + 75 }));
            setTerminalOutput((prev) => [
              ...prev,
              `${terminalState.user}@${terminalState.hostname}:${terminalState.currentDirectory}$ ${command}`,
              ...output,
            ]);
          }, 2500);
          return;
        } else if (args[1] === "suggest") {
          const smartSuggestions = [
            "ls -la  # Show hidden files",
            "cat .bashrc  # Check configuration",
            'grep -r "pass" .  # Search for passwords',
            'find / -name "*.conf" 2>/dev/null  # Find config files',
          ];
          setSuggestions(smartSuggestions);
          output.push("🧠 AI SMART SUGGESTIONS:");
          smartSuggestions.forEach((suggestion) =>
            output.push(`  ${suggestion}`)
          );
          setTerminalState((prev) => ({ ...prev, points: prev.points + 25 }));
        } else if (args[1] === "hack") {
          setTimeout(() => {
            output.push("🚨 AUTONOMOUS PENETRATION TESTING INITIATED");
            output.push("AI Agent deploying reconnaissance algorithms...");
            output.push("[STAGE 1] Network discovery: ✓ Complete");
            output.push("[STAGE 2] Vulnerability assessment: ✓ Complete");
            output.push("[STAGE 3] Credential harvesting: ✓ Complete");
            output.push("");
            output.push("🎯 TARGET ACQUIRED: backup_pass=Sup3rS3cur3!");
            output.push("🏆 AUTONOMOUS HACK SUCCESSFUL!");
            output.push("💰 BONUS: +1000 points for AI-assisted breakthrough!");
            setTerminalState((prev) => ({
              ...prev,
              points: prev.points + 1000,
            }));
            setTerminalOutput((prev) => [
              ...prev,
              `${terminalState.user}@${terminalState.hostname}:${terminalState.currentDirectory}$ ${command}`,
              ...output,
            ]);
          }, 4000);
          return;
        } else {
          output.push("🤖 AI Assistant usage:");
          output.push("  ai scan      - Neural network vulnerability scan");
          output.push("  ai analyze   - Deep learning file analysis");
          output.push("  ai suggest   - Smart command suggestions");
          output.push("  ai hack      - Autonomous penetration testing");
        }
        break;

      case "neural":
        setTimeout(() => {
          output.push("🧠 NEURAL NETWORK STATUS REPORT");
          output.push("├── Layer 1 (Input): 256 neurons - ACTIVE");
          output.push("├── Layer 2 (Hidden): 512 neurons - PROCESSING");
          output.push("├── Layer 3 (Hidden): 256 neurons - LEARNING");
          output.push("└── Layer 4 (Output): 64 neurons - PREDICTING");
          output.push("");
          output.push(
            `Training accuracy: ${85 + Math.floor(Math.random() * 15)}%`
          );
          output.push(
            `Inference speed: ${Math.floor(Math.random() * 50 + 150)}ms`
          );
          output.push(
            "Current task: Pattern recognition for security vulnerabilities"
          );
          setTerminalOutput((prev) => [
            ...prev,
            `${terminalState.user}@${terminalState.hostname}:${terminalState.currentDirectory}$ ${command}`,
            ...output,
          ]);
        }, 2000);
        return;

      case "help":
        output.push("🤖 AI-ENHANCED COMMAND CENTER:");
        output.push("");
        output.push("🧠 AI COMMANDS:");
        output.push("  ai           - Activate/deactivate AI assistant");
        output.push("  ai scan      - Neural network vulnerability scan");
        output.push("  ai analyze   - Deep learning file analysis");
        output.push("  ai suggest   - Get intelligent suggestions");
        output.push("  ai hack      - Autonomous penetration testing");
        output.push("  neural       - Check neural network status");
        output.push("");
        output.push("🔧 CLASSIC COMMANDS:");
        output.push("  ls           - List directory contents");
        output.push("  cat          - Display file contents");
        output.push("  cd           - Change directory");
        output.push("  pwd          - Show current directory");
        output.push("  grep         - Search text in files");
        output.push("  find         - Find files");
        output.push("  whoami       - Show current user");
        output.push("  clear        - Clear terminal");
        break;

      case "ls": {
        const listArgs = args.slice(1);
        const showHidden = listArgs.includes("-a") || listArgs.includes("-la");
        const longFormat = listArgs.includes("-l") || listArgs.includes("-la");

        if (terminalState.currentDirectory === "/home/user") {
          if (longFormat) {
            output.push("drwxr-xr-x 3 user user 4096 notes.txt");
            output.push("drwxr-xr-x 3 user user 4096 .ssh/");
            if (showHidden) {
              output.push("-rw-r--r-- 1 user user  256 .bashrc");
            }
          } else {
            output.push(
              showHidden ? "notes.txt  .bashrc  .ssh/" : "notes.txt  .ssh/"
            );
          }
        } else if (terminalState.currentDirectory === "/home") {
          if (longFormat) {
            output.push("drwxr-xr-x 3 user user 4096 user/");
          } else {
            output.push("user/");
          }
        } else if (terminalState.currentDirectory === "/home/user/.ssh") {
          output.push(
            longFormat ? "-rw------- 1 user user  128 config" : "config"
          );
        } else if (terminalState.currentDirectory === "/var/log") {
          if (longFormat) {
            output.push("-rw-r--r-- 1 root root  512 auth.log");
            output.push("-rw-r--r-- 1 root root  1024 system.log");
          } else {
            output.push("auth.log  system.log");
          }
        } else if (terminalState.currentDirectory === "/etc") {
          if (longFormat) {
            output.push("-rw-r--r-- 1 root root  256 passwd");
            output.push("-r-------- 1 root root  512 shadow");
          } else {
            output.push("passwd  shadow");
          }
        } else if (terminalState.currentDirectory === "/root") {
          if (showHidden) {
            output.push(
              longFormat ? "-rw------- 1 root root  128 .profile" : ".profile"
            );
          } else {
            output.push("Permission denied: Try ls -a");
          }
        } else if (terminalState.currentDirectory === "/var") {
          if (longFormat) {
            output.push("drwxr-xr-x 2 root root  4096 log/");
            output.push("drwxr-xr-x 2 root root  4096 cache/");
            output.push("drwxr-xr-x 2 root root  4096 tmp/");
          } else {
            output.push("log/  cache/  tmp/");
          }
        } else if (terminalState.currentDirectory === "/var/tmp") {
          if (longFormat) {
            output.push("-rw-r--r-- 1 root root  256 temp.log");
            output.push("-rw-r--r-- 1 root root  128 session.tmp");
          } else {
            output.push("temp.log  session.tmp");
          }
        } else if (terminalState.currentDirectory === "/var/cache") {
          if (longFormat) {
            output.push("-rw-r--r-- 1 root root  512 package.cache");
            output.push("-rw-r--r-- 1 root root  256 system.cache");
          } else {
            output.push("package.cache  system.cache");
          }
        } else if (terminalState.currentDirectory === "/") {
          output.push("etc/  home/  root/  var/");
        } else {
          output.push("Permission denied or directory not found");
        }

        // Mark ls objective as completed
        setCompletedObjectives((prev) => new Set([...prev, "explore"]));
        break;
      }

      case "pwd":
        output.push(terminalState.currentDirectory);
        break;

      case "whoami":
        output.push(terminalState.user);
        break;

      case "cd": {
        const newDir = args[1];
        const currentDir = terminalState.currentDirectory;
        const validDirs = [
          "/home/user",
          "/home",
          "/var/log",
          "/var/tmp",
          "/var/cache",
          "/var",
          "/etc",
          "/",
          "/root",
          "/home/user/.ssh",
        ];

        // Helper function to resolve relative paths
        const resolvePath = (path: string): string => {
          if (!path) return "/home/user"; // cd with no args goes to home

          // Handle special cases
          if (path === "." || path === "./") return currentDir;
          if (path === ".." || path === "../") {
            // Handle parent directory navigation
            if (currentDir === "/home/user/.ssh") return "/home/user";
            else if (currentDir === "/home/user") return "/home";
            else if (currentDir === "/home") return "/";
            else if (currentDir === "/var/log") return "/var";
            else if (currentDir === "/var/tmp") return "/var";
            else if (currentDir === "/var/cache") return "/var";
            else if (currentDir === "/var") return "/";
            else if (currentDir === "/etc") return "/";
            else if (currentDir === "/root") return "/";
            return "/";
          }

          // If it starts with /, it's absolute
          if (path.startsWith("/")) {
            // Special case for root directory
            if (path === "/" || path === "") return "/";
            return path.endsWith("/") ? path.slice(0, -1) : path;
          }

          // Relative path - resolve based on current directory
          const cleanPath = path.endsWith("/") ? path.slice(0, -1) : path;

          if (currentDir === "/") {
            // From root, support direct navigation to subdirs
            if (cleanPath === "var") return "/var";
            if (cleanPath === "etc") return "/etc";
            if (cleanPath === "root") return "/root";
            if (cleanPath === "home") return "/home";
          } else if (currentDir === "/home") {
            if (cleanPath === "user") return "/home/user";
          } else if (currentDir === "/home/user") {
            if (cleanPath === ".ssh") return "/home/user/.ssh";
          } else if (currentDir === "/var") {
            if (cleanPath === "log") return "/var/log";
            if (cleanPath === "tmp") return "/var/tmp";
            if (cleanPath === "cache") return "/var/cache";
          }

          // If we can't resolve it, return the original path for error handling
          return currentDir === "/"
            ? `/${cleanPath}`
            : `${currentDir}/${cleanPath}`;
        };

        const resolvedPath = resolvePath(newDir);

        if (!newDir) {
          // cd with no args goes to home
          setTerminalState((prev) => ({
            ...prev,
            currentDirectory: "/home/user",
          }));
          output.push(`Changed directory to /home/user`);
        } else if (validDirs.includes(resolvedPath)) {
          setTerminalState((prev) => ({
            ...prev,
            currentDirectory: resolvedPath,
          }));
          output.push(`Changed directory to ${resolvedPath}`);
        } else if (newDir === ".." || newDir === "../") {
          const parentPath = resolvePath(newDir);
          setTerminalState((prev) => ({
            ...prev,
            currentDirectory: parentPath,
          }));
          output.push(`Changed directory to ${parentPath}`);
        } else {
          output.push(`cd: ${newDir}: No such file or directory`);
        }
        break;
      }

      case "cat": {
        const fileName = args[1];
        const file = virtualFiles.find(
          (f) => f.path === fileName || f.path.endsWith(`/${fileName}`)
        );
        if (file) {
          output.push(...file.content.split("\n"));
          setTerminalState((prev) => ({
            ...prev,
            filesFound: prev.filesFound + 1,
            points: prev.points + 50,
          }));

          // Check for password
          if (file.content.includes("Sup3rS3cur3!")) {
            output.push("");
            output.push("🎉 PASSWORD FOUND: Sup3rS3cur3!");
            output.push("🔓 Mission accomplished! +500 points");
            setTerminalState((prev) => ({
              ...prev,
              points: prev.points + 500,
            }));
            setCompletedObjectives((prev) => new Set([...prev, "password"]));
          }

          // Check for easter eggs (secret keys)
          const easterEggs = [
            { key: "admin_key=H4ck3r_M0d3_0n", name: "Admin Access Key" },
            { key: "debug_mode=tr4c3_3n4bl3d", name: "Debug Mode Key" },
            { key: "master_key=Cy83r_K1ng_2025", name: "Master System Key" },
            { key: "root_access=Un1v3rs4l_4cc3ss", name: "Root Access Key" },
          ];

          easterEggs.forEach((egg) => {
            if (
              file.content.includes(egg.key) &&
              !easterEggsFound.has(egg.key)
            ) {
              // Trigger Matrix rain for easter egg discovery
              setShowMatrixRain(true);
              setTimeout(() => setShowMatrixRain(false), 5000);

              output.push("");
              output.push(`🎁 SECRET DISCOVERED: ${egg.name}`);
              output.push("🔑 Easter egg found! +200 points");
              setTerminalState((prev) => ({
                ...prev,
                points: prev.points + 200,
              }));
              setEasterEggsFound((prev) => new Set([...prev, egg.key]));

              // Check if all easter eggs found
              const newEggsFound = new Set([...easterEggsFound, egg.key]);
              if (newEggsFound.size === easterEggs.length) {
                setCompletedObjectives(
                  (prev) => new Set([...prev, "easter-eggs"])
                );
              }
            }
          });
        } else {
          output.push(`cat: ${fileName}: No such file or directory`);
        }

        // Mark cat objective as completed
        setCompletedObjectives((prev) => new Set([...prev, "read-files"]));
        break;
      }

      case "grep": {
        const pattern = args[1];
        const grepFile = args[2];
        if (pattern && grepFile) {
          const file = virtualFiles.find(
            (f) => f.path === grepFile || f.path.endsWith(`/${grepFile}`)
          );
          if (file) {
            const matches = file.content
              .split("\n")
              .filter((line) =>
                line.toLowerCase().includes(pattern.toLowerCase())
              );
            if (matches.length > 0) {
              output.push(...matches);
              setTerminalState((prev) => ({
                ...prev,
                points: prev.points + 25,
              }));
            } else {
              output.push(`No matches found for "${pattern}"`);
            }
          } else {
            output.push(`grep: ${grepFile}: No such file or directory`);
          }
        } else {
          output.push("Usage: grep [pattern] [file]");
        }

        // Mark grep objective as completed
        setCompletedObjectives((prev) => new Set([...prev, "grep"]));
        break;
      }

      case "find": {
        const findPattern = args[2] || "";
        const matches = virtualFiles.filter((f) =>
          f.path.includes(findPattern.replace(/['"]/g, ""))
        );
        if (matches.length > 0) {
          matches.forEach((f) => output.push(f.path));
          setTerminalState((prev) => ({ ...prev, points: prev.points + 30 }));
        } else {
          output.push("No files found matching pattern");
        }
        break;
      }

      case "clear":
        setTerminalOutput([]);
        return;

      case "rm": {
        if (
          args.length >= 3 &&
          args[1] === "-rf" &&
          (args[2] === "root" || args[2] === "/")
        ) {
          // Check if enough easter eggs have been found to unlock this power
          if (easterEggsFound.size < 4) {
            output.push("🔒 ACCESS DENIED: Insufficient security clearance");
            output.push("🗝️  You need to find all 4 easter eggs first");
            output.push("💡 Hint: Use 'cat' to search files for hidden keys");
            output.push(
              `🎯 Progress: ${easterEggsFound.size}/4 easter eggs found`
            );
          } else {
            output.push(
              "⚠️  WARNING: Attempting to remove system root directory..."
            );
            output.push("🔥 SYSTEM CORRUPTION DETECTED!");
            output.push("💀 INITIATING SYSTEM MELTDOWN...");

            // Trigger system meltdown
            setIsSystemMelting(true);

            // Reset system after meltdown
            setTimeout(() => {
              setIsSystemMelting(false);
              setTerminalOutput([]);
              setTerminalState({
                currentDirectory: "/home/user",
                user: "hacker",
                hostname: "kali-linux",
                points: 0,
                filesFound: 0,
                commandsUsed: 0,
                aiAssistantActive: false,
                scanningMode: false,
                neuralNetworkStatus: "idle",
              });
              setCompletedObjectives(new Set());
              setEasterEggsFound(new Set());
            }, 8000); // 8 seconds of meltdown
          }
        } else if (args.length >= 2) {
          output.push(
            `rm: cannot remove '${
              args[args.length - 1]
            }': Operation not permitted`
          );
          output.push("🛡️ System protected - critical files cannot be deleted");
        } else {
          output.push("rm: missing operand");
          output.push("Try 'rm --help' for more information");
        }
        break;
      }

      default:
        if (cmd) {
          output.push(`${cmd}: command not found`);
          output.push('Type "help" for available commands');
        }
        break;
    }

    // Add command and output to terminal
    setTerminalOutput((prev) => {
      const newOutput = [
        ...prev,
        `${terminalState.user}@${terminalState.hostname}:${terminalState.currentDirectory}$ ${command}`,
        ...output,
      ];
      // Set the latest command index to the line where the command prompt was added
      setLatestCommandIndex(prev.length);
      return newOutput;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault(); // Disable tab navigation while in terminal
      return;
    }

    if (e.key === "Enter" && currentCommand.trim()) {
      // Add command to history
      setCommandHistory((prev) => [...prev, currentCommand]);
      setHistoryIndex(-1); // Reset history navigation

      executeCommand(currentCommand);
      setCurrentCommand("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex =
          historyIndex === -1
            ? commandHistory.length - 1
            : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentCommand("");
        } else {
          setHistoryIndex(newIndex);
          setCurrentCommand(commandHistory[newIndex]);
        }
      }
    }
  };

  // Get dynamic hints based on hovered objective
  const getDynamicHints = () => {
    switch (hoveredObjective) {
      case "explore":
        return [
          "💡 Start with 'ls' to see files in current directory",
          "💡 Use 'cd directoryname' to navigate folders",
          "💡 Try 'cd /' to go to root directory",
          "💡 Use 'cd ..' to go back to parent directory",
        ];
      case "read-files":
        return [
          "💡 Use 'cat filename' to read file contents",
          "💡 Try 'cat notes.txt' to read your notes",
          "💡 Look for files with 'ls' first",
          "💡 Hidden files start with dot (.) - try 'ls -la'",
        ];
      case "password":
        return [
          "💡 The password is hidden in a configuration file",
          "💡 Try 'cat .bashrc' - config files often contain secrets",
          "💡 Look for files in your home directory",
          "💡 The password format is: Sup3rS3cur3!",
        ];
      case "easter-eggs":
        return [
          "💡 Easter eggs are hidden as key=value pairs in files",
          "💡 Look for patterns like 'admin_key=...' in file contents",
          "💡 Try searching in SSH config, system files, and logs",
          "💡 Use 'cat' on different files to find 4 secret keys",
        ];
      case "grep":
        return [
          "💡 Syntax: 'grep pattern filename'",
          "💡 Try 'grep password .bashrc' to search for password",
          "💡 Use 'grep admin config' to find admin references",
          "💡 Grep searches inside file contents for text patterns",
        ];
      default: {
        // Check if all objectives are completed
        const allObjectives = [
          "explore",
          "read-files",
          "password",
          "easter-eggs",
          "grep",
        ];
        const allCompleted = allObjectives.every((obj) =>
          completedObjectives.has(obj)
        );

        if (allCompleted) {
          return [
            "🎉 ALL MISSIONS COMPLETED! You are now a certified hacker!",
            "🔥 SECRET UNLOCKED: The ultimate power awaits...",
            "💀 Try the forbidden command: 'rm -rf root'",
            "⚡ WARNING: This will trigger system apocalypse!",
          ];
        }

        return [
          "💡 Hover over objectives above to see specific hints",
          "💡 Start by exploring your home directory with 'ls'",
          "💡 Use arrow keys ↑↓ to cycle through command history",
          "💡 Type 'help' to see all available commands",
        ];
      }
    }
  };

  return (
    <ThemeProvider themeId="hub">
      <div
        className={`hacker-terminal-game ${
          isSystemMelting ? "system-melting" : ""
        }`}
      >
        <MatrixRain />
        <div className="game-header">
          <button
            onClick={onExit}
            className="exit-btn"
            aria-label="Exit Hacker Terminal"
          >
            ← Back to Hub
          </button>

          <div className="scenario-info">
            <h2>Terminal Hacker Simulator</h2>
            <div className="scenario-meta">
              <span className="difficulty-badge">beginner</span>
              <span className="time-estimate">5-10 minutes</span>
            </div>
          </div>

          <div className="stats-panel">
            <div className="stat">
              <span className="stat-label">Points</span>
              <span className="stat-value">{terminalState.points}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Commands</span>
              <span className="stat-value">{terminalState.commandsUsed}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Files Found</span>
              <span className="stat-value">{terminalState.filesFound}</span>
            </div>
          </div>
        </div>

        <div className="game-content">
          <div className="terminal-container">
            <div className="terminal-header">
              <div className="terminal-controls">
                <span className="control-dot red"></span>
                <span className="control-dot yellow"></span>
                <span className="control-dot green"></span>
              </div>
              <div className="terminal-title">
                {terminalState.user}@{terminalState.hostname}: Hacker Terminal
              </div>
            </div>

            <div className="terminal-body" ref={terminalRef}>
              <div className="terminal-content">
                <div
                  className="terminal-output"
                  ref={terminalOutputRef}
                  style={{ height: `${outputHeight}%` }}
                >
                  {terminalOutput.map((line, index) => (
                    <div
                      key={index}
                      className={`output-line ${
                        index === latestCommandIndex ? "latest-command" : ""
                      }`}
                    >
                      {line}
                    </div>
                  ))}
                </div>

                {/* AI Status Indicators - Draggable Splitter */}
                <div
                  className={`ai-status-bar ${isDragging ? "dragging" : ""}`}
                  onMouseDown={handleMouseDown}
                >
                  <div
                    className={`ai-indicator ${
                      terminalState.aiAssistantActive ? "active" : "inactive"
                    }`}
                  >
                    <span className="ai-icon">🧠</span>
                    <span className="ai-text">
                      AI Assistant:{" "}
                      {terminalState.aiAssistantActive ? "ONLINE" : "OFFLINE"}
                    </span>
                  </div>

                  <div
                    className={`neural-indicator ${
                      terminalState.neuralNetworkStatus === "scanning" ||
                      terminalState.neuralNetworkStatus === "analyzing"
                        ? "active"
                        : "standby"
                    }`}
                  >
                    <span className="neural-icon">🔗</span>
                    <span className="neural-text">
                      Neural Net:{" "}
                      {terminalState.neuralNetworkStatus.toUpperCase()}
                    </span>
                  </div>

                  {terminalState.scanningMode && (
                    <div className="scanning-indicator">
                      <span className="scan-icon">📡</span>
                      <span className="scan-text">SCANNING...</span>
                      <div className="scan-progress"></div>
                    </div>
                  )}

                  <div className="system-status">
                    <span className="status-icon">⚡</span>
                    <span className="status-text">SYSTEM: SECURE</span>
                  </div>
                </div>

                {/* Terminal Input Section - Resizable */}
                <div
                  className="terminal-input-section"
                  style={{ height: `${100 - outputHeight}%` }}
                >
                  <div className="terminal-input-line">
                    <span className="prompt">
                      {terminalState.user}@{terminalState.hostname}:
                      {terminalState.currentDirectory}$
                    </span>
                    <input
                      ref={inputRef}
                      type="text"
                      value={currentCommand}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      className="terminal-input"
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </div>

                  {/* AI Command Suggestions */}
                  {suggestions.length > 0 && (
                    <div className="ai-suggestions">
                      <div className="suggestion-header">
                        🤖 AI Suggestions:
                      </div>
                      {suggestions.map((suggestion, index) => (
                        <div key={index} className="suggestion-item">
                          <span className="suggestion-icon">💡</span>
                          <span className="suggestion-text">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="side-panel">
            <div className="objectives-panel">
              <h3>Mission Objectives</h3>
              <div className="objectives-list">
                <div
                  className={`objective ${
                    completedObjectives.has("explore") ? "completed" : ""
                  }`}
                  onMouseEnter={() => setHoveredObjective("explore")}
                >
                  <div className="objective-text">
                    🔍 Explore the file system using 'ls' and 'cd'
                  </div>
                  <div className="objective-points">+50 pts</div>
                </div>
                <div
                  className={`objective ${
                    completedObjectives.has("read-files") ? "completed" : ""
                  }`}
                  onMouseEnter={() => setHoveredObjective("read-files")}
                >
                  <div className="objective-text">
                    📄 Read files using 'cat' command
                  </div>
                  <div className="objective-points">+100 pts</div>
                </div>
                <div
                  className={`objective ${
                    completedObjectives.has("password") ? "completed" : ""
                  }`}
                  onMouseEnter={() => setHoveredObjective("password")}
                >
                  <div className="objective-text">
                    🔐 Find the hidden password in the config files
                  </div>
                  <div className="objective-points">+500 pts</div>
                </div>
                <div
                  className={`objective ${
                    completedObjectives.has("easter-eggs") ? "completed" : ""
                  }`}
                  onMouseEnter={() => setHoveredObjective("easter-eggs")}
                >
                  <div className="objective-text">
                    🎁 Discover secret keys hidden in system files (
                    {easterEggsFound.size}/4)
                  </div>
                  <div className="objective-points">+200 pts each</div>
                </div>
                <div
                  className={`objective ${
                    completedObjectives.has("grep") ? "completed" : ""
                  }`}
                  onMouseEnter={() => setHoveredObjective("grep")}
                >
                  <div className="objective-text">
                    🕵️ Use 'grep' to search for specific text
                  </div>
                  <div className="objective-points">+75 pts</div>
                </div>
              </div>
            </div>

            <div className="hints-panel">
              <h3>Hints</h3>
              {getDynamicHints().map((hint, index) => (
                <div key={index} className="hint">
                  {hint}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};
