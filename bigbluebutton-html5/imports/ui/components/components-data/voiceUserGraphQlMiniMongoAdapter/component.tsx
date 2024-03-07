import { useSubscription } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import VoiceUsers from '/imports/api/voice-users/';
import logger from '/imports/startup/client/logger';
import { UserVoiceStreamResponse, voiceUserStream } from './queries';

const VoiceUserGrapQlMiniMongoAdapter: React.FC = () => {
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
      if (!voiceUserDataSetted) {
        setVoiceUserDataSetted(true);
      }
    }
  }, [loading]);
  return null;
};

export default VoiceUserGrapQlMiniMongoAdapter;
