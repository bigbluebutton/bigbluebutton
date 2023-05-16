export default function getFromUserSettings(setting, defaultValue) {
  const valueFromSession = Session.get(`cparam_${setting}`);
  if (valueFromSession) {
    return valueFromSession;
  }

  return defaultValue;
}
