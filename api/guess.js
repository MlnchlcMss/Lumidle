const { connectDB } = require('./_lib/db');
const testSubject = require('./_lib/models/testSubjects');
const { compareTestSubject } = require('./_lib/utils/compareLogic');

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { testSubjectName } = req.body;
  if (!testSubjectName) {
    return res.status(400).json({ error: 'Test subject name required' });
  }

  try {
    await connectDB();
    
    const escapedName = escapeRegex(testSubjectName);
    const guessTestSubject = await testSubject.findOne({ name: { $regex: new RegExp('^' + escapedName + '$', 'i') }});
    if (!guessTestSubject) {
      return res.status(404).json({ error: 'Test subject not found' });
    }

    const count = await testSubject.countDocuments();
    const start = new Date(2022, 0, 0);
    const diff = Date.now() - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    const index = day % count;
    const targetTestSubject = await testSubject.findOne().skip(index);

    const comparison = compareTestSubject(guessTestSubject, targetTestSubject);
    
    if (comparison.isCorrect) {
      return res.json({
        isCorrect: true,
        testSubjectName: targetTestSubject.name, 
        ...comparison
      });
    }

    res.json(comparison);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
