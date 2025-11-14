'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Brain, Trophy, Star, Zap, Check, X, RefreshCw, Crown } from 'lucide-react';

export default function MindGame() {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('menu'); // menu, playing, correct, wrong, complete
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [showSequence, setShowSequence] = useState(false);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);

  const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
  
  const levelConfig = {
    1: { length: 3, time: 30, colors: 4, title: 'Easy Start' },
    2: { length: 4, time: 28, colors: 4, title: 'Getting Warm' },
    3: { length: 5, time: 26, colors: 4, title: 'Memory Test' },
    4: { length: 5, time: 24, colors: 5, title: 'Color Master' },
    5: { length: 6, time: 22, colors: 5, title: 'Brain Power' },
    6: { length: 6, time: 20, colors: 5, title: 'Speed Challenge' },
    7: { length: 7, time: 18, colors: 6, title: 'Expert Mode' },
    8: { length: 7, time: 16, colors: 6, title: 'Mind Bender' },
    9: { length: 8, time: 14, colors: 6, title: 'Near Master' },
    10: { length: 8, time: 12, colors: 6, title: 'Ultimate Challenge' }
  };

  const handleWrong = useCallback(() => {
    setGameState('wrong');
    setTimeout(() => {
      setGameState('menu');
    }, 2000);
  }, []);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === 'playing') {
      handleWrong();
    }
  }, [timeLeft, gameState, handleWrong]);

  const startLevel = () => {
    const config = levelConfig[level as keyof typeof levelConfig];
    const newSequence = Array.from({ length: config.length }, () => 
      Math.floor(Math.random() * config.colors)
    );
    setSequence(newSequence);
    setUserSequence([]);
    setShowSequence(true);
    setTimeLeft(config.time);
    setGameState('playing');

    // Show sequence
    newSequence.forEach((colorIndex, index) => {
      setTimeout(() => {
        setActiveButton(colorIndex);
        setTimeout(() => setActiveButton(null), 400);
      }, (index + 1) * 600);
    });

    setTimeout(() => {
      setShowSequence(false);
    }, newSequence.length * 600 + 500);
  };

  const handleCorrect = useCallback(() => {
    const points = level * 100 + timeLeft * 10;
    setScore(score + points);
    setGameState('correct');

    setTimeout(() => {
      if (level === 10) {
        setGameState('complete');
      } else {
        setLevel(level + 1);
        setGameState('menu');
      }
    }, 2000);
  }, [level, score, timeLeft]);

  const handleColorClick = useCallback((colorIndex: number) => {
    if (showSequence || gameState !== 'playing') return;

    const newUserSequence = [...userSequence, colorIndex];
    setUserSequence(newUserSequence);

    // Flash the button
    setActiveButton(colorIndex);
    setTimeout(() => setActiveButton(null), 200);

    // Check if correct
    if (colorIndex !== sequence[newUserSequence.length - 1]) {
      handleWrong();
      return;
    }

    // Check if completed
    if (newUserSequence.length === sequence.length) {
      handleCorrect();
    }
  }, [gameState, handleCorrect, handleWrong, sequence, showSequence, userSequence]);

  const resetGame = () => {
    setLevel(1);
    setScore(0);
    setGameState('menu');
  };

  const config = levelConfig[level as keyof typeof levelConfig];

  if (gameState === 'complete') {
    return (
      <div className="w-full h-full flex items-center justify-center rounded-b-lg" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center p-8">
          <Crown size={100} className="mx-auto mb-6 text-yellow-300 animate-bounce" />
          <h1 className="text-5xl font-bold text-white mb-4">🎉 Champion! 🎉</h1>
          <p className="text-2xl text-white mb-6">Tumne sabhi 10 levels clear kar diye!</p>
          <div className="mb-8 p-6 rounded-3xl" style={{ backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)' }}>
            <p className="text-4xl font-bold text-yellow-300 mb-2">{score}</p>
            <p className="text-white text-lg">Total Score</p>
          </div>
          <button
            onClick={resetGame}
            className="px-12 py-4 rounded-full text-white font-bold text-xl shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            <RefreshCw size={24} className="inline mr-2" />
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-b-lg overflow-hidden" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', animation: 'float 8s ease-in-out infinite' }} />
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', animation: 'float 10s ease-in-out infinite', animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <Brain size={40} className="text-yellow-300" />
            <div>
              <h1 className="text-2xl font-bold text-white">Memory Mind Game</h1>
              <p className="text-white/80 text-sm">Level {level} - {config.title}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-yellow-300 text-xl font-bold">
              <Trophy size={24} />
              {score}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
          <div 
            className="h-full transition-all duration-500"
            style={{ 
              width: `${(level / 10) * 100}%`,
              background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
            }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6 flex flex-col items-center justify-center" style={{ minHeight: 'calc(100% - 200px)' }}>
        {gameState === 'menu' && (
          <div className="text-center animate-fadeIn">
            <div className="mb-8 p-8 rounded-3xl" style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)' }}>
              <div className="flex items-center justify-center gap-3 mb-4">
                <Star className="text-yellow-300" size={32} />
                <h2 className="text-4xl font-bold text-white">Level {level}</h2>
                <Star className="text-yellow-300" size={32} />
              </div>
              <p className="text-xl text-white mb-6">{config.title}</p>
              <div className="grid grid-cols-2 gap-4 text-left mb-6">
                <div className="p-4 rounded-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                  <p className="text-white/70 text-sm">Sequence Length</p>
                  <p className="text-2xl font-bold text-white">{config.length} colors</p>
                </div>
                <div className="p-4 rounded-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                  <p className="text-white/70 text-sm">Time Limit</p>
                  <p className="text-2xl font-bold text-white">{config.time}s</p>
                </div>
              </div>
              <p className="text-white/90 mb-8">
                Watch the sequence carefully, then repeat it!
              </p>
              <button
                onClick={startLevel}
                className="px-12 py-4 rounded-full text-white font-bold text-xl shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                <Zap size={24} className="inline mr-2" />
                Start Level
              </button>
            </div>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="w-full max-w-2xl animate-fadeIn">
            {/* Timer */}
            <div className="mb-8 text-center">
              <div className="inline-block p-6 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)' }}>
                <p className="text-5xl font-bold text-white">{timeLeft}</p>
              </div>
              {showSequence && (
                <p className="text-white text-xl mt-4 font-semibold animate-pulse">Watch the sequence...</p>
              )}
              {!showSequence && (
                <p className="text-white text-xl mt-4 font-semibold">Your turn! Repeat the pattern</p>
              )}
            </div>

            {/* Progress */}
            <div className="mb-6 text-center">
              <div className="flex justify-center gap-2 mb-2">
                {sequence.map((_, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded-full"
                    style={{ 
                      backgroundColor: index < userSequence.length 
                        ? colors[userSequence[index]] 
                        : 'rgba(255,255,255,0.2)'
                    }}
                  />
                ))}
              </div>
              <p className="text-white/70 text-sm">{userSequence.length} / {sequence.length}</p>
            </div>

            {/* Color Buttons */}
            <div className="grid grid-cols-3 gap-4">
              {colors.slice(0, config.colors).map((color, index) => (
                <button
                  key={index}
                  onClick={() => handleColorClick(index)}
                  disabled={showSequence}
                  className="aspect-square rounded-3xl shadow-2xl transition-all duration-200 disabled:opacity-50"
                  style={{ 
                    backgroundColor: color,
                    transform: activeButton === index ? 'scale(0.9)' : 'scale(1)',
                    opacity: activeButton === index ? 1 : (showSequence ? 0.5 : 0.9),
                    boxShadow: activeButton === index ? `0 0 40px ${color}` : '0 10px 30px rgba(0,0,0,0.3)'
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {(gameState === 'correct' || gameState === 'wrong') && (
          <div className="text-center animate-fadeIn">
            {gameState === 'correct' ? (
              <>
                <Check size={100} className="mx-auto mb-6 text-green-400 animate-bounce" />
                <h2 className="text-5xl font-bold text-white mb-4">Perfect! 🎉</h2>
                <p className="text-2xl text-white mb-4">+{level * 100 + timeLeft * 10} points</p>
                <p className="text-xl text-white/80">Level {level} Clear!</p>
              </>
            ) : (
               <>
                <X size={100} className="mx-auto mb-6 text-red-400 animate-bounce" />
                <h2 className="text-5xl font-bold text-white mb-4">Oops! 😅</h2>
                <p className="text-2xl text-white mb-4">Wrong sequence!</p>
                <p className="text-xl text-white/80">Try again...</p>
               </>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }
      `}</style>
    </div>
  );
}
