import * as DarkReader from 'darkreader';
import Styled from './styles';
import logger from '/imports/startup/client/logger';
import useMeeting from '../../core/hooks/useMeeting';

export function useMeetingIsBreakout() {
  const { data: meeting } = useMeeting((m) => ({
    isBreakout: m.isBreakout,
  }));

  return meeting && meeting.isBreakout;
}

export const setDarkTheme = (value) => {
  console.log('DarkReader', DarkReader)
  if (value && !DarkReader.isEnabled()) {
    DarkReader.enable(
      { brightness: 100, contrast: 90 },
      {
        invert: [Styled.DtfInvert],
        ignoreInlineStyle: [Styled.DtfCss],
        ignoreImageAnalysis: [Styled.DtfImages],
      },
    );
    logger.info(
      {
        logCode: 'dark_mode',
      },
      'Dark mode is on.',
    );
  }

  if (!value && DarkReader.isEnabled()) {
    DarkReader.disable();
    logger.info(
      {
        logCode: 'dark_mode',
      },
      'Dark mode is off.',
    );
  }
};

export const isDarkThemeEnabled = () => DarkReader.isEnabled();

export default {
  setDarkTheme,
  isDarkThemeEnabled,
  useMeetingIsBreakout,
};
