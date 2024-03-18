import MeetingClientSettings from '../../Types/meetingClientSettings';
import meetingClientSettingsInitialValues from '../initial-values/meetingClientSettings';
import createUseLocalState from './createUseLocalState';

const initialMeetingSeetings: MeetingClientSettings = meetingClientSettingsInitialValues;
const [useMeetingSettings, setMeetingSettings] = createUseLocalState<MeetingClientSettings>(initialMeetingSeetings);

export default useMeetingSettings;
export { setMeetingSettings };
