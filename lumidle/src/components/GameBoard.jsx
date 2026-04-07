import React, { useState, useEffect, useRef } from 'react';
import { encryptData, decryptData } from '../utils/obfuscate';
import './GameBoard.css';


const GameBoard = () => {
  const [targetId, setTargetId] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [guessedNames, setGuessedNames] = useState(new Set());
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [allTestSubjects, setAllTestSubjects] = useState([]);
  const [filteredTestSubjects, setFilteredTestSubjects] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationCount, setAnimationCount] = useState(0);
  const [pendingGameEnd, setPendingGameEnd] = useState(null);
  const totalCellsPerRow = 9;
  const this_hag_is_not_17_i_swear = ['Eva'];

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

  const getImageUrl = (testSubjectName) => {
    const actualName = getBaseName(testSubjectName);
    const sanitized = actualName.replace(/ /g, '_');
    return `/potraits/${encodeURIComponent(sanitized)}.webp`;
  };

  const getBaseName = (fullName) => {

    const parenIndex = fullName.indexOf('(');
    if (parenIndex !== -1) {
      return fullName.substring(0, parenIndex).trim();
    }
    return fullName;
  };

  const getWikiUrl = (testSubjectName) => {
    const baseName = getBaseName(testSubjectName);
    const wikiName = baseName.replace(/ /g, '_');
    return `https://eternalreturn.fandom.com/wiki/${wikiName}`;
  };

  
  useEffect(() => {
    const loadDailyData = async () => {
      const today = getTodayDate();
      const cached = localStorage.getItem('characterDaily');
      if (cached) {
        try {
          const { date, encryptedId } = JSON.parse(cached);
          if (date === today) {
            const decryptedId = decryptData(encryptedId);
            setTargetId(decryptedId);
            const listRes = await fetch('/api/TestSubjects');
            if (listRes.ok) {
              const listData = await listRes.json();
              setAllTestSubjects(listData);
              setFilteredTestSubjects(listData);
            }
            return;
          }
        } catch (e) {
          console.warn('Failed to parse cached daily target', e);
          localStorage.removeItem('characterDaily');
        }
      }


      try {
        const [targetRes, listRes] = await Promise.all([
          fetch('/api/TestSubject/today'),
          fetch('/api/TestSubjects')
        ]);
        if (!targetRes.ok || !listRes.ok) throw new Error('Failed to fetch data');
        const targetData = await targetRes.json();
        const listData = await listRes.json();

        setTargetId(targetData.id);
        setAllTestSubjects(listData);
        setFilteredTestSubjects(listData);

        const encryptedId = encryptData({ id: targetData.id });
        console.log(today, getTodayDate());
        localStorage.setItem('characterDaily', JSON.stringify({ date: getTodayDate(), encryptedId }));
      } catch (err) {
        console.error(err);
        setMessage('Could not load game data');
      }
    };

    loadDailyData();
  }, []);

  
  useEffect(() => {
    const stored = localStorage.getItem('characterGameState');
    if (stored) {
      try {
        const { date, guesses: savedGuesses, gameOver: savedGameOver, message: savedMessage } = JSON.parse(stored);

        if (date === getTodayDate()) {
          setGuesses(savedGuesses);
          setGameOver(savedGameOver);
          setMessage(savedMessage || '');
          setGuessedNames(new Set(savedGuesses.map(g => g.name)));
        } else {
          localStorage.removeItem('characterGameState');
        }
      } catch (e) { }
    }
  }, []);

  
  useEffect(() => {
    if (!allTestSubjects.length) return;

    const input = inputValue.trim().toLowerCase();
    let filtered = allTestSubjects.filter(name => !guessedNames.has(name));

    if (input !== '') {
      filtered = filtered.filter(name => name.toLowerCase().includes(input));

      filtered.sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        const aStarts = aLower.startsWith(input);
        const bStarts = bLower.startsWith(input);

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
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const submitGuess = async (testSubjectName) => {
    if (!testSubjectName || gameOver || isAnimating) return;
    const today = getTodayDate();
    const cachedCharacter = localStorage.getItem('characterDaily');
    if (cachedCharacter) {
      const { date } = JSON.parse(cachedCharacter);
      if (date !== today) {
        window.location.reload();
        return;
      }
    }

    setIsAnimating(true);
    setAnimationCount(0);
    setShowDropdown(false);
    try {
      const res = await fetch('/api/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testSubjectName: testSubjectName })
      });

      if (!res.ok) {
        const error = await res.json();
        setMessage(error.message || 'Invalid guess');
        return;
      }

      const result = await res.json();


      const updatedGuesses = [{ name: testSubjectName, feedback: result.feedback }, ...guesses];

      const newTotalGuesses = updatedGuesses.length;
      let newGameOver = false;
      let newMessage = '';
      if (result.isCorrect) {
        newGameOver = true;
        newMessage = `You got it! The test subject was ${testSubjectName}`;
      } else if (newTotalGuesses >= 10) {
        newGameOver = true;
        newMessage = 'Game over! Better luck tomorrow.';
      }

      setGuesses(updatedGuesses);
      setGuessedNames(prev => new Set(prev).add(testSubjectName));

      if (newGameOver) {
        setGameOver(true);
        setMessage(newMessage);
        setPendingGameEnd({
          isCorrect: result.isCorrect,
          message: newMessage,
          testSubjectName
        });
      } else {
        setGameOver(false);
        setMessage('');
        setPendingGameEnd(null);
      }

      setInputValue('');


      saveGameState(updatedGuesses, newGameOver, newMessage);

    } catch (err) {
      console.error(err);
      setMessage('Error submitting guess');
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setShowDropdown(true);
  };

  const handleSelectTestSubject = (name) => {
    submitGuess(name);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && filteredTestSubjects.length > 0 && !gameOver && !isAnimating) {
      handleSelectTestSubject(filteredTestSubjects[0]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const handleCellAnimationEnd = () => {
    setAnimationCount(prev => {
      const newCount = prev + 1;
      if (newCount >= totalCellsPerRow) {
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

  const attributes = [
    { key: 'gender', label: 'Gender' },
    { key: 'weapon', label: 'Weapon' },
    { key: 'roles', label: 'Roles' },
    { key: 'difficulty', label: 'Difficulty' },
    { key: 'releaseDate', label: 'Release' },
    { key: 'age', label: 'Age' },
    { key: 'scaling1', label: 'Scaling1' },
    { key: 'scaling2', label: 'ASPD' }
  ];

  const HeaderRow = () => (
    <div className="row header-row">
      <div className="header-cell">Character</div>
      {attributes.map((col, idx) => (
        <div key={idx} className="header-cell">
          {col.label}
          {col.key === 'scaling1' && (
            <span
              className="tooltip-icon"
              data-tooltip="Refers to the stat they mainly scale with in their respective weapon mastery. Exact number match = Green. Compares regardless of AP/Basic Atk Amp/Skill Amp"
            >
              ?
            </span>
          )}
        </div>
      ))}
    </div>
  );

  const saveGameState = (guessesToSave, gameOverToSave, messageToSave) => {
    const state = {
      date: getTodayDate(),
      guesses: guessesToSave,
      gameOver: gameOverToSave,
      message: messageToSave,
    };
    localStorage.setItem('characterGameState', JSON.stringify(state));
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

    for (let i = 0; i < 10; i++) {
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

    for (let i = 0; i < 10; i++) {
      const img = document.createElement('img');
      img.className = 'confetti-image';
      const randomImg = loseImages[Math.floor(Math.random() * loseImages.length)];
      img.src = `confetti/lose/${randomImg}`;
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

  const renderGuessRow = (guess, index) => {
    const { feedback } = guess;
    const isNewestRow = index === 0 && isAnimating;
    const evaMoment = this_hag_is_not_17_i_swear.some(
      name => guess.name.toLowerCase() === name.toLowerCase()
    );
    const getDirectionClass = (key, status) => {
      if (key !== 'age' && key !== 'release') return '';
      if (['past', 'before', 'waypast', 'waybefore'].includes(status)) return 'arrow-down';
      if (['future', 'after', 'wayfuture', 'wayafter'].includes(status)) return 'arrow-up';
      return '';
    };

    return (
      <div key={index} className="row">
        <a
          href={getWikiUrl(guess.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="portrait-link"
          title={`${guess.name}`}
        >
          <div
            className={`cell portrait-cell ${isNewestRow ? 'flip-animation' : ''}`}
            style={isNewestRow ? { animationDelay: '0s' } : {}}
            onAnimationEnd={isNewestRow ? handleCellAnimationEnd : undefined}
          >
            <img
              src={getImageUrl(guess.name)}
              alt={guess.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';

                e.target.parentElement.classList.add('portrait-fallback');
                e.target.parentElement.setAttribute('data-fallback', guess.name);
              }}
            />
          </div>
        </a>

        {attributes.map((attr, idx) => {
          let status = feedback[attr.key]?.status;
          if (attr.key === 'difficulty') {
            status = status === 'correct' ? 'correct' : 'absent';
          }


          let displayValue = feedback[attr.key]?.displayValue;
          const directionClass = getDirectionClass(attr.key, status);

          if (evaMoment && attr.key === 'age') {
            displayValue = '17?';
          }

          const cellClasses = `cell ${status || ''} ${directionClass} ${isNewestRow ? 'flip-animation' : ''}`.trim();
          return (
            <div
              key={attr.key}
              className={cellClasses}
              style={isNewestRow ? { animationDelay: `${(idx + 2) * 0.1}s` } : {}}
              onAnimationEnd={isNewestRow ? handleCellAnimationEnd : undefined}
              title={feedback[attr.key]?.hint || ''}
            >

              <div className="value">{displayValue || '?'}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`game-board ${isAnimating ? 'animating' : ''}`}>
      <div className="game-header">
        <h1>Guess the Test Subject</h1>
        <div className="remaining-guesses">
          Remaining guesses: {10 - guesses.length}
        </div>
      </div>
      {message && <div className="message">{message}</div>}

      { }
      <div className="input-container" ref={dropdownRef}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder="Enter a Test Subject"
          disabled={gameOver}
          autoComplete="off"
        />
        {showDropdown && filteredTestSubjects.length > 0 && !gameOver && (
          <ul className="dropdown">
            {filteredTestSubjects.map(name => (
              <li key={name} onClick={() => handleSelectTestSubject(name)}>
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>


      { }
      <div className="board">
        <HeaderRow />
        {[...guesses].map((guess, i) => renderGuessRow(guess, i))}
      </div>
    </div>
  );
};


export default GameBoard;