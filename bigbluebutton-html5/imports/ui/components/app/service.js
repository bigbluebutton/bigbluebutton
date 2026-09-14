import data from '@emoji-mart/data';
import { init } from 'emoji-mart';
import logger from '/imports/startup/client/logger';
import useMeeting from '../../core/hooks/useMeeting';

export function useMeetingIsBreakout() {
  const { data: meeting } = useMeeting((m) => ({
    isBreakout: m.isBreakout,
  }));

  return !!(meeting && meeting.isBreakout);
}

const THEME_ATTRIBUTE = 'data-theme';

const THEME_CHANGE_EVENT = 'darkmodechange';

const isDarkThemeOn = () => (
  document.documentElement.getAttribute(THEME_ATTRIBUTE) === 'dark'
);

export const setDarkTheme = (value) => {
  const enabled = Boolean(value);
  if (enabled === isDarkThemeOn()) return;

  if (enabled) {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, 'dark');
  } else {
    document.documentElement.removeAttribute(THEME_ATTRIBUTE);
  }

  logger.info({ logCode: 'dark_mode' }, `Dark mode is ${enabled ? 'on' : 'off'}.`);
  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: { enabled } }));
};

export const initializeEmojiData = () => {
  const DISABLE_EMOJIS = window.meetingClientSettings.public.chat.disableEmojis;
  const emojis = Object.values(data.emojis);
  const allowedEmojis = {};

  // We manually filter it here because there's a bug in the Picker component.
  // See: https://github.com/missive/emoji-mart/issues/810
  const filteredEmojis = emojis.filter((e) => !DISABLE_EMOJIS.includes(e.id));

  filteredEmojis.forEach((e) => {
    allowedEmojis[e.id] = e;
  });

  const filteredData = {
    ...data,
    emojis: allowedEmojis,
  };

  init({ data: filteredData });
};

export default {
  setDarkTheme,
  useMeetingIsBreakout,
  initializeEmojiData,
};
