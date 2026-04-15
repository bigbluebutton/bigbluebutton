import React from 'react';
import { Caption, GET_CAPTIONS, getCaptions } from './queries';
import logger from '/imports/startup/client/logger';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';
import useAudioCaptionEnable from '/imports/ui/core/local-states/useAudioCaptionEnable';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { splitTranscript, captionLimit } from '../service';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import connectionStatus from '/imports/ui/core/graphql/singletons/connectionStatus';
import { layoutSelectOutput } from '/imports/ui/components/layout/context';
import { Output } from '/imports/ui/components/layout/layoutTypes';

interface AudioCaptionsLiveProps {
  captions: Caption[];
}

const messages = defineMessages({
  captions: {
    id: 'app.audio.captions.live.captions',
    description: 'Accessible label for the audio captions region',
  },
});

const AudioCaptionsLive: React.FC<AudioCaptionsLiveProps> = ({
  captions,
}) => {
  return (
    <Styled.Wrapper>
      <>
        {
          captions.length > 0 ? captions.map((caption) => {
            const {
              user,
              captionText,
            } = caption;
            return (
              <Styled.CaptionWrapper
                key={caption.captionId}
              >
                {!user ? null : (
                  <Styled.UserAvatarWrapper>
                    <Styled.UserAvatar
                      avatar={user.avatar}
                      color={user.color}
                      moderator={user.isModerator}
                    >
                      {user.avatar ? '' : user.name.slice(0, 2)}
                    </Styled.UserAvatar>
                  </Styled.UserAvatarWrapper>
                )}
                <Styled.Captions hasContent>
                  {!captionText ? '' : captionText}
                </Styled.Captions>
                <Styled.VisuallyHidden
                  aria-atomic
                  aria-live="polite"
                >
                  {!captionText ? '' : captionText}
                </Styled.VisuallyHidden>
              </Styled.CaptionWrapper>
            );
          }) : null
        }
      </>
    </Styled.Wrapper>
  );
};

const AudioCaptionsLiveContainer: React.FC = () => {
  const intl = useIntl();
  const {
    data: currentUser,
  } = useCurrentUser((u) => ({
    captionLocale: u.captionLocale,
  }));
  const [audioCaptionsEnable] = useAudioCaptionEnable();
  const captionsStyle = layoutSelectOutput((i: Output) => i.captions);

  const {
    data: AudioCaptionsLiveData,
    loading: AudioCaptionsLiveLoading,
    error: AudioCaptionsLiveError,
  } = useDeduplicatedSubscription<getCaptions>(GET_CAPTIONS, {
    variables: { locale: currentUser?.captionLocale ?? 'en-US' },
    skip: !audioCaptionsEnable || !currentUser?.captionLocale,
  });

  if (AudioCaptionsLiveLoading) return null;

  if (AudioCaptionsLiveError) {
    connectionStatus.setSubscriptionFailed(true);
    logger.error(
      {
        logCode: 'subscription_Failed',
        extraInfo: {
          error: AudioCaptionsLiveError,
        },
      },
      'Subscription failed to load',
    );
    return null;
  }

  if (!AudioCaptionsLiveData) return null;
  if (!AudioCaptionsLiveData.caption) return null;
  if (!AudioCaptionsLiveData.caption[0]) return null;

  if (!audioCaptionsEnable) return null;

  return (
    <Styled.CaptionsContainer
      as="section"
      aria-label={intl.formatMessage(messages.captions)}
      style={{
        position: 'absolute',
        left: captionsStyle.left,
        right: captionsStyle.right,
        maxWidth: captionsStyle.maxWidth,
      }}
    >
      <AudioCaptionsLive
        captions={AudioCaptionsLiveData.caption.map((c) => {
          const splits = splitTranscript(c);
          return splits;
        }).flat().filter((c) => c.captionText).slice(-captionLimit())}
      />
    </Styled.CaptionsContainer>
  );
};

export default AudioCaptionsLiveContainer;
