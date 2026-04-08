const { connectDB } = require('./_lib/db');
const SFX = require('./_lib/models/sfx');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { testSubjectName } = req.body;
  if (!testSubjectName) return res.status(400).json({ error: 'Test Subject name required' });

  try {
    await connectDB();
    
    const count = await SFX.countDocuments();
    const start = new Date(2022, 0, 0);
    const diff = Date.now() - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    const index = day % count;
    const target = await SFX.findOne().skip(index);

    const isCorrect = target.testSubject.toLowerCase() === testSubjectName.trim().toLowerCase();

    res.json({
      isCorrect,
      testSubject: isCorrect ? target.testSubject : null,
      guess: testSubjectName
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
