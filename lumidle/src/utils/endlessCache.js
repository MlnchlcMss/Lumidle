// This cache survives component unmounts but is reset on page refresh
export const endlessCache = {
  testSubject: {
    data: null,          // the test subject object
    guesses: [],         // array of guess objects
    gameOver: false,
    message: '',
  },
  quote: {
    data: null,          // the quote object { text, speaker }
    guesses: [],
    gameOver: false,
    message: '',
  },
  sfx: {
    data: null,          // the sfx object
    guesses: [],
    gameOver: false,
    message: '',
    hintSkillRevealed: false,
    hintIconRevealed: false,
  }
};