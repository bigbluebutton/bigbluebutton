export function toCamelCase(text = '') {
  let words = text.split(' ');
  words = words.filter((word) => word !== '');
  const firstWord = words.shift().toLowerCase();
  words = words.map((word) => {
    const firstLetter = word[0];
    return firstLetter.toUpperCase() + word.substring(1);
  });
  return firstWord + words.join('');
}

export default {
  toCamelCase,
};
