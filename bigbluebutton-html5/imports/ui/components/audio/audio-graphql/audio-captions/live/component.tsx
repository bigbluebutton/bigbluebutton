import { useSubscription } from '@apollo/client';
import React from 'react';
import { Caption, GET_CAPTIONS, getCaptions } from './queries';
import logger from '/imports/startup/client/logger';
import OldCaptionsService from '/imports/ui/components/captions/service';
import { usePreviousValue } from '/imports/ui/components/utils/hooks';
import Styled from './styles';
import useAudioCaptionEnable from '/imports/ui/core/local-states/useAudioCaptionEnable';
import { splitTranscript, isAudioTranscription } from '../service';

const TRANSCRIPTION_DEFAULT_PAD = window.meetingClientSettings.public.captions.defaultPad;
const CAPTIONS_ALWAYS_VISIBLE = window.meetingClientSettings.public.app.audioCaptions.alwaysVisible;

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
              <Styled.CaptionWrapper>
                {!user ? null : (
                  <Styled.UserAvatarWrapper>
                    <Styled.UserAvatar
                      avatar={user.avatar}
                      color={user.color}
                      moderator={user.isModerator}
                    >
                      {user.name.slice(0, 2)}
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
    data: AudioCaptionsLiveData,
    loading: AudioCaptionsLiveLoading,
    error: AudioCaptionsLiveError,
  } = useSubscription<getCaptions>(GET_CAPTIONS);
  const [audioCaptionsEnable] = useAudioCaptionEnable();
  const activated = CAPTIONS_ALWAYS_VISIBLE
    || (AudioCaptionsLiveData && AudioCaptionsLiveData.caption.some(isAudioTranscription));
  const prevActivated = usePreviousValue(activated);
  if (!prevActivated && activated) {
    OldCaptionsService.createCaptions(TRANSCRIPTION_DEFAULT_PAD);
  }

  if (!AudioCaptionsLiveData) return null;
  if (!AudioCaptionsLiveData.caption) return null;
  if (!AudioCaptionsLiveData.caption[0]) return null;
  if (AudioCaptionsLiveLoading) return null;

  if (!audioCaptionsEnable) return null;

  if (AudioCaptionsLiveError) {
    logger.error(AudioCaptionsLiveError);
    return (
      <div>
        {JSON.stringify(AudioCaptionsLiveError)}
      </div>
    );
  }

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
