const { connectDB } = require('./_lib/db');
const Quote = require('./_lib/models/quote');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { testSubjectName } = req.body;
  if (!testSubjectName) return res.status(400).json({ error: 'Character name required' });

  try {
    await connectDB();

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
