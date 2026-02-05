import { useMutation } from '@apollo/client';
import { useIntl } from 'react-intl';
import { User, RaisedHandUser } from '/imports/ui/Types/user';
import { isVoiceOnlyUser } from '/imports/ui/components/user-list/user-list-participants/list-item/service';
import useToggleVoice from '/imports/ui/components/audio/audio-graphql/hooks/useToggleVoice';
import { CHAT_CREATE_WITH_USER, SET_ROLE, USER_EJECT_CAMERAS } from '/imports/ui/components/user-list/user-list-participants/list-item/mutations';
import { USER_SET_WHITEBOARD_WRITE_ACCESS } from '/imports/ui/components/presentation/mutations';
import {
  EJECT_FROM_MEETING,
  EJECT_FROM_VOICE,
  SET_LOCKED,
  SET_PRESENTER,
  SET_RAISE_HAND,
} from '/imports/ui/core/graphql/mutations/userMutations';
import { useModalRegistration } from '/imports/ui/core/singletons/modalController';

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

export const useUserOperations = (userId?: string) => {
  const intl = useIntl();
  const toggleVoiceFunction = useToggleVoice();
  const [chatCreateWithUser] = useMutation(CHAT_CREATE_WITH_USER);

  const {
    isOpen: isConfirmationModalOpen,
    open: openConfirmationModal,
    close: closeConfirmationModal,
  } = useModalRegistration({
    id: `removeUserConfirmation-${userId || 'default'}`,
    priority: 'low',
  });

  const setIsConfirmationModalOpen = (isOpen: boolean) => {
    if (isOpen) {
      openConfirmationModal();
    } else {
      closeConfirmationModal();
    }
  };

  const [userSetWhiteboardWriteAccess] = useMutation(USER_SET_WHITEBOARD_WRITE_ACCESS);
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
      userSetWhiteboardWriteAccess,
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
