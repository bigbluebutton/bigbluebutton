export const containsBooleanValue = (value: string): boolean => {
  const comparisonValues = ['true', 'false'];
  const stringValue = value.toLowerCase();
  return comparisonValues.includes(stringValue);
};

export default {
  containsBooleanValue,
};
