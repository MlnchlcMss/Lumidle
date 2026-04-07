const SFX = require('../models/sfx');
const { encrypt } = require('../utils/encryptHelper');

const getLocalDate = () => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(now);
};


exports.getTodaySFX = async (req, res) => {
  try {
    const count = await SFX.countDocuments();
    if (count === 0) return res.status(500).json({ error: 'No SFX in database' });

    const start = new Date(2022, 0, 0);
    const diff = Date.now() - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    const index = day % count;
    const sfx = await SFX.findOne().skip(index);

    const payload = {
      id: sfx._id,
      testSubject: sfx.testSubject,
      skillName: sfx.skillName,
      sfxFile: sfx.sfxFile,
      iconFile: sfx.iconFile,
    };

    const dateStr = getLocalDate();
    const salt = 'if-you-see-this-dm-me-sua-pics';
    const encrypted = encrypt(payload, dateStr, salt);
    
     res.json({ encrypted, date: dateStr });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.submitGuess = async (req, res) => {
  const { testSubjectName } = req.body;
  if (!testSubjectName) return res.status(400).json({ error: 'Test Subject name required' });

  try {
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