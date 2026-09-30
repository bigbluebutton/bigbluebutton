import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import { notify } from '/imports/ui/services/notification';
import intlHolder from '../../core/singletons/intlHolder';
import { isMobile } from '/imports/ui/components/layout/utils';
import AudioManager from '/imports/ui/services/audio-manager';
import logger from '/imports/startup/client/logger';
import {
  getStoredAudioInputDeviceId,
  getStoredAudioOutputDeviceId,
  storeAudioInputDeviceId,
  storeAudioOutputDeviceId,
} from '/imports/api/audio/client/bridge/service';
import {
  liveChangeInputDevice,
  liveChangeOutputDevice,
} from '/imports/ui/components/audio/audio-graphql/audio-controls/input-stream-live-selector/service';

export const updateSettings = (obj, msgDescriptor, mutation) => {
  const Settings = getSettingsSingletonInstance();
  Object.keys(obj).forEach((k) => { Settings[k] = obj[k]; });
  Settings.save(mutation);

  if (msgDescriptor) {
    // prevents React state update on unmounted component
    const intl = intlHolder.getIntl();
    notify(
      intl.formatMessage(msgDescriptor),
      'info',
      'settings',
    );
  }
};

export const getInitialFontSize = () => {
  const { fontSize } = getSettingsSingletonInstance().application;
  if (fontSize) return fontSize;

  const APP_CONFIG = window.meetingClientSettings.public.app;
  return isMobile() ? APP_CONFIG.mobileFontSize : APP_CONFIG.desktopFontSize;
};

export const getAudioDeviceSelection = () => ({
  inputDeviceId: AudioManager.inputDeviceId || getStoredAudioInputDeviceId() || '',
  outputDeviceId: AudioManager.outputDeviceId || getStoredAudioOutputDeviceId() || '',
});

const logDeviceChangeFailure = (kind, deviceId, error) => {
  logger.error({
    logCode: 'settings_audio_device_change_failed',
    extraInfo: {
      kind,
      deviceId,
      errorName: error?.name,
      errorMessage: error?.message,
    },
  }, `Settings: failed to apply the ${kind} device - {${error?.name}: ${error?.message}}`);
};

/**
 * Applies the devices picked in the device test. In the audio, a device switches
 * live, as in the in-call selector; out of it (and before the join), the pick is
 * stored for the next audio join. With enableDynamicAudioDeviceSelection off, a
 * call keeps its devices and the pick waits for the next join.
 */
export const applyAudioDeviceSelection = (previous, next, onFailure = () => {}) => {
  const { inputDeviceId, outputDeviceId } = next;
  const { enableDynamicAudioDeviceSelection } = window.meetingClientSettings.public.app;
  const inAudio = AudioManager.isConnected;
  const canChangeLive = inAudio && enableDynamicAudioDeviceSelection;

  if (inputDeviceId && inputDeviceId !== previous.inputDeviceId) {
    // A transparent listen-only user holds the 'listen-only' placeholder: only a
    // live change opens the microphone, as the in-call selector does.
    const hasLiveInput = !AudioManager.isListenOnly || AudioManager.supportsTransparentListenOnly();

    if (canChangeLive && hasLiveInput) {
      liveChangeInputDevice(inputDeviceId).catch((error) => {
        logDeviceChangeFailure('input', inputDeviceId, error);
        onFailure();
      });
    } else if (inAudio) {
      // The bridge keeps the device of the call.
      storeAudioInputDeviceId(inputDeviceId);
    } else {
      AudioManager.changeInputDevice(inputDeviceId);
      storeAudioInputDeviceId(inputDeviceId);
    }
  }

  if (outputDeviceId && outputDeviceId !== previous.outputDeviceId) {
    if (inAudio && !canChangeLive) {
      storeAudioOutputDeviceId(outputDeviceId);
    } else {
      liveChangeOutputDevice(outputDeviceId, true).catch((error) => {
        logDeviceChangeFailure('output', outputDeviceId, error);
        onFailure();
      });
    }
  }
};

export const getAvailableLocales = () => fetch('./locales/')
  .then((locales) => locales.json())
  .then((locales) => locales.filter((locale) => (
    locale.name !== 'index.json' && !locale.name.endsWith('.gz')
  )));

export const FALLBACK_LOCALES = {
  dv: {
    englishName: 'Dhivehi',
    nativeName: 'ދިވެހި',
  },
  hy: {
    englishName: 'Armenian',
    nativeName: 'Հայերեն',
  },
  ka: {
    englishName: 'Georgian',
    nativeName: 'ქართული',
  },
  kk: {
    englishName: 'Kazakh',
    nativeName: 'қазақ',
  },
  'lo-LA': {
    englishName: 'Lao',
    nativeName: 'ລາວ',
  },
  oc: {
    englishName: 'Occitan',
    nativeName: 'Occitan',
  },
  'uz@Cyrl': {
    englishName: 'Uzbek (Cyrillic)',
    nativeName: 'ўзбек тили',
  },
};

export default {
  updateSettings,
  getInitialFontSize,
  getAudioDeviceSelection,
  applyAudioDeviceSelection,
  getAvailableLocales,
  FALLBACK_LOCALES,
};
