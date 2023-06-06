import Breakouts from '/imports/api/breakouts';
import Meetings from '/imports/api/meetings';
import Settings from '/imports/ui/services/settings';
import Auth from '/imports/ui/services/auth/index';
import deviceInfo from '/imports/utils/deviceInfo';
import Styled from './styles';
import DarkReader from 'darkreader';
import logger from '/imports/startup/client/logger';

const getFontSize = () => {
  const applicationSettings = Settings.application;
  return applicationSettings ? applicationSettings.fontSize : '16px';
};

const getBreakoutRooms = () => Breakouts.find().fetch();

function meetingIsBreakout() {
  const meeting = Meetings.findOne({ meetingId: Auth.meetingID },
    { fields: { 'meetingProp.isBreakout': 1 } });
  return (meeting && meeting.meetingProp.isBreakout);
}

const setDarkTheme = (value) => {
  if (value && !DarkReader.isEnabled()) {
      DarkReader.enable(
        { brightness: 100, contrast: 90 },
        { invert: [Styled.DtfInvert], ignoreInlineStyle: [Styled.DtfCss], ignoreImageAnalysis: [Styled.DtfImages] },
      )
      logger.info({
        logCode: 'dark_mode',
      }, 'Dark mode is on.');
  }

  if (!value && DarkReader.isEnabled()){
    DarkReader.disable();
    logger.info({
      logCode: 'dark_mode',
    }, 'Dark mode is off.');
  }
}

const isDarkThemeEnabled = () => {
  return DarkReader.isEnabled()
}

export {
  getFontSize,
  meetingIsBreakout,
  getBreakoutRooms,
  setDarkTheme,
  isDarkThemeEnabled,
};
