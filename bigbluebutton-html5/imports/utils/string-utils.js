import sanitize from 'sanitize-html';

export const capitalizeFirstLetter = (s = '') => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Returns a string in the format 'Year-Month-Day_Hour-Minutes'.
 * @param {Date} [date] - The Date object.
 */
export const getDateString = (date = new Date()) => {
  const hours = date.getHours().toString().padStart(2, 0);
  const minutes = date.getMinutes().toString().padStart(2, 0);
  const month = (date.getMonth() + 1).toString().padStart(2, 0);
  const dayOfMonth = date.getDate().toString().padStart(2, 0);
  const time = `${hours}-${minutes}`;
  const dateString = `${date.getFullYear()}-${month}-${dayOfMonth}_${time}`;
  return dateString;
};

export const stripTags = (text) => sanitize(text, { allowedTags: [] });

// Sanitize. See: https://gist.github.com/sagewall/47164de600df05fb0f6f44d48a09c0bd
export const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
};

export const unescapeHtml = (input) => {
  const e = document.createElement('textarea');
  e.innerHTML = input;
  return e.value;
};

export const safeMatch = (regex, content, defaultValue) => {
  const regexLimit = 50000;

  if (content.length > regexLimit) return defaultValue;
  return content.match(regex) || defaultValue;
};

export default {
  capitalizeFirstLetter,
  getDateString,
  stripTags,
  escapeHtml,
  unescapeHtml,
  safeMatch,
};
