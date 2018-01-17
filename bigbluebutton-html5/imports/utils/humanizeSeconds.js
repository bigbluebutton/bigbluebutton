const humanizeSeconds = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return [
    minutes,
    seconds,
  ].map((x) => {
    if (x < 10) {
      return `0${x}`;
    }
    return x;
  },
  ).join(':');
};

export default humanizeSeconds;
