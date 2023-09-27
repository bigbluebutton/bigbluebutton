import { useSubscription } from '@apollo/client';
import { Meteor } from 'meteor/meteor';
import React, { useEffect, useRef, useState } from 'react';
import { GET_AUDIO_CAPTIONS, GetAudioCaptions } from './queries';
import logger from '/imports/startup/client/logger';
import { User } from '/imports/ui/Types/user';
import Styled from './styles';

const CAPTIONS_CONFIG = Meteor.settings.public.captions;

interface AudioCaptionsLiveProps {
  transcript: string;
  user: Pick<User, 'avatar' | 'color' | 'name' | 'isModerator'>;
}

const AudioCaptionsLive: React.FC<AudioCaptionsLiveProps> = ({
  transcript,
  user,
}) => {
  const [clear, setClear] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevTranscriptRef = useRef<string>('');

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };
  // did update
  useEffect(() => {
    if (clear) {
      if (prevTranscriptRef.current !== transcript) {
        prevTranscriptRef.current = transcript;
        setClear(false);
      }
    } else {
      resetTimer();
      timerRef.current = setTimeout(() => setClear(true), CAPTIONS_CONFIG.time);
    }
  }, [transcript, clear]);
  // will unmount
  useEffect(() => () => resetTimer(), []);

  const hasContent = transcript.length > 0 && !clear;

  return (
    <Styled.Wrapper>
      {clear ? null : (
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
      <Styled.Captions hasContent={hasContent}>
        {clear ? '' : transcript}
      </Styled.Captions>
      <Styled.VisuallyHidden
        aria-atomic
        aria-live="polite"
      >
        {clear ? '' : transcript}
      </Styled.VisuallyHidden>
    </Styled.Wrapper>
  );
};

const AudioCaptionsLiveContainer: React.FC = () => {
  const {
    data: AudioCaptionsLiveData,
    loading: AudioCaptionsLiveLoading,
    error: AudioCaptionsLiveError,
  } = useSubscription<GetAudioCaptions>(GET_AUDIO_CAPTIONS);

  if (AudioCaptionsLiveLoading) return null;

  if (AudioCaptionsLiveError) {
    logger.error(AudioCaptionsLiveError);
    return (
      <div>
        {JSON.stringify(AudioCaptionsLiveError)}
      </div>
    );
  }

  if (!AudioCaptionsLiveData) return null;
  if (!AudioCaptionsLiveData.audio_caption) return null;
  if (!AudioCaptionsLiveData.audio_caption[0]) return null;
  const {
    transcript,
    user,
  } = AudioCaptionsLiveData.audio_caption[0];
  return (
    <AudioCaptionsLive
      transcript={transcript}
      user={user}
    />
  );
};

export default AudioCaptionsLiveContainer;
