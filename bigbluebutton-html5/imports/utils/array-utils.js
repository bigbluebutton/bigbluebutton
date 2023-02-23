export const range = (start, end) => {
  const length = end - start;
  return Array.from({ length }, (_, i) => start + i);
}

export const partition = (arr, criteria) => {
  return [
    arr.filter(function (item) {
      return criteria(item);
    }),
    arr.filter(function (item) {
      return !criteria(item);
    }),
  ];
};

export const indexOf = (arr, value) => {
  return arr ? arr.findIndex((item) => item === value) : -1;
}

export const without = (arr, value) => {
  return arr.filter(function(item) {
    return item !== value;
  });
}

export default {
  range,
  partition,
  indexOf,
  without,
};
