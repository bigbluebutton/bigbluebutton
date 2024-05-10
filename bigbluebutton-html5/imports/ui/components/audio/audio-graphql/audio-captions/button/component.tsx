import React, { useEffect, useRef } from 'react';
import { layoutSelect } from '/imports/ui/components/layout/context';
import { Layout } from '/imports/ui/components/layout/layoutTypes';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import ButtonEmoji from '/imports/ui/components/common/button/button-emoji/ButtonEmoji';
import BBBMenu from '/imports/ui/components/common/menu/component';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation, useSubscription } from '@apollo/client';
import Styled from './styles';
import {
  setAudioCaptions, setSpeechLocale,
} from '../service';
import { MenuSeparatorItemType, MenuOptionItemType } from '/imports/ui/components/common/menu/menuTypes';
import useAudioCaptionEnable from '/imports/ui/core/local-states/useAudioCaptionEnable';
import { User } from '/imports/ui/Types/user';
import { SET_SPEECH_LOCALE } from '/imports/ui/core/graphql/mutations/userMutations';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { ActiveCaptionsResponse, getactiveCaptions } from './queries';

const CONFIG = window.meetingClientSettings.public.app.audioCaptions;
const PROVIDER = CONFIG.provider;

const intlMessages = defineMessages({
  start: {
    id: 'app.audio.captions.button.start',
    description: 'Start audio captions',
  },
  stop: {
    id: 'app.audio.captions.button.stop',
    description: 'Stop audio captions',
  },
  transcriptionSettings: {
    id: 'app.audio.captions.button.transcriptionSettings',
    description: 'Audio captions settings modal',
  },
  transcription: {
    id: 'app.audio.captions.button.transcription',
    description: 'Audio speech transcription label',
  },
  transcriptionOn: {
    id: 'app.switch.onLabel',
  },
  transcriptionOff: {
    id: 'app.switch.offLabel',
  },
  language: {
    id: 'app.audio.captions.button.language',
    description: 'Audio speech recognition language label',
  },
  'de-DE': {
    id: 'app.audio.captions.select.de-DE',
    description: 'Audio speech recognition german language',
  },
  'en-US': {
    id: 'app.audio.captions.select.en-US',
    description: 'Audio speech recognition english language',
  },
  'es-ES': {
    id: 'app.audio.captions.select.es-ES',
    description: 'Audio speech recognition spanish language',
  },
  'fr-FR': {
    id: 'app.audio.captions.select.fr-FR',
    description: 'Audio speech recognition french language',
  },
  'hi-ID': {
    id: 'app.audio.captions.select.hi-ID',
    description: 'Audio speech recognition indian language',
  },
  'it-IT': {
    id: 'app.audio.captions.select.it-IT',
    description: 'Audio speech recognition italian language',
  },
  'ja-JP': {
    id: 'app.audio.captions.select.ja-JP',
    description: 'Audio speech recognition japanese language',
  },
  'pt-BR': {
    id: 'app.audio.captions.select.pt-BR',
    description: 'Audio speech recognition portuguese language',
  },
  'ru-RU': {
    id: 'app.audio.captions.select.ru-RU',
    description: 'Audio speech recognition russian language',
  },
  'zh-CN': {
    id: 'app.audio.captions.select.zh-CN',
    description: 'Audio speech recognition chinese language',
  },
});

interface AudioCaptionsButtonProps {
  isRTL: boolean;
  availableVoices: string[];
  currentSpeechLocale: string;
  isSupported: boolean;
}

const DISABLED = '';

