export default function getValueFromKeyObj(keyObj, obj) {
  const existKey = Object.keys(obj).filter((key) => key === keyObj);

  if (existKey) {
    return obj[existKey];
  }
  return null;
}
