import createUseLocalState from './createUseLocalState';

type genericObject = {[key:string]: boolean | string | string [] | undefined};
const initialUserSettings: genericObject = {};
const [useUserSettings, setUserSettings, localUserSettings] = createUseLocalState<genericObject>(initialUserSettings);

export default useUserSettings;
export {
  setUserSettings,
  localUserSettings,
};
