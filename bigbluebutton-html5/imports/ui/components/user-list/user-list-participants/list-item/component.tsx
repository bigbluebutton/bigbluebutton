/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useContext, useState } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { useIntl } from 'react-intl';
import Auth from '/imports/ui/services/auth';
import {
  UserListItemAdditionalInformationType,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/user-list-item-additional-information/enums';
import { useLazyQuery, useMutation } from '@apollo/client';
import Styled from './styles';
import Icon from '/imports/ui/components/common/icon/icon-ts/component';
import { useIsChatEnabled, useIsPrivateChatEnabled } from '/imports/ui/services/features';
import useWhoIsTalking from '/imports/ui/core/hooks/useWhoIsTalking';
import useWhoIsUnmuted from '/imports/ui/core/hooks/useWhoIsUnmuted';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import { layoutDispatch } from '/imports/ui/components/layout/context';
import { CHAT_CREATE_WITH_USER, SET_ROLE, USER_EJECT_CAMERAS } from './mutations';
import UserItemToolbar from './user-item-toolbar/component';
import ConfirmationModal from '/imports/ui/components/common/modal/confirmation/component';
import AvatarContent from './avatar-content/component';
import {
  generateActionsPermissions,
  hasWhiteboardAccess,
  isMe,
  isVoiceOnlyUser,
  createToolbarOptions,
} from './service';
import { UserListItemProps } from './types';
import { PRESENTATION_SET_WRITERS } from '/imports/ui/components/presentation/mutations';
import { CURRENT_PAGE_WRITERS_QUERY } from '/imports/ui/components/whiteboard/queries';
import useToggleVoice from '/imports/ui/components/audio/audio-graphql/hooks/useToggleVoice';
import {
  EJECT_FROM_MEETING,
  EJECT_FROM_VOICE,
  SET_LOCKED,
  SET_PRESENTER,
} from '/imports/ui/core/graphql/mutations/userMutations';
import UserNameWithSubs from './user-name-with-subs/component';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';

const renderUserListItemIconsFromPlugin = (
  userItemsFromPlugin: PluginSdk.UserListItemAdditionalInformationInterface[],
) => userItemsFromPlugin.filter(
  (item) => item.type === UserListItemAdditionalInformationType.ICON,
).map((item: PluginSdk.UserListItemAdditionalInformationInterface) => {
  const itemToRender = item as PluginSdk.UserListItemIcon;
  return (
    <Styled.IconRightContainer
      key={item.id}
    >
      <Icon iconName={itemToRender.icon} />
    </Styled.IconRightContainer>
  );
});

const UserListItem: React.FC<UserListItemProps> = ({
  currentUser,
  user,
  lockSettings,
  usersPolicies,
  isBreakout,
  index,
  setOpenUserAction,
  open,
  pageId,
}) => {
  const { pluginsExtensibleAreasAggregatedState } = useContext(PluginsContext);
  let userItemsFromPlugin = [] as PluginSdk.UserListItemAdditionalInformationInterface[];
  if (pluginsExtensibleAreasAggregatedState.userListItemAdditionalInformation) {
    userItemsFromPlugin = pluginsExtensibleAreasAggregatedState.userListItemAdditionalInformation.filter((item) => {
      const userListItem = item as PluginSdk.UserListItemAdditionalInformationInterface;
      return userListItem.userId === user.userId;
    }) as PluginSdk.UserListItemAdditionalInformationInterface[];
  }

  const intl = useIntl();
  const layoutContextDispatch = layoutDispatch();
  const isChatEnabled = useIsChatEnabled();
  const isPrivateChatEnabled = useIsPrivateChatEnabled();
  const [chatCreateWithUser] = useMutation(CHAT_CREATE_WITH_USER);
  const toggleVoiceFunction = useToggleVoice();
  const [getWriters] = useLazyQuery(
    CURRENT_PAGE_WRITERS_QUERY,
    {
      variables: { pageId },
      fetchPolicy: 'no-cache',
    },
  );
  const [presentationSetWriters] = useMutation(PRESENTATION_SET_WRITERS);
  const [setPresenter] = useMutation(SET_PRESENTER);
  const [setRole] = useMutation(SET_ROLE);
  const [setLocked] = useMutation(SET_LOCKED);
  const [userEjectCameras] = useMutation(USER_EJECT_CAMERAS);
  const [ejectFromMeeting] = useMutation(EJECT_FROM_MEETING);
  const [ejectFromVoice] = useMutation(EJECT_FROM_VOICE);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState<boolean>(false);

  const whiteboardAccess = hasWhiteboardAccess(user);
  const { data: talkingUsers } = useWhoIsTalking();
  const { data: unmutedUsers } = useWhoIsUnmuted();
  const voiceUser = {
    ...user.voice,
    talking: talkingUsers[user.userId],
    muted: !unmutedUsers[user.userId],
  };
  const actionsPermitions = generateActionsPermissions(
    user,
    currentUser,
    lockSettings,
    usersPolicies,
    isBreakout,
    !unmutedUsers[user.userId],
    isChatEnabled,
    isPrivateChatEnabled,
  );
  const {
    pinnedToolbarOptions,
    otherToolbarOptions,
  } = createToolbarOptions(
    intl,
    user,
    whiteboardAccess,
    actionsPermitions,
    lockSettings,
    pageId,
    layoutContextDispatch,
    chatCreateWithUser,
    toggleVoiceFunction,
    getWriters,
    presentationSetWriters,
    setPresenter,
    setRole,
    setLocked,
    userEjectCameras,
    setIsConfirmationModalOpen,
  );

  const userAvatarFiltered = (user.raiseHand === true || user.away === true || (user.reactionEmoji && user.reactionEmoji !== 'none')) ? '' : user.avatar;

  const removeUser = (userId: string, banUser: boolean) => {
    if (isVoiceOnlyUser(user.userId)) {
      ejectFromVoice({
        variables: {
          userId,
          banUser,
        },
      });
    } else {
      ejectFromMeeting({
        variables: {
          userId,
          banUser,
        },
      });
    }
  };

  const Settings = getSettingsSingletonInstance();
  const animations = Settings?.application?.animations;

  return (
    <Styled.UserItemContents id={`user-index-${index}`} tabIndex={-1} data-test={(isMe(user.userId)) ? 'userListItemCurrent' : 'userListItem'}>
      {isConfirmationModalOpen && (
        <ConfirmationModal
          intl={intl}
          titleMessageId="app.userList.menu.removeConfirmation.label"
          titleMessageExtra={user.name}
          checkboxMessageId="app.userlist.menu.removeConfirmation.desc"
          confirmParam={user.userId}
          onConfirm={removeUser}
          confirmButtonDataTest="removeUserConfirmation"
          onRequestClose={() => setIsConfirmationModalOpen(false)}
          priority="low"
          setIsOpen={setIsConfirmationModalOpen}
          isOpen={isConfirmationModalOpen}
        />
      )}
      <Styled.Avatar
        data-test={user.isModerator ? 'moderatorAvatar' : 'viewerAvatar'}
        data-test-presenter={user.presenter ? '' : undefined}
        data-test-avatar="userAvatar"
        moderator={user.isModerator}
        presenter={user.presenter}
        talking={voiceUser?.talking}
        muted={voiceUser?.muted}
        color={user.color}
        animations={animations}
        avatar={userAvatarFiltered}
        you={user.userId === Auth.userID}
      >
        <AvatarContent
          user={user}
        />
      </Styled.Avatar>
      <UserNameWithSubs
        subjectUser={user}
        lockSettings={lockSettings}
        intl={intl}
        userItemsFromPlugin={userItemsFromPlugin}
      />
      <UserItemToolbar
        subjectUser={user}
        pinnedToolbarOptions={pinnedToolbarOptions}
        otherToolbarOptions={otherToolbarOptions}
        setOpenUserAction={setOpenUserAction}
        open={open}
      />
      {renderUserListItemIconsFromPlugin(userItemsFromPlugin)}
    </Styled.UserItemContents>
  );
};

export default React.memo(UserListItem);
