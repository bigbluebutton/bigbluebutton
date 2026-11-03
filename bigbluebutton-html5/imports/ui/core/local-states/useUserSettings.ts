import createUseLocalState from './createUseLocalState';

type genericObject = {[key:string]: boolean | string | string [] | undefined};
const initialUserSettings: genericObject = {};
const [useUserSettings, setUserSettings, localUserSettings] = createUseLocalState<genericObject>(initialUserSettings);

// Tracks whether the per-user settings (userdata) have finished loading from
// GraphQL. getFromUserSettings falls back to defaults until this is true, so
// consumers whose behavior depends on a setting being resolved (e.g. the audio
// auto-join deafen decision) should wait for it before acting on that setting.
const [useUserSettingsReady, setUserSettingsReady] = createUseLocalState<boolean>(false);

export default useUserSettings;
export {
  setUserSettings,
  localUserSettings,
  useUserSettingsReady,
  setUserSettingsReady,
};
