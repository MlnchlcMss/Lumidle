const getTodayDate = () => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' });
  return formatter.format(now);
};

const getDailyIndex = (arrayLength) => {
  const start = new Date(2022, 0, 0);
  const diff = new Date() - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);
  return day % arrayLength;
};

export const getDailyTestSubjectId = (testSubjects) => {
  const index = getDailyIndex(testSubjects.length);
  return testSubjects[index]._id || index; 
};

export const getDailyTestSubject = (testSubjects) => {
  const index = getDailyIndex(testSubjects.length);
  return testSubjects[index];
};

export const getDailyQuote = (quotes) => {
  const index = getDailyIndex(quotes.length);
  return quotes[index];
};

export const getDailySFX = (sfxList) => {
  const index = getDailyIndex(sfxList.length);
  return sfxList[index];
};

export { getTodayDate };