import { formatNumber } from '/imports/utils/intl-formatter';

const humanizeSeconds = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return [
    minutes,
    seconds,
  ].map((x) => {
    const formattednumber = formatNumber(x);
    if (x < 10) {
      const formattedZero = formatNumber(0);
      return `${formattedZero}${formattednumber}`;
    }
    return formattednumber;
  }).join(':');
};

export default humanizeSeconds;
