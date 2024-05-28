import { useReactiveVar } from '@apollo/client';
import { SETTINGS } from '../enums';
import Settings from '..';

const useSettings = (setting: typeof SETTINGS[keyof typeof SETTINGS]) => {
  const prop = `${setting}Var`;
  // @ts-ignore JS code
  const variable = Settings[prop];
  return useReactiveVar(variable);
};

export default useSettings;
