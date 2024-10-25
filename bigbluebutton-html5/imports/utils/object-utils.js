export const getValueByPointer = (obj, pointer) => {
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
