const humanizeSeconds = (time) => {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;
  const formatNumber = (num) => {
    if (num < 10) {
      return `0${num}`;
    }
    return num.toString();
  };

  if (hours > 0) {
    return `${formatNumber(hours)}:${formatNumber(minutes)}:${formatNumber(seconds)}`;
  }
  return `${formatNumber(minutes)}:${formatNumber(seconds)}`;
};

export default humanizeSeconds;
