import { useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { muteAway } from '/imports/ui/components/audio/audio-graphql/audio-controls/input-stream-live-selector/service';
import useToggleVoice from '/imports/ui/components/audio/audio-graphql/hooks/useToggleVoice';
import { SET_AWAY } from '/imports/ui/components/user-list/user-list-content/user-participants/user-list-participants/user-actions/mutations';
import useWhoIsUnmuted from '/imports/ui/core/hooks/useWhoIsUnmuted';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import Auth from '/imports/ui/services/auth';
import { SetAwayStatusCommandArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/user-status/types';
import { UserStatusEnum } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/user-status/enums';

const PluginUserStatusUiCommandsHandler = () => {
  const [setAway] = useMutation(SET_AWAY);
  const { data: unmutedUsers } = useWhoIsUnmuted();
  const { data: currentUserData } = useCurrentUser((user) => ({
    away: user.away,
  }));
  const voiceToggle = useToggleVoice();
  const muted = !unmutedUsers[Auth.userID as string];

  const handleUserStatusAway = (event: CustomEvent<SetAwayStatusCommandArguments>) => {
    const { away: targetAwayStatus } = event.detail;
    const { away: currentAwayStatus } = currentUserData as { away: boolean };

    if (targetAwayStatus === currentAwayStatus) return;
    muteAway(muted, currentAwayStatus, voiceToggle);
    setAway({
      variables: {
        away: targetAwayStatus,
      },
    });
  };

  useEffect(() => {
    // add event listener only when the subscription for
    // current user information is valid
    if (!currentUserData) return () => {};
    window.addEventListener(
      UserStatusEnum.SET_AWAY_STATUS,
      handleUserStatusAway as EventListener,
    );

    return () => {
      window.removeEventListener(
        UserStatusEnum.SET_AWAY_STATUS,
        handleUserStatusAway as EventListener,
      );
    };
  }, [unmutedUsers, currentUserData]);
  return null;
};

export default PluginUserStatusUiCommandsHandler;
