// Helper: compare difficulty (1-5)
const compareDifficulty = (guess, target) => {
  return guess === target ? 'correct' : 'absent';
};

const compareAge = (guessAge, targetAge) => {

  if (guessAge === null && targetAge === null) return 'correct';
  if (guessAge === null || targetAge === null) return 'unknown';

  const diff = guessAge - targetAge;


  if (diff === 0) return 'correct';
  
  if (diff < 0) { 
    return 'After';
  } else { 
    return 'Before';
  }
};


const compareDate = (guessDate, targetDate) => {
  const guessYear = new Date(guessDate).getFullYear();
  const targetYear = new Date(targetDate).getFullYear();
  const diff = guessYear - targetYear;

  if (diff === 0) return { status: 'correct', display: guessYear };

  if (diff < 0) {
    const absDiff = Math.abs(diff);
    //if (absDiff <= 2) return { status: 'past', display: guessYear };
    if (absDiff <= 5) return { status: 'After', display: guessYear };
    if (absDiff <= 10) return { status: 'wayafter', display: guessYear };
    return { status: 'waybefore', display: guessYear };
  } else {
    //if (diff <= 2) return { status: 'future', display: guessYear };
    if (diff <= 5) return { status: 'Before', display: guessYear };
    if (diff <= 10) return { status: 'waybefore', display: guessYear };
    return { status: 'wayafter', display: guessYear };
  }
};

const compareScaling = (guess, target) => {
  if (guess === target) {
    return 'correct';
  } else {
    return 'absent';
  };
};

const compareRoles = (guessRoles, targetRoles) => {
  const guessSet = new Set(guessRoles);
  const targetSet = new Set(targetRoles);

  if (guessSet.size === targetSet.size &&
      [...guessSet].every(r => targetSet.has(r))) {
    return 'correct';
  }
  for (let r of guessSet) {
    if (targetSet.has(r)) return 'present';
  }
  return 'absent';
};


export const compareTestSubject = (guessTestSubject, targetTestSubject) => {
  const dateResult = compareDate(guessTestSubject.releaseDate, targetTestSubject.releaseDate);
  
  return {
    isCorrect: guessTestSubject.name === targetTestSubject.name,
    feedback: {
      gender: {
        status: guessTestSubject.gender === targetTestSubject.gender ? 'correct' : 'absent',
        displayValue: guessTestSubject.gender
      },
      weapon: {
        status: guessTestSubject.weapon === targetTestSubject.weapon ? 'correct' : 'absent',
        displayValue: guessTestSubject.weapon
      },
      roles: {
        status: compareRoles(guessTestSubject.roles, targetTestSubject.roles),
        displayValue: guessTestSubject.roles.join(', ')
      },
      difficulty: {
        status: compareDifficulty(guessTestSubject.difficulty, targetTestSubject.difficulty),
        displayValue: guessTestSubject.difficulty
      },
      releaseDate: {
        status: dateResult.status,
        displayValue: dateResult.display,
        
      },
      age: {
        status: compareAge(guessTestSubject.age, targetTestSubject.age),
        displayValue: guessTestSubject.age === null ? 'Unknown' : guessTestSubject.age
      },
      scaling1: {
        status: compareScaling(guessTestSubject.scaling1.value, targetTestSubject.scaling1.value),
        displayValue: `${guessTestSubject.scaling1.value}%`,
        label: guessTestSubject.scaling1.name  
      },
      scaling2: {
        status: compareScaling(guessTestSubject.scaling2.value, targetTestSubject.scaling2.value),
        displayValue: `${guessTestSubject.scaling2.value}%`,
        label: 'ASPD'  
      }
    }
  };
};


