import React, { useState, useEffect } from "react";
import type { GameProps } from "../../types/game";
import { gameUtils } from "../../utils/gameUtils";
import "./ReactionGame.css";

export const ReactionGame: React.FC<GameProps> = ({ onComplete, onExit }) => {
  const [gameState, setGameState] = useState<
    "waiting" | "ready" | "click" | "too-early" | "finished"
  >("waiting");
  const [startTime, setStartTime] = useState<number>(0);
  const [reactionTime, setReactionTime] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [scores, setScores] = useState<number[]>([]);

  const startRound = () => {
    setGameState("ready");
    const delay = gameUtils.randomInt(1000, 4000);

    setTimeout(() => {
      setGameState("click");
      setStartTime(Date.now());
    }, delay);
  };

  const handleClick = () => {
    if (gameState === "ready") {
      setGameState("too-early");
      setTimeout(() => {
        if (round < 5) {
          setRound(round + 1);
          setGameState("waiting");
        } else {
          finishGame();
        }
      }, 1500);
    } else if (gameState === "click") {
      const time = Date.now() - startTime;
      setReactionTime(time);
      setScores([...scores, time]);

      if (round < 5) {
        setRound(round + 1);
        setGameState("waiting");
      } else {
        finishGame([...scores, time]);
      }
    }
  };

  const finishGame = (finalScores = scores) => {
    const avgReaction =
      finalScores.reduce((a, b) => a + b, 0) / finalScores.length;
    const totalTime = Math.floor(Date.now() / 1000); // Simple timestamp

    // Convert reaction time to score (lower is better, so invert)
    const score = Math.max(0, Math.round(1000 - avgReaction));

    onComplete({
      score,
      timeSpent: totalTime,
      completedAt: new Date(),
      improvements: gameUtils.generateFeedback(score, totalTime, "reflex"),
      averageReaction: avgReaction,
      rounds: finalScores.length,
    });
  };

  useEffect(() => {
    if (gameState === "waiting") {
      // Auto-start each round after brief delay
      const timeout = setTimeout(() => startRound(), round === 1 ? 1000 : 500);
      return () => clearTimeout(timeout);
    }
  }, [gameState, round]);

  const getStateMessage = () => {
    switch (gameState) {
      case "waiting":
        return round === 1
          ? "Get ready for your first reaction test..."
          : `Round ${round}/5 - Click to continue`;
      case "ready":
        return "Wait for the green circle...";
      case "click":
        return "CLICK NOW!";
      case "too-early":
        return "Too early! Wait for green.";
      default:
        return "";
    }
  };

  return (
    <div className="reaction-game">
      <div className="game-header">
        <button onClick={onExit} className="exit-btn">
          ← Back to Hub
        </button>
        <h2>⚡ Reaction Speed Test</h2>
        <div className="helpful-info">
          💡 Improves focus and reaction time - useful for driving, sports, and
          daily alertness!
        </div>
      </div>

      <div className="game-area">
        <div className="round-indicator">Round {round}/5</div>

        <div className={`click-zone ${gameState}`} onClick={handleClick}>
          <div className="state-message">{getStateMessage()}</div>

          {gameState === "click" && <div className="click-target">CLICK!</div>}

          {(gameState === "too-early" ||
            (reactionTime > 0 && gameState === "waiting")) && (
            <div className="result">
              {gameState === "too-early"
                ? "Too early! 😅"
                : `${reactionTime}ms - ${
                    reactionTime < 300
                      ? "Excellent!"
                      : reactionTime < 500
                      ? "Good!"
                      : "Keep practicing!"
                  }`}
            </div>
          )}
        </div>

        {scores.length > 0 && (
          <div className="scores-display">
            <h4>Your Times:</h4>
            <div className="scores-list">
              {scores.map((time, index) => (
                <span key={index} className="score-item">
                  Round {index + 1}: {time}ms
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
