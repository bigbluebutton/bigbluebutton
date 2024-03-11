import createUseLocalState from './createUseLocalState';

export interface AuthData {
  meetingId: string;
  userId: string;
  authToken: string;
  logoutUrl: string;
  sessionToken: string;
  userName: string;
  extId: string;
  meetingName: string;
}

const initialAudioCaptionEnable: AuthData = {
  meetingId: '',
  authToken: '',
  extId: '',
  logoutUrl: '',
  meetingName: '',
  sessionToken: '',
  userId: '',
  userName: '',
};
const [useAuthData, setAuthData] = createUseLocalState<AuthData>(initialAudioCaptionEnable);

export default useAuthData;
export { setAuthData };
