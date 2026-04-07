const testSubject = require('../models/testSubjects');
const { compareTestSubject } = require('../utils/compareLogic');

// i hate regex with my entire being but this is the easiest way to do a case-insensitive exact match in MongoDB 씨발.
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

exports.getTodayTestSubject = async (req, res) => {
  try {
    const count = await testSubject.countDocuments();
    if (count === 0) {
      return res.status(500).json({ error: 'No test subjects in database' });
    }
    
    const start = new Date(2022, 0, 0); 
    const diff = Date.now() - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    const index = day % count;

    const testSub = await testSubject.findOne().skip(index).select('_id');
    res.json({ id: testSub._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};


exports.submitGuess = async (req, res) => {
  const { testSubjectName } = req.body;
  if (!testSubjectName) {
    return res.status(400).json({ error: 'Test subject name required' });
  }

  try {
    
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


exports.getAllTestSubjectNames = async (req, res) => {
  try {
    const testSubjects = await testSubject.find({}, 'name');
    res.json(testSubjects.map(c => c.name));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};