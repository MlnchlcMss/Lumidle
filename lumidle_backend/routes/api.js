const express = require('express');
const router = express.Router();
const testSubjectController = require('../controllers/testSubController');
const quoteController = require('../controllers/quoteController');
const sfxController = require('../controllers/sfxController');
router.get('/TestSubject/today', testSubjectController.getTodayTestSubject);
router.post('/guess', testSubjectController.submitGuess);
router.get('/TestSubjects', testSubjectController.getAllTestSubjectNames);
router.get('/quote/today', quoteController.getTodayQuote);
router.post('/guess-quote', quoteController.submitGuess);
router.get('/sfx/today', sfxController.getTodaySFX);
router.post('/guess-sfx', sfxController.submitGuess);

module.exports = router;