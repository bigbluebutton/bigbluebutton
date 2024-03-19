import Local from './local';
import Session from './session';

const APP_CONFIG = window.meetingClientSettings.public.app;

const BBBStorage = APP_CONFIG.userSettingsStorage === 'local' ? Local : Session;

export default BBBStorage;
