import { VOICE_USERS_SUBSCRIPTION, VoiceUsersResponse } from '../queries';
import createUseSubscription from '/imports/ui/core/hooks/createUseSubscription';

type Voice = VoiceUsersResponse['user_voice'][number];

const useVoiceUsersSubscription = createUseSubscription<Voice>(
  VOICE_USERS_SUBSCRIPTION,
  {},
  true,
);

const useVoiceUsers = (projection: (v: Partial<Voice>) => Partial<Voice>) => {
  const response = useVoiceUsersSubscription(projection);
  return response;
};

export default useVoiceUsers;
