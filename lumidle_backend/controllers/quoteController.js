const Quote = require('../models/quote');
const testSubject = require('../models/testSubjects'); 


exports.getTodayQuote = async (req, res) => {
  try {
    const count = await Quote.countDocuments();
    if (count === 0) return res.status(500).json({ error: 'No quotes in database' });

    const start = new Date(2022, 0, 0);
    const diff = Date.now() - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    const index = day % count;

    const quote = await Quote.findOne().skip(index).select('text'); 
    res.json({ id: quote._id, text: quote.text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.submitGuess = async (req, res) => {
  const { testSubjectName } = req.body;
  if (!testSubjectName) return res.status(400).json({ error: 'Character name required' });

  try {

    const count = await Quote.countDocuments();
    const start = new Date(2022, 0, 0);
    const diff = Date.now() - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    const index = day % count;
    const targetQuote = await Quote.findOne().skip(index);

    const isCorrect = targetQuote.speaker.toLowerCase() === testSubjectName.trim().toLowerCase();

    res.json({
      isCorrect,
      speaker: isCorrect ? targetQuote.speaker : null, 
      guess: testSubjectName
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};