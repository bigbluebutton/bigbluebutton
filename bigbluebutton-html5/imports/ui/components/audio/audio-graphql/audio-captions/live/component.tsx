import React from 'react';
import { Caption, GET_CAPTIONS, getCaptions } from './queries';
import logger from '/imports/startup/client/logger';

import Styled from './styles';
import useAudioCaptionEnable from '/imports/ui/core/local-states/useAudioCaptionEnable';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { splitTranscript } from '../service';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import connectionStatus from '/imports/ui/core/graphql/singletons/connectionStatus';

interface AudioCaptionsLiveProps {
  captions: Caption[];
}

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
  const {
    data: currentUser,
  } = useCurrentUser((u) => ({
    captionLocale: u.captionLocale,
  }));
  const [audioCaptionsEnable] = useAudioCaptionEnable();

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
    <AudioCaptionsLive
      captions={AudioCaptionsLiveData.caption.map((c) => {
        const splits = splitTranscript(c);
        return splits;
      }).flat().filter((c) => c.captionText)}
    />
  );
};

export default AudioCaptionsLiveContainer;
