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

export default {
  capitalizeFirstLetter,
  getDateString,
};
