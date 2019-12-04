const sortByStartTime = (a, b) => {
  if (a.startTime < b.startTime) return -1;
  if (a.startTime > b.startTime) return 1;
  return 0;
};

const sortVoiceUsers = (a, b) => {
  const sort = sortByStartTime(a, b);
  return sort;
};

export default {
  sortVoiceUsers,
};
