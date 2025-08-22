import React, { useState } from "react";
import type { GameComponent, GameStats } from "../types/game";
import { gameUtils, GAME_CATEGORIES } from "../utils/gameUtils";
import "./GameHub.css";

interface GameHubProps {
  games: GameComponent[];
}

export const GameHub: React.FC<GameHubProps> = ({ games }) => {
  const [currentGame, setCurrentGame] = useState<GameComponent | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const handleGameComplete = (stats: GameStats) => {
    if (currentGame) {
      gameUtils.saveStats(currentGame.metadata.id, stats);

      // Show helpful feedback
      const feedback = gameUtils.generateFeedback(
        stats.score,
        stats.timeSpent,
        currentGame.metadata.category
      );

      // You could show a modal with feedback here
      console.log("Game completed!", { stats, feedback });
    }
    setCurrentGame(null);
  };

  const handleGameExit = () => {
    setCurrentGame(null);
  };

  const filteredGames =
    selectedCategory === "all"
      ? games
      : games.filter((game) => game.metadata.category === selectedCategory);

  if (currentGame) {
    const { Component } = currentGame;
    return (
      <Component onComplete={handleGameComplete} onExit={handleGameExit} />
    );
  }

  return (
    <div className="game-hub">
      <header className="hub-header">
        <h1>🎮 Helpful Game Hub</h1>
        <p>Modular mini-games that are fun AND beneficial</p>
      </header>

      <div className="category-filter">
        <button
          className={selectedCategory === "all" ? "active" : ""}
          onClick={() => setSelectedCategory("all")}
        >
          All Games
        </button>
        {Object.entries(GAME_CATEGORIES).map(([key, category]) => (
          <button
            key={key}
            className={selectedCategory === key ? "active" : ""}
            onClick={() => setSelectedCategory(key)}
            style={{ borderColor: category.color }}
          >
            {category.icon} {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>

      <div className="games-grid">
        {filteredGames.map((game) => {
          const bestScore = gameUtils.getBestScore(game.metadata.id);
          const category = GAME_CATEGORIES[game.metadata.category];

          return (
            <div
              key={game.metadata.id}
              className="game-card"
              style={{ borderLeftColor: category.color }}
              onClick={() => setCurrentGame(game)}
            >
              <div className="game-header">
                <span className="game-icon">{category.icon}</span>
                <h3>{game.metadata.title}</h3>
                <span className="difficulty">{game.metadata.difficulty}</span>
              </div>

              <p className="game-description">{game.metadata.description}</p>

              <div className="helpful-aspect">
                <strong>Helpful:</strong> {game.metadata.helpfulAspect}
              </div>

              <div className="game-stats">
                <span>⏱️ {game.metadata.estimatedTime}</span>
                {bestScore > 0 && <span>🏆 Best: {bestScore}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {filteredGames.length === 0 && (
        <div className="no-games">
          <p>No games in this category yet. More coming soon! 🚀</p>
        </div>
      )}
    </div>
  );
};
