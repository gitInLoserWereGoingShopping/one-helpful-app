import React, { useState, useEffect, useRef } from "react";
import type { GameProps } from "../../types/game";
import { gameUtils } from "../../utils/gameUtils";
import { ThemeProvider } from "../../styles/ThemeProvider";
import {
  CODE_CHALLENGES,
  type AnimationState,
  calculateCodeScore,
} from "./CodeGamePlan";
import "./CodeChallenge.css";

export const CodeChallengeGame: React.FC<GameProps> = ({
  onComplete,
  onExit,
}) => {
  const [currentChallengeIndex, setChallengeIndex] = useState(0);
  const [userCode, setUserCode] = useState("");
  const [gameStartTime] = useState(Date.now());
  const [challengeStartTime, setChallengeStartTime] = useState(Date.now());
  const [animationState, setAnimationState] = useState<AnimationState>({
    isTyping: false,
    hasError: false,
    isComplete: false,
    currentLine: 0,
    charactersTyped: 0,
    showHint: false,
    previewVisible: false,
  });
  const [hintsUsed, setHintsUsed] = useState(0);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentChallenge = CODE_CHALLENGES[currentChallengeIndex];
  const expectedCode = currentChallenge.codeToType;
  const progress = (userCode.length / expectedCode.length) * 100;

  // Calculate typing metrics
  const timeElapsed = (Date.now() - challengeStartTime) / 1000;
  const wordsTyped = userCode.split(" ").length;
  const wpm = timeElapsed > 0 ? Math.round((wordsTyped / timeElapsed) * 60) : 0;
  const accuracy =
    userCode.length > 0
      ? Math.round((getCorrectCharacters() / userCode.length) * 100)
      : 100;

  function getCorrectCharacters(): number {
    let correct = 0;
    for (let i = 0; i < userCode.length; i++) {
      if (userCode[i] === expectedCode[i]) {
        correct++;
      }
    }
    return correct;
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setUserCode(newCode);

    // Update animation state
    setAnimationState((prev) => ({
      ...prev,
      isTyping: true,
      charactersTyped: newCode.length,
      currentLine: newCode.split("\n").length,
      hasError:
        newCode.length > 0 &&
        newCode[newCode.length - 1] !== expectedCode[newCode.length - 1],
    }));

    // Check if challenge is complete
    if (newCode.trim() === expectedCode.trim()) {
      handleChallengeComplete();
    }

    // Stop typing animation after delay
    setTimeout(() => {
      setAnimationState((prev) => ({ ...prev, isTyping: false }));
    }, 500);
  };

  const handleChallengeComplete = () => {
    setAnimationState((prev) => ({ ...prev, isComplete: true }));

    if (currentChallengeIndex < CODE_CHALLENGES.length - 1) {
      // Move to next challenge
      setTimeout(() => {
        setChallengeIndex(currentChallengeIndex + 1);
        setUserCode("");
        setChallengeStartTime(Date.now());
        setCurrentHintIndex(0);
        setAnimationState({
          isTyping: false,
          hasError: false,
          isComplete: false,
          currentLine: 0,
          charactersTyped: 0,
          showHint: false,
          previewVisible: false,
        });
      }, 2000);
    } else {
      // Game complete
      setTimeout(() => {
        const totalTime = Math.floor((Date.now() - gameStartTime) / 1000);
        const score = calculateCodeScore(
          accuracy,
          wpm,
          currentChallenge.difficulty,
          hintsUsed
        );

        onComplete({
          score,
          timeSpent: totalTime,
          completedAt: new Date(),
          improvements: gameUtils.generateFeedback(
            score,
            totalTime,
            "educational"
          ),
          challengesCompleted: CODE_CHALLENGES.length,
          averageWPM: wpm,
          finalAccuracy: accuracy,
          hintsUsed,
        });
      }, 2000);
    }
  };

  const showHint = () => {
    setHintsUsed(hintsUsed + 1);
    setCurrentHintIndex((currentHintIndex + 1) % currentChallenge.hints.length);
    setAnimationState((prev) => ({ ...prev, showHint: true }));

    setTimeout(() => {
      setAnimationState((prev) => ({ ...prev, showHint: false }));
    }, 4000);
  };

  const togglePreview = () => {
    setAnimationState((prev) => ({
      ...prev,
      previewVisible: !prev.previewVisible,
    }));
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [currentChallengeIndex]);

  return (
    <ThemeProvider themeId="code">
      <div className="code-challenge">
        <div className="code-header">
          <button onClick={onExit} className="btn btn-ghost exit-btn">
            ← Back to Hub
          </button>
          <div className="challenge-info">
            <h2>💻 {currentChallenge.title}</h2>
            <div className="challenge-meta">
              <span className="hook-badge">{currentChallenge.hook}</span>
              <span className="difficulty">
                {"⭐".repeat(currentChallenge.difficulty)} Level{" "}
                {currentChallenge.difficulty}
              </span>
              <span className="progress-indicator">
                {currentChallengeIndex + 1} / {CODE_CHALLENGES.length}
              </span>
            </div>
          </div>
          <div className="stats-panel">
            <div className="stat">
              <span className="stat-label">WPM</span>
              <span className="stat-value">{wpm}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Accuracy</span>
              <span className="stat-value">{accuracy}%</span>
            </div>
          </div>
        </div>

        <div className="challenge-description">
          <p>{currentChallenge.description}</p>
          <div className="helpful-aspect">
            💡 <strong>Learning:</strong> {currentChallenge.helpfulAspect}
          </div>
        </div>

        <div className="coding-area">
          <div className="code-editor-container">
            <div className="editor-header">
              <div className="editor-tabs">
                <div className="tab active">
                  <span className="tab-icon">⚛️</span>
                  Component.jsx
                </div>
              </div>
              <div className="editor-actions">
                <button onClick={showHint} className="btn btn-ghost btn-sm">
                  💡 Hint ({hintsUsed})
                </button>
                <button
                  onClick={togglePreview}
                  className="btn btn-ghost btn-sm"
                >
                  👁️ Preview
                </button>
              </div>
            </div>

            <div className="code-editor">
              <div className="line-numbers">
                {Array.from({
                  length: Math.max(10, userCode.split("\n").length),
                }).map((_, i) => (
                  <div key={i} className="line-number">
                    {i + 1}
                  </div>
                ))}
              </div>

              <div className="editor-content">
                <div className="expected-code">{expectedCode}</div>
                <textarea
                  ref={textareaRef}
                  value={userCode}
                  onChange={handleCodeChange}
                  className={`code-input ${
                    animationState.hasError ? "has-error" : ""
                  } ${animationState.isTyping ? "is-typing" : ""}`}
                  placeholder="Start typing the React code..."
                  spellCheck={false}
                />
              </div>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
              <span className="progress-text">
                {Math.round(progress)}% Complete
              </span>
            </div>
          </div>

          {animationState.previewVisible && (
            <div className="code-preview">
              <h4>🎯 Expected Result:</h4>
              <div className="preview-content">
                <div className="component-preview">
                  <div className="preview-title">
                    {currentChallenge.visualPreview?.componentName}
                  </div>
                  <div className="preview-description">
                    {currentChallenge.visualPreview?.expectedBehavior}
                  </div>
                  <div className="preview-mockup">
                    {currentChallenge.hook === "useState" && (
                      <div className="mock-button">Count: 0</div>
                    )}
                    {currentChallenge.hook === "useEffect" && (
                      <div className="mock-timer">Seconds: 0</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {animationState.showHint && (
          <div className="hint-popup">
            <div className="hint-content">
              <strong>💡 Hint:</strong>{" "}
              {currentChallenge.hints[currentHintIndex]}
            </div>
          </div>
        )}

        {animationState.isComplete && (
          <div className="completion-animation">
            <div className="completion-content">
              <div className="success-icon">🎉</div>
              <h3>Challenge Complete!</h3>
              <p>Moving to next challenge...</p>
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
};
