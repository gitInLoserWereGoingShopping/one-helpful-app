import React, { useState, useEffect, useCallback, useRef } from "react";
import type { GameProps } from "../../types/game";
import { gameUtils } from "../../utils/gameUtils";
import { ThemeProvider } from "../../styles/ThemeProvider";
import "./PuzzleBlast.css";
import {
  LEVELS,
  PIECE_TYPES,
  KNOWLEDGE_TREASURES,
  generateRandomTreasures,
  calculateChainMultiplier,
  type PuzzlePiece,
  type BlastGameState,
  type ExplosionAnimation,
  type ScorePopup,
  type Particle,
  ANIMATION_CONFIG,
} from "./PuzzleBlastPlan";
import "./PuzzleBlast.css";

export const PuzzleBlastGame: React.FC<GameProps> = ({
  onComplete,
  onExit,
}) => {
  const [gameState, setGameState] = useState<BlastGameState>({
    level: 1,
    score: 0,
    timeRemaining: undefined,
    grid: [],
    treasureCollection: {},
    combo: 0,
    isGameComplete: false,
    isPaused: false,
    explosions: [],
    floatingScores: [],
  });

  const [gameStartTime] = useState(Date.now());
  const animationFrameRef = useRef<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const currentLevel =
    LEVELS.find((l) => l.id === gameState.level) || LEVELS[0];

  // Initialize grid for current level
  const initializeGrid = useCallback(() => {
    const { width, height } = currentLevel.gridSize;
    const { pieceDistribution } = currentLevel;

    // Create weighted array for piece type selection
    const pieceTypes: Array<keyof typeof PIECE_TYPES> = [];
    Object.entries(pieceDistribution).forEach(([type, weight]) => {
      for (let i = 0; i < weight; i++) {
        pieceTypes.push(type as keyof typeof PIECE_TYPES);
      }
    });

    const newGrid: (PuzzlePiece | null)[][] = [];
    for (let y = 0; y < height; y++) {
      newGrid[y] = [];
      for (let x = 0; x < width; x++) {
        const typeKey =
          pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
        const pieceConfig = PIECE_TYPES[typeKey];

        const treasureCount =
          Math.floor(
            Math.random() *
              (pieceConfig.treasureCount[1] - pieceConfig.treasureCount[0] + 1)
          ) + pieceConfig.treasureCount[0];

        newGrid[y][x] = {
          id: `piece-${x}-${y}`,
          x,
          y,
          type: typeKey,
          color: pieceConfig.color,
          health: pieceConfig.health,
          maxHealth: pieceConfig.health,
          treasures: generateRandomTreasures(treasureCount),
          isExploding: false,
          isDestroyed: false,
          chainMultiplier: 1,
        };
      }
    }

    setGameState((prev) => ({
      ...prev,
      grid: newGrid,
      timeRemaining: currentLevel.timeLimit,
    }));
  }, [currentLevel]);

  // Handle piece click/blast
  const blastPiece = useCallback(
    (x: number, y: number) => {
      if (gameState.isPaused || gameState.isGameComplete) return;

      setGameState((prev) => {
        const newGrid = [...prev.grid];
        const piece = newGrid[y]?.[x];

        if (!piece || piece.isDestroyed || piece.isExploding) return prev;

        // Damage the piece
        piece.health -= 1;

        if (piece.health <= 0) {
          // Start explosion animation
          piece.isExploding = true;

          // Create explosion animation
          const explosion: ExplosionAnimation = {
            id: `explosion-${Date.now()}-${Math.random()}`,
            x: x * 60 + 30, // Grid cell size is 60px
            y: y * 60 + 30,
            startTime: Date.now(),
            particles: generateExplosionParticles(
              x * 60 + 30,
              y * 60 + 30,
              piece.color
            ),
          };

          // Calculate score with chain multiplier
          const baseScore = PIECE_TYPES[piece.type].points;
          const finalScore = Math.round(baseScore * piece.chainMultiplier);

          // Create floating score
          const scorePopup: ScorePopup = {
            id: `score-${Date.now()}-${Math.random()}`,
            x: x * 60 + 30,
            y: y * 60 + 30,
            score: finalScore,
            startTime: Date.now(),
            color: piece.color,
          };

          // Collect treasures
          const newTreasureCollection = { ...prev.treasureCollection };
          piece.treasures.forEach((treasure) => {
            newTreasureCollection[treasure.id] =
              (newTreasureCollection[treasure.id] || 0) + 1;
          });

          // Handle chain reactions
          const explosionRadius = PIECE_TYPES[piece.type].explosionRadius;
          const chainPieces: Array<{ x: number; y: number }> = [];

          if (explosionRadius > 0) {
            for (let dy = -explosionRadius; dy <= explosionRadius; dy++) {
              for (let dx = -explosionRadius; dx <= explosionRadius; dx++) {
                if (dx === 0 && dy === 0) continue;
                const chainX = x + dx;
                const chainY = y + dy;

                if (
                  chainX >= 0 &&
                  chainX < newGrid[0].length &&
                  chainY >= 0 &&
                  chainY < newGrid.length
                ) {
                  const chainPiece = newGrid[chainY][chainX];
                  if (
                    chainPiece &&
                    !chainPiece.isDestroyed &&
                    !chainPiece.isExploding
                  ) {
                    chainPiece.chainMultiplier = calculateChainMultiplier(
                      prev.combo + 1
                    );
                    chainPieces.push({ x: chainX, y: chainY });
                  }
                }
              }
            }
          }

          // Schedule piece destruction
          setTimeout(() => {
            setGameState((currentState) => {
              const updatedGrid = [...currentState.grid];
              const targetPiece = updatedGrid[y]?.[x];
              if (targetPiece) {
                targetPiece.isDestroyed = true;
                targetPiece.isExploding = false;
              }
              return { ...currentState, grid: updatedGrid };
            });
          }, ANIMATION_CONFIG.explosion.duration * 1000);

          // Trigger chain reactions with delay
          if (chainPieces.length > 0) {
            chainPieces.forEach((chainPos, index) => {
              setTimeout(() => {
                blastPiece(chainPos.x, chainPos.y);
              }, ANIMATION_CONFIG.chainReaction.delay * 1000 * (index + 1));
            });
          }

          return {
            ...prev,
            grid: newGrid,
            score: prev.score + finalScore,
            combo: prev.combo + 1,
            explosions: [...prev.explosions, explosion],
            floatingScores: [...prev.floatingScores, scorePopup],
            treasureCollection: newTreasureCollection,
          };
        }

        return { ...prev, grid: newGrid };
      });
    },
    [gameState.isPaused, gameState.isGameComplete]
  );

  // Generate explosion particles
  const generateExplosionParticles = (
    x: number,
    y: number,
    color: string
  ): Particle[] => {
    const particles: Particle[] = [];
    const particleCount = ANIMATION_CONFIG.explosion.particleCount;

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const speed =
        ANIMATION_CONFIG.explosion.particleSpeed * (0.5 + Math.random() * 0.5);

      particles.push({
        id: `particle-${i}`,
        startX: x,
        startY: y,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        color,
        life: ANIMATION_CONFIG.explosion.particleLife,
        maxLife: ANIMATION_CONFIG.explosion.particleLife,
      });
    }

    return particles;
  };

  // Animation loop
  const animate = useCallback(() => {
    const now = Date.now();

    setGameState((prev) => {
      // Update explosions
      const activeExplosions = prev.explosions.filter(
        (explosion) =>
          now - explosion.startTime < ANIMATION_CONFIG.explosion.duration * 1000
      );

      // Update floating scores
      const activeScores = prev.floatingScores.filter(
        (score) =>
          now - score.startTime < ANIMATION_CONFIG.scorePopup.duration * 1000
      );

      // Update timer
      let newTimeRemaining = prev.timeRemaining;
      if (newTimeRemaining !== undefined && newTimeRemaining > 0) {
        newTimeRemaining = Math.max(0, newTimeRemaining - 0.016); // Roughly 60fps
      }

      return {
        ...prev,
        explosions: activeExplosions,
        floatingScores: activeScores,
        timeRemaining: newTimeRemaining,
      };
    });

    animationFrameRef.current = requestAnimationFrame(animate);
  }, []);

  // Check for level completion
  useEffect(() => {
    const isLevelComplete = gameState.score >= currentLevel.targetScore;
    const isTimeUp =
      gameState.timeRemaining !== undefined && gameState.timeRemaining <= 0;

    if (isLevelComplete && !gameState.isGameComplete) {
      if (gameState.level < LEVELS.length) {
        // Next level
        setTimeout(() => {
          setGameState((prev) => ({ ...prev, level: prev.level + 1 }));
        }, 2000);
      } else {
        // Game complete
        const totalTime = Math.floor((Date.now() - gameStartTime) / 1000);
        onComplete({
          score: gameState.score,
          timeSpent: totalTime,
          completedAt: new Date(),
          improvements: gameUtils.generateFeedback(
            gameState.score,
            totalTime,
            "puzzle"
          ),
          levelsCompleted: gameState.level,
          treasuresFound: Object.keys(gameState.treasureCollection).length,
          maxCombo: gameState.combo,
        });
      }
    } else if (isTimeUp && !gameState.isGameComplete) {
      // Time's up - end game
      const totalTime = Math.floor((Date.now() - gameStartTime) / 1000);
      onComplete({
        score: gameState.score,
        timeSpent: totalTime,
        completedAt: new Date(),
        improvements: [
          "Try to blast pieces faster!",
          "Look for chain reactions!",
        ],
        levelsCompleted: gameState.level - 1,
        treasuresFound: Object.keys(gameState.treasureCollection).length,
        maxCombo: gameState.combo,
      });
    }
  }, [
    gameState.score,
    gameState.timeRemaining,
    gameState.level,
    currentLevel.targetScore,
    gameState.isGameComplete,
    onComplete,
    gameStartTime,
    gameState.combo,
    gameState.treasureCollection,
  ]);

  // Initialize grid when level changes
  useEffect(() => {
    initializeGrid();
  }, [gameState.level, initializeGrid]);

  // Start animation loop
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate]);

  return (
    <ThemeProvider themeId="hub">
      <div className="puzzle-blast-game">
        <div className="game-header">
          <button onClick={onExit} className="btn btn-ghost exit-btn">
            ← Back to Hub
          </button>

          <div className="level-info">
            <h2>💥 {currentLevel.name}</h2>
            <div className="level-meta">
              <span className="level-badge">Level {gameState.level}</span>
              <span className="target-score">
                Target: {currentLevel.targetScore.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="stats-panel">
            <div className="stat">
              <span className="stat-label">Score</span>
              <span className="stat-value">
                {gameState.score.toLocaleString()}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Combo</span>
              <span className="stat-value">x{gameState.combo}</span>
            </div>
            {gameState.timeRemaining !== undefined && (
              <div className="stat">
                <span className="stat-label">Time</span>
                <span className="stat-value">
                  {Math.ceil(gameState.timeRemaining)}s
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="game-content">
          <div className="puzzle-grid-container">
            <div
              ref={gridRef}
              className="puzzle-grid"
              style={{
                gridTemplateColumns: `repeat(${currentLevel.gridSize.width}, 1fr)`,
                gridTemplateRows: `repeat(${currentLevel.gridSize.height}, 1fr)`,
              }}
            >
              {gameState.grid.map((row, y) =>
                row.map((piece, x) =>
                  piece && !piece.isDestroyed ? (
                    <div
                      key={piece.id}
                      className={`puzzle-piece ${piece.type} ${
                        piece.isExploding ? "exploding" : ""
                      }`}
                      style={{
                        backgroundColor: piece.color,
                        opacity: piece.health / piece.maxHealth,
                      }}
                      onClick={() => blastPiece(x, y)}
                    >
                      <div className="piece-health">
                        {piece.health > 1 && piece.health}
                      </div>
                      <div className="treasure-count">
                        {piece.treasures.length > 0 &&
                          `${piece.treasures.length}💎`}
                      </div>
                      {piece.chainMultiplier > 1 && (
                        <div className="chain-multiplier">
                          x{piece.chainMultiplier.toFixed(1)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div key={`empty-${x}-${y}`} className="empty-cell" />
                  )
                )
              )}

              {/* Render explosions */}
              {gameState.explosions.map((explosion) => (
                <div
                  key={explosion.id}
                  className="explosion"
                  style={{
                    left: explosion.x,
                    top: explosion.y,
                    position: "absolute",
                    pointerEvents: "none",
                  }}
                >
                  {explosion.particles.map((particle) => (
                    <div
                      key={particle.id}
                      className="explosion-particle"
                      style={{
                        backgroundColor: particle.color,
                        animationDuration: `${particle.maxLife}s`,
                      }}
                    />
                  ))}
                </div>
              ))}

              {/* Render floating scores */}
              {gameState.floatingScores.map((score) => (
                <div
                  key={score.id}
                  className="floating-score"
                  style={{
                    left: score.x,
                    top: score.y,
                    color: score.color,
                    position: "absolute",
                    pointerEvents: "none",
                  }}
                >
                  +{score.score}
                </div>
              ))}
            </div>
          </div>

          <div className="treasure-panel">
            <h3>🏆 Knowledge Treasures</h3>
            <div className="treasure-collection">
              {Object.entries(gameState.treasureCollection).map(
                ([treasureId, count]) => {
                  const treasure = KNOWLEDGE_TREASURES.find(
                    (t) => t.id === treasureId
                  );
                  if (!treasure) return null;

                  return (
                    <div
                      key={treasureId}
                      className={`treasure-item ${treasure.rarity}`}
                    >
                      <span className="treasure-icon">{treasure.icon}</span>
                      <span className="treasure-name">{treasure.name}</span>
                      <span className="treasure-count">x{count}</span>
                    </div>
                  );
                }
              )}
            </div>

            {currentLevel.specialRules && (
              <div className="special-rules">
                <h4>📜 Special Rules:</h4>
                <ul>
                  {currentLevel.specialRules.map((rule, index) => (
                    <li key={index}>{rule}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};
