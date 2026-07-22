import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import {
  getCaptionsTermsLink,
} from '/imports/ui/components/audio/audio-graphql/audio-captions/service';
import { ActiveCaptionsResponse, GET_ACTIVE_CAPTIONS } from '/imports/ui/components/audio/audio-graphql/audio-captions/button/queries';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useAudioCaptionEnable from '/imports/ui/core/local-states/useAudioCaptionEnable';
import PanelHeader from '/imports/ui/components/common/panel-header/component';
import { PANELS } from '/imports/ui/components/layout/enums';
import AudioCaptionsSpeechControls from './speech/component';
import AudioCaptionsTextControls from './text/component';
import Styled from './styles';

const intlMessages = defineMessages({
  panelTitle: {
    id: 'app.audio.captions.panelTitle',
    description: 'Audio captions panel title',
  },
  disclaimer: {
    id: 'app.audio.captions.disclaimer',
    description: 'Disclaimer message about audio captions',
  },
  captionsTermsLinkText: {
    id: 'app.audio.captions.terms.linkText',
    description: 'Text for the anchor tag with link',
  },
});

const AudioCaptionsPanel = () => {
  const intl = useIntl();
  const {
    data: currentUser,
  } = useCurrentUser(
    (user) => ({
      captionLocale: user.captionLocale,
    }),
  );
  const [active] = useAudioCaptionEnable();
  const captionsTermsLink = getCaptionsTermsLink(intl.locale);

  const {
    data: activeCaptionsData,
    loading: activeCaptionsLoading,
  } = useDeduplicatedSubscription<ActiveCaptionsResponse>(GET_ACTIVE_CAPTIONS);

  if (activeCaptionsLoading) return null;
  if (!currentUser) return null;
  if (!activeCaptionsData) return null;

  const availableCaptions = activeCaptionsData.caption_activeLocales.map((caption) => caption.locale);
  const currentCaptionLocale = currentUser.captionLocale || '';

  return (
    <>
      <PanelHeader
        panelId={PANELS.AUDIO_CAPTIONS}
        title={intl.formatMessage(intlMessages.panelTitle)}
        dataTest="audioCaptionsTitle"
        closeButtonDataTest="closeAudioCaptionsPanel"
      />
      <Styled.Separator />
      <Styled.AudioCaptions>
        <Styled.CaptionsContainer>
          { captionsTermsLink && (
            <Styled.DisclaimerCallout>
              <Styled.Icon iconName="about" />
              <div>
                {intl.formatMessage(intlMessages.disclaimer, {
                  termsLink: (
                    <Styled.CaptionsTermsLink target="_blank" rel="noreferrer" href={captionsTermsLink}>
                      {intl.formatMessage(intlMessages.captionsTermsLinkText)}
                    </Styled.CaptionsTermsLink>
                  ),
                })}
              </div>
            </Styled.DisclaimerCallout>
          )}
          <AudioCaptionsSpeechControls
            showTerms={false}
          />
          <AudioCaptionsTextControls
            intl={intl}
            textActive={active}
            captionLocale={currentCaptionLocale}
            availableCaptions={availableCaptions}
          />
        </Styled.CaptionsContainer>
      </Styled.AudioCaptions>
    </>
  );
};

export default AudioCaptionsPanel;
