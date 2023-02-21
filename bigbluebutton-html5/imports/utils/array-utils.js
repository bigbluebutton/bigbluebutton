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

export default {
  range,
  partition,
};
