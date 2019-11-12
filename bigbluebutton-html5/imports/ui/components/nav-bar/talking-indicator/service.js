
const sortByStartTime = (a, b) => {
  if (a.startTime < b.startTime) return 1;
  if (a.startTime > b.startTime) return -1;
  return 0;
};

const sortByTalking = (a, b) => {
  if (a.talking && !b.talking) return -1;
  if (b.talking && !a.talking) return 1;
  return 0;
};

const sortVoiceUsers = (a, b) => {
  let sort = sortByTalking(a, b);

  if (sort === 0) {
    sort = sortByStartTime(a, b);
  }

  return sort;
};


export default {
  sortVoiceUsers,
};
