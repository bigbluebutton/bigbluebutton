import { useState } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { useIntl } from 'react-intl';
import { User, RaisedHandUser } from '/imports/ui/Types/user';
import { isVoiceOnlyUser } from '/imports/ui/components/user-list/user-list-participants/list-item/service';
import useToggleVoice from '/imports/ui/components/audio/audio-graphql/hooks/useToggleVoice';
import { CHAT_CREATE_WITH_USER, SET_ROLE, USER_EJECT_CAMERAS } from '/imports/ui/components/user-list/user-list-participants/list-item/mutations';
import { PRESENTATION_SET_WRITERS } from '/imports/ui/components/presentation/mutations';
import { CURRENT_PAGE_WRITERS_QUERY } from '/imports/ui/components/whiteboard/queries';
import {
  EJECT_FROM_MEETING,
  EJECT_FROM_VOICE,
  SET_LOCKED,
  SET_PRESENTER,
  SET_RAISE_HAND,
} from '/imports/ui/core/graphql/mutations/userMutations';

export const mapRaisedHandToUser = (raisedHandUser: RaisedHandUser): User => {
  const voiceData = raisedHandUser.voice || {};

  const user: User = {
    ...raisedHandUser,

    avatar: '',
    cameras: [],
    whiteboardWriteAccess: raisedHandUser.whiteboardWriteAccess ?? false,
    presenter: raisedHandUser.presenter ?? false,
    isModerator: raisedHandUser.isModerator ?? false,
    raiseHand: raisedHandUser.raiseHand ?? true,
    raiseHandTime: raisedHandUser.raiseHandTime,
    locked: false,
    voice: {
      joined: voiceData.joined ?? false,
      talking: false,
      muted: false,
      listenOnly: voiceData.listenOnly ?? false,
      listenOnlyInputDevice: undefined,
      deafened: voiceData.deafened ?? false,
    },

    emoji: 'none',
    loggedOut: false,
    guest: false,
    authed: true,
    waitingForAcceptance: false,
  } as User;

  return user;
};

export const useUserOperations = (pageId: string) => {
  const intl = useIntl();
  const toggleVoiceFunction = useToggleVoice();
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState<boolean>(false);
  const [chatCreateWithUser] = useMutation(CHAT_CREATE_WITH_USER);

  const [getWriters] = useLazyQuery(CURRENT_PAGE_WRITERS_QUERY, {
    variables: { pageId },
    fetchPolicy: 'no-cache',
  });

  const [presentationSetWriters] = useMutation(PRESENTATION_SET_WRITERS);
  const [setPresenter] = useMutation(SET_PRESENTER);
  const [setRole] = useMutation(SET_ROLE);
  const [setLocked] = useMutation(SET_LOCKED);
  const [userEjectCameras] = useMutation(USER_EJECT_CAMERAS);
  const [ejectFromMeeting] = useMutation(EJECT_FROM_MEETING);
  const [ejectFromVoice] = useMutation(EJECT_FROM_VOICE);
  const [setRaiseHand] = useMutation(SET_RAISE_HAND);
  const removeUser = (userId: string, banUser: boolean) => {
    if (isVoiceOnlyUser(userId)) {
      ejectFromVoice({ variables: { userId, banUser } });
    } else {
      ejectFromMeeting({ variables: { userId, banUser } });
    }
  };

  return {
    intl,
    operations: {
      chatCreateWithUser,
      toggleVoiceFunction,
      getWriters,
      presentationSetWriters,
      setPresenter,
      setRole,
      setLocked,
      userEjectCameras,
      setRaiseHand,
      removeUser,
    },
    modal: {
      isOpen: isConfirmationModalOpen,
      setIsOpen: setIsConfirmationModalOpen,
    },
  };
};
