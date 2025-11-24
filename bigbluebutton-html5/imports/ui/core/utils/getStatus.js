export default function getStatus(levels, value) {
  const sortedLevels = Object.entries(levels)
    .map((entry) => [entry[0], Number(entry[1])])
    .sort((a, b) => a[1] - b[1]);

  for (let i = 0; i < sortedLevels.length; i += 1) {
    if (value <= sortedLevels[i][1]) {
      return i === 0 ? 'normal' : sortedLevels[i - 1][0];
    }
  }

  return sortedLevels[sortedLevels.length - 1][0];
}
