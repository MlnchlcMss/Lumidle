import React, { useState, useEffect, useRef } from 'react';
import { sfxList } from '../data/sfx';
import { getDailySFX } from '../utils/daily';
import { endlessCache } from '../utils/endlessCache';
import './SFXBoard.css';

const getBaseName = (fullName) => {
  const parenIndex = fullName.indexOf('(');
  return parenIndex !== -1 ? fullName.substring(0, parenIndex).trim() : fullName;
};

const getTodayDate = () => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(now);
};

const SFXBoard = () => {
  const [dailySFX, setDailySFX] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [guessedNames, setGuessedNames] = useState(new Set());
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [allTestSubjects, setAllTestSubjects] = useState([]);
  const [filteredTestSubjects, setFilteredTestSubjects] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationCount, setAnimationCount] = useState(0);
  const [pendingGameEnd, setPendingGameEnd] = useState(null);
  const [hintSkillRevealed, setHintSkillRevealed] = useState(false);
  const [hintIconRevealed, setHintIconRevealed] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const currentAudioRef = useRef(null);


  const triggerWinConfetti = () => {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);
    const winImages = [
      'win1.webp',
      'win2.webp',
      'win3.webp',
      'win4.webp',
      'win5.webp'
    ];
    for (let i = 0; i < 40; i++) {
      const img = document.createElement('img');
      img.className = 'confetti-image';
      img.src = `confetti/win/${winImages[Math.floor(Math.random() * winImages.length)]}`;
      img.style.left = Math.random() * 100 + '%';
      img.style.animationDelay = Math.random() * 0.5 + 's';
      img.style.animationDuration = (Math.random() * 2 + 2) + 's';
      container.appendChild(img);
    }
    setTimeout(() => document.body.removeChild(container), 4000);
  };

  const triggerLoseConfetti = () => {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);
    const loseImages = [
      'lose1.webp',
      'lose2.webp',
      'lose3.webp',
      'lose4.webp',
      'lose5.webp'
    ];
    for (let i = 0; i < 40; i++) {
      const img = document.createElement('img');
      img.className = 'confetti-image';
      img.src = `/confetti/lose/${loseImages[Math.floor(Math.random() * loseImages.length)]}`;
      img.style.left = Math.random() * 100 + '%';
      img.style.animationDelay = Math.random() * 0.5 + 's';
      img.style.animationDuration = (Math.random() * 2 + 2) + 's';
      container.appendChild(img);
    }
    setTimeout(() => document.body.removeChild(container), 4000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && filteredTestSubjects.length > 0 && !gameOver && !isAnimating) {
      submitGuess(filteredTestSubjects[0]);
    }
  };

  const getEndlessSFX = () => {
    const key = 'endless_sfx_sua_pics';
    const stored = sessionStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    } else {
      const randomIndex = Math.floor(Math.random() * sfxList.length);
      const randomSFX = sfxList[randomIndex];
      sessionStorage.setItem(key, JSON.stringify(randomSFX));
      return randomSFX;
    }
  };


  useEffect(() => {
    const today = getTodayDate();
    const endless = localStorage.getItem('endlessMode') === 'true';

    if (endless) {
      if (!endlessCache.sfx.data) {
        const randomIndex = Math.floor(Math.random() * sfxList.length);
        endlessCache.sfx.data = sfxList[randomIndex];
        endlessCache.sfx.guesses = [];
        endlessCache.sfx.gameOver = false;
        endlessCache.sfx.message = '';
        endlessCache.sfx.hintSkillRevealed = false;
        endlessCache.sfx.hintIconRevealed = false;
      }
      const cached = endlessCache.sfx;
      setDailySFX(cached.data);
      setAllTestSubjects([...new Set(sfxList.map(s => s.testSubject))]);
      setFilteredTestSubjects([...new Set(sfxList.map(s => s.testSubject))]);
      setGuesses(cached.guesses);
      setGameOver(cached.gameOver);
      setMessage(cached.message);
      setHintSkillRevealed(cached.hintSkillRevealed);
      setHintIconRevealed(cached.hintIconRevealed);
      setGuessedNames(new Set(cached.guesses.map(g => g.name)));
      return;
    }

    const stored = localStorage.getItem('sfxGameState');
    if (stored) {
      try {
        const { date, guesses: savedGuesses, gameOver: savedGameOver, message: savedMessage,
          hintSkillRevealed: savedSkill, hintIconRevealed: savedIcon } = JSON.parse(stored);
        if (date === getTodayDate()) {
          setGuesses(savedGuesses);
          setGameOver(savedGameOver);
          setMessage(savedMessage || '');
          setHintSkillRevealed(savedSkill || false);
          setHintIconRevealed(savedIcon || false);
          setGuessedNames(new Set(savedGuesses.map(g => g.name)));
        } else {
          localStorage.removeItem('sfxGameState');
        }
      } catch (e) { }
    }

    const daily = getDailySFX(sfxList);
    setDailySFX(daily);

    localStorage.setItem('sfxDaily', JSON.stringify({ date: today }));

    const allTestSubs = [...new Set(sfxList.map(s => s.testSubject))];
    setAllTestSubjects(allTestSubs);
    setFilteredTestSubjects(allTestSubs);

  }, []);

  const saveGameState = (guessesToSave, gameOverToSave, messageToSave, skillRevealed, iconRevealed) => {
    const state = {
      date: getTodayDate(),
      guesses: guessesToSave,
      gameOver: gameOverToSave,
      message: messageToSave,
      hintSkillRevealed: skillRevealed,
      hintIconRevealed: iconRevealed,
    };
    localStorage.setItem('sfxGameState', JSON.stringify(state));
  };

  useEffect(() => {
    if (!allTestSubjects.length) return;
    const input = inputValue.trim().toLowerCase();
    let filtered = allTestSubjects.filter(name => !guessedNames.has(name));
    if (input) {
      filtered = filtered.filter(name => name.toLowerCase().includes(input));
      filtered.sort((a, b) => {
        const aStarts = a.toLowerCase().startsWith(input);
        const bStarts = b.toLowerCase().startsWith(input);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.localeCompare(b);
      });
    } else {
      filtered.sort((a, b) => a.localeCompare(b));
    }
    setFilteredTestSubjects(filtered);
  }, [inputValue, allTestSubjects, guessedNames]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        inputRef.current && !inputRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const revealSkillHint = () => {
    if (!gameOver && guesses.length >= 4 && !hintSkillRevealed) {
      setHintSkillRevealed(true);
      saveGameState(guesses, gameOver, message, true, hintIconRevealed);
    }
  };

  const revealIconHint = () => {
    if (!gameOver && guesses.length >= 5 && !hintIconRevealed) {
      setHintIconRevealed(true);
      saveGameState(guesses, gameOver, message, hintSkillRevealed, true);
    }
  };

  const submitGuess = (testSubjectName) => {
    if (!testSubjectName || gameOver || isAnimating) return;
    const endless = localStorage.getItem('endlessMode') === 'true';
    const today = getTodayDate();
    const cachedSfx = localStorage.getItem('sfxDaily');
    if (cachedSfx) {
      const { date } = JSON.parse(cachedSfx);
      if (date !== today) {
        window.location.reload();
        return;
      }
    }

    setIsAnimating(true);
    setAnimationCount(0);
    setShowDropdown(false);

    const isCorrect = testSubjectName === dailySFX.testSubject;

    const updatedGuesses = [{ name: testSubjectName, correct: isCorrect }, ...guesses];
    const newTotal = updatedGuesses.length;
    let newGameOver = false;
    let newMessage = '';

    if (isCorrect) {
      newGameOver = true;
      newMessage = `Correct! The skill belongs to ${testSubjectName}`;
    } else if (newTotal >= 6) {
      newGameOver = true;
      newMessage = `Game over! The answer was ${dailySFX.testSubject}`;
    }

    setGuesses(updatedGuesses);
    setGuessedNames(prev => new Set(prev).add(testSubjectName));

    const finalSkillRevealed = newGameOver ? true : hintSkillRevealed;
    const finalIconRevealed = newGameOver ? true : hintIconRevealed;

    if (newGameOver) {
      setGameOver(true);
      setMessage(newMessage);
      setHintSkillRevealed(true);
      setHintIconRevealed(true);
      setPendingGameEnd({ isCorrect, message: newMessage });
    } else {
      setGameOver(false);
      setMessage('');
      setPendingGameEnd(null);
    }

    setInputValue('');
    setHintSkillRevealed(finalSkillRevealed);
    setHintIconRevealed(finalIconRevealed);
    if (endless) {
      endlessCache.sfx.guesses = updatedGuesses;
      endlessCache.sfx.gameOver = newGameOver;
      endlessCache.sfx.message = newMessage;
      endlessCache.sfx.hintSkillRevealed = finalSkillRevealed;
      endlessCache.sfx.hintIconRevealed = finalIconRevealed;
    } else {
      saveGameState(updatedGuesses, newGameOver, newMessage, finalSkillRevealed, finalIconRevealed);
    }
  };

  const handleCellAnimationEnd = () => {
    setAnimationCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 1) {
        setIsAnimating(false);
        if (pendingGameEnd) {
          setGameOver(true);
          setMessage(pendingGameEnd.message);
          if (pendingGameEnd.isCorrect) triggerWinConfetti();
          else triggerLoseConfetti();
        }
      }
      return newCount;
    });
  };

  const playSFX = () => {
    if (dailySFX && dailySFX.sfxFile) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      }

      const audio = new Audio(dailySFX.sfxFile);
      currentAudioRef.current = audio;
      audio.play().catch(e => console.error('Audio play failed:', e));
    }
  };

  const renderGuessRow = (guess, index) => {
    const isNewest = index === 0 && isAnimating;
    return (
      <div key={index} className="sfx-row">
        <div
          className={`guess-cell ${guess.correct ? 'correct' : 'incorrect'} ${isNewest ? 'flip-animation' : ''}`}
          style={isNewest ? { animationDelay: '0s' } : {}}
          onAnimationEnd={isNewest ? handleCellAnimationEnd : undefined}
        >
          {guess.name}
        </div>
      </div>
    );
  };

  if (!dailySFX) return <div>Loading...</div>;
  const canRevealSkill = guesses.length >= 4 && !gameOver && !hintSkillRevealed;
  const canRevealIcon = guesses.length >= 5 && !gameOver && !hintIconRevealed;
  return (
    <div className={`sfx-board ${isAnimating ? 'animating' : ''}`}>
      <div className="game-header">
        <h1>Guess the SFX</h1>
        <div className="remaining-guesses">
          Remaining guesses: {6 - guesses.length}
        </div>
      </div>
      <div className="sfx-header">
        <button className="play-button" onClick={playSFX}>🔊 Play Sound</button>

      </div>
      <div className="hint-section">
        <div
          className={`hint ${hintSkillRevealed ? 'skill-hint' : ''} ${!hintSkillRevealed && !canRevealSkill ? 'locked' : ''} ${canRevealSkill ? 'clickable' : ''}`}
          onClick={canRevealSkill ? revealSkillHint : undefined}
        >
          {hintSkillRevealed ? (
            <><strong>Skill Name:</strong> {dailySFX.skillName}</>
          ) : (
            canRevealSkill ? 'Reveal Skill Name' : '??? (Reveals at 4 guesses)'
          )}
        </div>
        <div
          className={`hint ${hintIconRevealed ? 'icon-hint' : ''} ${!hintIconRevealed && !canRevealIcon ? 'locked' : ''} ${canRevealIcon ? 'clickable' : ''}`}
          onClick={canRevealIcon ? revealIconHint : undefined}
        >
          {hintIconRevealed ? (
            <img src={dailySFX.iconFile} alt="skill icon" className="skill-icon" />
          ) : (
            canRevealIcon ? 'Reveal Icon' : '??? (Reveals at 5 guesses)'
          )}
        </div>
      </div>

      <div className="input-container" ref={dropdownRef}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder="Type test subject name..."
          disabled={gameOver || isAnimating}
          autoComplete="off"
        />
        {showDropdown && filteredTestSubjects.length > 0 && !gameOver && (
          <ul className="dropdown">
            {filteredTestSubjects.map(name => (
              <li key={name} onClick={() => submitGuess(name)}>
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>
      {message && <div className="message">{message}</div>}
      <div className="guess-list">
        {guesses.map((guess, i) => renderGuessRow(guess, i))}
      </div>
    </div>
  );
};

export default SFXBoard;