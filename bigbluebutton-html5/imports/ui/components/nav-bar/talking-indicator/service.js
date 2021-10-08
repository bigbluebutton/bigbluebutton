const everyNotTalking = (talkers) => {
  const values = Object.values(talkers);
  return values.every(({ talking }) => talking === false);
};

export default {
  everyNotTalking,
};
