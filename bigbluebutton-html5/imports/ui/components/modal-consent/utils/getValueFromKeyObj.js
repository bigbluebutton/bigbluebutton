export default function getValueFromKeyObj(keyObj, obj) {
  if (typeof obj !== 'object') {
    return null;
  }
  const existKey = Object.keys(obj).filter((key) => key === keyObj);

  if (existKey) {
    return obj[existKey];
  }
  return null;
}
