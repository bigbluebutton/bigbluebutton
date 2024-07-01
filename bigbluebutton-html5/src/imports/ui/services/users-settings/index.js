import { localUserSettings } from '../../core/local-states/useUserSettings';

export default function getFromUserSettings(setting, defaultValue) {
  const userSetting = localUserSettings()[setting];
  if (userSetting !== undefined) {
    return userSetting;
  }

  return defaultValue;
}
