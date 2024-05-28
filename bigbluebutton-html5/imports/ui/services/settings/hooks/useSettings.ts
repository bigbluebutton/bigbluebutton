import { useReactiveVar } from '@apollo/client';
import { SETTINGS } from '../enums';
import { getSettingsSingletonInstance } from '..';

const useSettings = (setting: typeof SETTINGS[keyof typeof SETTINGS]) => {
  const prop = `${setting}Var`;
  // @ts-ignore JS code
  const Settings = getSettingsSingletonInstance();
  const variable = Settings[prop];
  return useReactiveVar(variable);
};

export default useSettings;
