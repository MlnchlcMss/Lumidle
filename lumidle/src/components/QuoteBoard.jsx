import React, { useState, useEffect, useRef } from 'react';
import './QuoteBoard.css';
import {quotes} from '../data/quotes';
import { getDailyQuote } from '../utils/daily';

const QuoteBoard = () => {
  const [quote, setQuote] = useState('');
  const [targetSpeaker, setTargetSpeaker] = useState('');
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
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);


  const getBaseName = (fullName) => {
    const parenIndex = fullName.indexOf('(');
    if (parenIndex !== -1) {
      return fullName.substring(0, parenIndex).trim();
    }
    return fullName;
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


  const triggerWinConfetti = () => {
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    document.body.appendChild(confettiContainer);

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
      const randomImg = winImages[Math.floor(Math.random() * winImages.length)];
      img.src = `/confetti/win/${randomImg}`;
      img.alt = 'confetti';
      img.style.left = Math.random() * 100 + '%';
      img.style.animationDelay = Math.random() * 0.5 + 's';
      img.style.animationDuration = (Math.random() * 2 + 2) + 's';
      confettiContainer.appendChild(img);
    }

    setTimeout(() => {
      document.body.removeChild(confettiContainer);
    }, 4000);
  };

  const triggerLoseConfetti = () => {
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    document.body.appendChild(confettiContainer);

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
      const randomImg = loseImages[Math.floor(Math.random() * loseImages.length)];
      img.src = `/confetti/lose/${randomImg}`;
      img.alt = 'confetti';
      img.style.left = Math.random() * 100 + '%';
      img.style.animationDelay = Math.random() * 0.5 + 's';
      img.style.animationDuration = (Math.random() * 2 + 2) + 's';
      confettiContainer.appendChild(img);
    }

    setTimeout(() => {
      document.body.removeChild(confettiContainer);
    }, 4000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && filteredTestSubjects.length > 0 && !gameOver && !isAnimating) {
      submitGuess(filteredTestSubjects[0]);
    }
  };

  


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

  useEffect(() => {
    const today = getTodayDate();
    const stored = localStorage.getItem('quoteGameState');
    if (stored) {
      try {
        const { date, guesses: savedGuesses, gameOver: savedGameOver, message: savedMessage } = JSON.parse(stored);
        if (date === getTodayDate()) {
          setGuesses(savedGuesses);
          setGameOver(savedGameOver);
          setMessage(savedMessage || '');
          setGuessedNames(new Set(savedGuesses.map(g => g.name)));
        } else {
          localStorage.removeItem('quoteGameState');
        }
      } catch (e) { }
    }

      const daily = getDailyQuote(quotes);
      setQuote(daily.text);
      setTargetSpeaker(daily.speaker);  

      localStorage.setItem('quoteDaily', JSON.stringify({ date: today }));
      const allSpeakers = [...new Set(quotes.map(q => q.speaker))];
      setAllTestSubjects(allSpeakers);
      setFilteredTestSubjects(allSpeakers);

  }, []);

  useEffect(() => {
    if (!allTestSubjects.length) return;
    const input = inputValue.trim().toLowerCase();
    let filtered = allTestSubjects.filter(name => !guessedNames.has(name));;
    if (input !== '') {
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

  const saveGameState = (guessesToSave, gameOverToSave, messageToSave) => {
    const state = {
      date: getTodayDate(),
      guesses: guessesToSave,
      gameOver: gameOverToSave,
      message: messageToSave,
    };
    localStorage.setItem('quoteGameState', JSON.stringify(state));
  };

  const submitGuess = (testSubjectName) => {
  if (!testSubjectName || gameOver || isAnimating) return;

  const today = getTodayDate();
  const cachedQuote = localStorage.getItem('quoteDaily');
  if (cachedQuote) {
    const { date } = JSON.parse(cachedQuote);
    if (date !== today) {
      window.location.reload();
      return;
    }
  }

  setIsAnimating(true);
  setAnimationCount(0);
  setShowDropdown(false);

  
  const isCorrect = testSubjectName === targetSpeaker;

  const updatedGuesses = [{ name: testSubjectName, correct: isCorrect }, ...guesses];
  const newTotal = updatedGuesses.length;
  let newGameOver = false;
  let newMessage = '';

  if (isCorrect) {
    newGameOver = true;
    newMessage = `You got it! The speaker was ${testSubjectName}`;
  } else if (newTotal >= 5) { 
    newGameOver = true;
    newMessage = `Game over! The answer was ${targetSpeaker}`;
  }

  setGuesses(updatedGuesses);
  setGuessedNames(prev => new Set(prev).add(testSubjectName));

  if (newGameOver) {
    setGameOver(true);
    setMessage(newMessage);
    setPendingGameEnd({ isCorrect, message: newMessage, testSubjectName });
  } else {
    setGameOver(false);
    setMessage('');
    setPendingGameEnd(null);
  }

  setInputValue('');
  saveGameState(updatedGuesses, newGameOver, newMessage);
};

  const handleCellAnimationEnd = () => {
    setAnimationCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 1) { 
        setIsAnimating(false);
        if (pendingGameEnd) {
          setGameOver(true);
          setMessage(pendingGameEnd.message);
          if (pendingGameEnd.isCorrect) {
            triggerWinConfetti();
          } else {
            triggerLoseConfetti();
          }
        }
      }
      return newCount;
    });
  };


  const renderGuessRow = (guess, index) => {
    const isNewest = index === 0 && isAnimating;
    return (
      <div key={index} className="quote-row">
        <div className={`guess-cell ${guess.correct ? 'correct' : 'incorrect'} ${isNewest ? 'flip-animation' : ''}`}
          style={isNewest ? { animationDelay: '0s' } : {}}
          onAnimationEnd={isNewest ? handleCellAnimationEnd : undefined}>
          {guess.name}
        </div>
      </div>
    );
  };

  return (
    <div className={`quote-board ${isAnimating ? 'animating' : ''}`}>
      <div className="game-header">
        <h1>Who said the line?</h1>
        <div className="remaining-guesses">
          Remaining guesses: {5 - guesses.length}
        </div>
      </div>
      <div className="quote-display">"{quote}"</div>
      <div className="input-container" ref={dropdownRef}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder="Type character name..."
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

export default QuoteBoard;