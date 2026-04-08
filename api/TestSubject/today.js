const { connectDB } = require('../_lib/db');
const testSubject = require('../_lib/models/testSubjects');

module.exports = async (req, res) => {
  try {
    await connectDB();
    
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
