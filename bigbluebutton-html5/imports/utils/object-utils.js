export const getValueByPointer = (obj, pointer) => {
  if (typeof obj !== 'object') return undefined;
  if (!obj) return undefined;
  if (typeof pointer !== 'string') return obj;
  if (pointer === '') return obj;
  const fields = pointer.split('.');
  let acc = obj;
  fields.forEach((field) => {
    acc = acc?.[field];
  });
  return acc;
};

export default {
  getValueByPointer,
};
