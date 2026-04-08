const { connectDB } = require('./_lib/db');
const testSubject = require('./_lib/models/testSubjects');

module.exports = async (req, res) => {
  try {
    await connectDB();
    const testSubjects = await testSubject.find({}, 'name');
    res.json(testSubjects.map(c => c.name));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
