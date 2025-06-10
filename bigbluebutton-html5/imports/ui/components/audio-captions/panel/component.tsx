import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import {
  getCaptionsTermsLink,
} from '/imports/ui/components/audio/audio-graphql/audio-captions/service';
import { ActiveCaptionsResponse, GET_ACTIVE_CAPTIONS } from '/imports/ui/components/audio/audio-graphql/audio-captions/button/queries';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { layoutDispatch, layoutSelect } from '/imports/ui/components/layout/context';
import { Layout } from '/imports/ui/components/layout/layoutTypes';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useAudioCaptionEnable from '/imports/ui/core/local-states/useAudioCaptionEnable';
import AudioCaptionsSpeechControls from './speech/component';
import AudioCaptionsTextControls from './text/component';
import Styled from './styles';

const intlMessages = defineMessages({
  panelTitle: {
    id: 'app.audio.captions.panelTitle',
    description: 'Audio captions panel title',
  },
  minimize: {
    id: 'app.sidebarContent.minimizePanelLabel',
    description: 'Minimize button label',
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
  const layoutContextDispatch = layoutDispatch();
  const isRTL = layoutSelect((i: Layout) => i.isRTL);
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
      <Styled.HeaderContainer
        isRTL={isRTL}
        data-test="audioCaptionsTitle"
        title={intl.formatMessage(intlMessages.panelTitle)}
        leftButtonProps={{}}
        rightButtonProps={{
          'aria-label': intl.formatMessage(intlMessages.minimize, { 0: intl.formatMessage(intlMessages.panelTitle) }),
          'data-test': 'closeAudioCaptionsPanel',
          icon: 'minus',
          label: intl.formatMessage(intlMessages.minimize, { 0: intl.formatMessage(intlMessages.panelTitle) }),
          onClick: () => {
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
              value: false,
            });
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
              value: PANELS.NONE,
            });
          },
        }}
        customRightButton={null}
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
