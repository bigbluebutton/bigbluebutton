const humanizeSeconds = time => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return [
    minutes,
    seconds,
  ].map(x => (x < 10) ? `0${x}` : x).join(':');
};

export {
  humanizeSeconds,
};
