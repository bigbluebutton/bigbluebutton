const sortByStartTime = (a, b) => {
  if (a.startTime < b.startTime) return -1;
  if (a.startTime > b.startTime) return 1;
  return 0;
};

const sortVoiceUsers = (a, b) => {
  const sort = sortByStartTime(a, b);
  return sort;
};

const everyNotTalking = (talkers) => {
  const values = Object.values(talkers);
  return values.every(({ talking }) => talking === false);
};

export default {
  sortVoiceUsers,
  everyNotTalking,
};
