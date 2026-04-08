const { connectDB } = require('../_lib/db');
const Quote = require('../_lib/models/quote');

module.exports = async (req, res) => {
  try {
    await connectDB();
    
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
