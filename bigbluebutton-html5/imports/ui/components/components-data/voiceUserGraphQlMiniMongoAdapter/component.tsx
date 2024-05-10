import { useSubscription } from '@apollo/client';
import React, { useEffect, useRef, useState } from 'react';
import VoiceUsers from '/imports/api/voice-users/';
import logger from '/imports/startup/client/logger';
import { UserVoiceStreamResponse, voiceUserStream } from './queries';
import { AdapterProps } from '../graphqlToMiniMongoAdapterManager/component';

const VoiceUserGrapQlMiniMongoAdapter: React.FC<AdapterProps> = ({
  onReady,
  children,
}) => {
  const ready = useRef(false);
  const {
    loading,
    error,
    data,
  } = useSubscription<UserVoiceStreamResponse>(voiceUserStream);
  const [voiceUserDataSetted, setVoiceUserDataSetted] = useState(false);
  useEffect(() => {
    if (error) {
      logger.error('Error in VoiceUserGrapQlMiniMongoAdapter', error);
    }
  }, [error]);

  useEffect(() => {
    if (data && data.user_voice_mongodb_adapter_stream) {
      const usersVoice = data.user_voice_mongodb_adapter_stream;

      usersVoice.forEach((userVoice) => {
        VoiceUsers.upsert({ userId: userVoice.userId }, userVoice);
      });
    }
  }, [data]);

  useEffect(() => {
    if (loading) {
      // loading turns false only first audio join of the meeting, probably because it's a stream
      if (!ready.current) {
        ready.current = true;
        onReady('VoiceUserGrapQlMiniMongoAdapter');
      }
      if (!voiceUserDataSetted) {
        setVoiceUserDataSetted(true);
      }
    }
  }, [loading]);
  return children;
};

export default VoiceUserGrapQlMiniMongoAdapter;