const AudioCaptionsButton: React.FC<AudioCaptionsButtonProps> = ({
  isRTL,
  currentSpeechLocale,
  availableVoices,
  isSupported,
}) => {
  const knownLocales = window.meetingClientSettings.public.captions.locales;
  const intl = useIntl();
  const [active] = useAudioCaptionEnable();
  const [setSpeechLocaleMutation] = useMutation(SET_SPEECH_LOCALE);
  const setUserSpeechLocale = (speechLocale: string, provider: string) => {
    setSpeechLocaleMutation({
      variables: {
        locale: speechLocale,
        provider,
      },
    });
  };
  const isTranscriptionDisabled = () => currentSpeechLocale === DISABLED;
  const fallbackLocale = availableVoices.includes(navigator.language)
    ? navigator.language
    : 'en-US'; // Assuming 'en-US' is the default fallback locale

  const getSelectedLocaleValue = isTranscriptionDisabled()
    ? fallbackLocale
    : currentSpeechLocale;

  const selectedLocale = useRef(getSelectedLocaleValue);

  useEffect(() => {
    if (!isTranscriptionDisabled()) selectedLocale.current = getSelectedLocaleValue;
  }, [currentSpeechLocale]);

  const shouldRenderChevron = isSupported;
  const shouldRenderSelector = isSupported && availableVoices.length > 0;

  const getAvailableLocales = () => {
    let indexToInsertSeparator = -1;
    const availableVoicesObjectToMenu: (MenuOptionItemType | MenuSeparatorItemType)[] = availableVoices
      .map((availableVoice: string, index: number) => {
        if (availableVoice === availableVoices[0]) {
          indexToInsertSeparator = index;
        }
        return (
          {
            icon: '',
            label: intl.formatMessage(intlMessages[availableVoice as keyof typeof intlMessages]),
            key: availableVoice,
            iconRight: selectedLocale.current === availableVoice ? 'check' : null,
            customStyles: (selectedLocale.current === availableVoice) && Styled.SelectedLabel,
            disabled: isTranscriptionDisabled(),
            onClick: () => {
              selectedLocale.current = availableVoice;
              setSpeechLocale(selectedLocale.current, setUserSpeechLocale);
            },
          }
        );
      });
    if (indexToInsertSeparator >= 0) {
      availableVoicesObjectToMenu.splice(indexToInsertSeparator, 0, {
        key: 'separator-01',
        isSeparator: true,
      });
    }
    return [
      ...availableVoicesObjectToMenu,
    ];
  };

  const getAvailableCaptions = () => {
    return availableVoices.map((caption) => {
      const localeName = knownLocales ? knownLocales.find((l) => l.locale === caption)?.name : 'en';

      return {
        key: caption,
        label: localeName,
        customStyles: (selectedLocale.current === caption) && Styled.SelectedLabel,
        iconRight: selectedLocale.current === caption ? 'check' : null,
        onClick: () => {
          selectedLocale.current = caption;
          setSpeechLocale(selectedLocale.current, setUserSpeechLocale);
        },
      };
    });
  };

  const getAvailableLocalesList = () => {
    // audio captions
    if (shouldRenderChevron) {
      return [{
        key: 'availableLocalesList',
        label: intl.formatMessage(intlMessages.language),
        customStyles: Styled.TitleLabel,
        disabled: true,
      },
      ...getAvailableLocales(),
      {
        key: 'divider',
        label: intl.formatMessage(intlMessages.transcription),
        customStyles: Styled.TitleLabel,
        disabled: true,
      },
      {
        key: 'separator-02',
        isSeparator: true,
      }];
    }

    // typed captions
    return [{
      key: 'availableLocalesList',
      label: intl.formatMessage(intlMessages.language),
      customStyles: Styled.TitleLabel,
      disabled: true,
    },
    ...getAvailableCaptions(),
    ];
  };
  const onToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentSpeechLocale && !active) {
      setUserSpeechLocale(availableVoices[0], PROVIDER);
    }
    setAudioCaptions(!active);
  };

  const startStopCaptionsButton = (
    <Styled.ClosedCaptionToggleButton
      icon={active ? 'closed_caption' : 'closed_caption_stop'}
      label={intl.formatMessage(active ? intlMessages.stop : intlMessages.start)}
      color={active ? 'primary' : 'default'}
      ghost={!active}
      hideLabel
      circle
      size="lg"
      onClick={onToggleClick}
    />
  );

  return (
    shouldRenderChevron || shouldRenderSelector
      ? (
        <Styled.SpanButtonWrapper>
          <BBBMenu
            trigger={(
              <>
                { startStopCaptionsButton }
                <ButtonEmoji
                  emoji="device_list_selector"
                  hideLabel
                  label={intl.formatMessage(intlMessages.transcriptionSettings)}
                  tabIndex={0}
                  rotate
                />
              </>
            )}
            actions={getAvailableLocalesList()}
            opts={{
              id: 'default-dropdown-menu',
              keepMounted: true,
              transitionDuration: 0,
              elevation: 3,
              getcontentanchorel: null,
              fullwidth: 'true',
              anchorOrigin: { vertical: 'top', horizontal: isRTL ? 'right' : 'left' },
              transformOrigin: { vertical: 'bottom', horizontal: isRTL ? 'right' : 'left' },
            }}
          />
        </Styled.SpanButtonWrapper>
      ) : startStopCaptionsButton
  );
};

const AudioCaptionsButtonContainer: React.FC = () => {
  const isRTL = layoutSelect((i: Layout) => i.isRTL);
  const {
    data: currentUser,
    loading: currentUserLoading,
  } = useCurrentUser(
    (user: Partial<User>) => ({
      speechLocale: user.speechLocale,
      voice: user.voice,
    }),
  );

  const {
    data: currentMeetingData,
    loading: currentMeetingLoading,
  } = useMeeting((m) => ({
    componentsFlags: m.componentsFlags,
  }));

  const {
    data: activeCaptionsData,
    loading: activeCaptionsLoading,
  } = useSubscription<ActiveCaptionsResponse>(getactiveCaptions);

  if (currentUserLoading) return null;
  if (currentMeetingLoading) return null;
  if (activeCaptionsLoading) return null;
  if (!currentUser) return null;
  if (!currentMeetingData) return null;
  if (!activeCaptionsData) return null;

  const availableVoices = activeCaptionsData.caption_activeLocales.map((caption) => caption.locale);
  const currentSpeechLocale = currentUser.speechLocale || '';
  const isSupported = availableVoices.length > 0;

  if (!currentMeetingData.componentsFlags?.hasCaption) return null;

  return (
    <AudioCaptionsButton
      isRTL={isRTL}
      availableVoices={availableVoices}
      currentSpeechLocale={currentSpeechLocale}
      isSupported={isSupported}
    />
  );
};

export default AudioCaptionsButtonContainer;
