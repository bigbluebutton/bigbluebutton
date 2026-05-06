/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { ReactNode, useContext, useMemo } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import Auth from '/imports/ui/services/auth';
import {
  UserListItemAdditionalInformationType,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/user-list-item-additional-information/enums';
import Styled from './styles';
import Icon from '/imports/ui/components/common/icon/icon-ts/component';
import { useIsChatEnabled, useIsPrivateChatEnabled } from '/imports/ui/services/features';
import { useWhoIsTalking } from '/imports/ui/core/hooks/useWhoIsTalking';
import { useWhoIsUnmuted } from '/imports/ui/core/hooks/useWhoIsUnmuted';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import { layoutDispatch } from '/imports/ui/components/layout/context';
import UserItemToolbar from './user-item-toolbar/component';
import ConfirmationModal from '/imports/ui/components/common/modal/confirmation/component';
import AvatarContent from './avatar-content/component';
import {
  generateActionsPermissions,
  hasWhiteboardWriteAccess,
  isMe,
  createToolbarOptions,
} from './service';
import { UserListItemProps } from './types';
import UserNameWithSubs from './user-name-with-subs/component';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import { useUserOperations } from '/imports/ui/components/user-list/hooks/useUserOperations';

const getIconComponent = (icon: PluginSdk.PluginIconType): React.ReactNode => {
  if (typeof icon === 'string') {
    return <Icon iconName={icon} />;
  }
  if (icon && typeof icon === 'object' && 'iconName' in icon) {
    return <Icon iconName={icon.iconName} />;
  }
  if (icon && typeof icon === 'object' && 'svgContent' in icon) {
    const svgContent = icon.svgContent as ReactNode;
    return <Styled.SvgContentUserListIcon>{svgContent}</Styled.SvgContentUserListIcon>;
  }
  return null;
};

const renderUserListItemIconsFromPlugin = (
  userItemsFromPlugin: PluginSdk.UserListItemAdditionalInformationInterface[],
) => userItemsFromPlugin.filter(
  (item) => item.type === UserListItemAdditionalInformationType.ICON,
).map((item: PluginSdk.UserListItemAdditionalInformationInterface) => {
  const itemToRender = item as PluginSdk.UserListItemIcon;
  return (
    <Styled.IconRightContainer
      key={item.id}
      data-test={itemToRender.dataTest}
    >
      {getIconComponent(itemToRender.icon)}
    </Styled.IconRightContainer>
  );
});

const UserListItem: React.FC<UserListItemProps> = ({
  currentUserIsModerator,
  currentUserIsPresenter,
  currentUserLocked,
  user,
  lockSettings,
  usersPolicies,
  isBreakout,
  index,
  setOpenUserAction,
  open,
  pageId,
  type,
}) => {
  const { intl, operations, modal } = useUserOperations(user.userId);

  const { pluginsExtensibleAreasAggregatedState } = useContext(PluginsContext);
  const userItemsFromPlugin = useMemo(() => {
    if (!pluginsExtensibleAreasAggregatedState.userListItemAdditionalInformation) {
      return [] as PluginSdk.UserListItemAdditionalInformationInterface[];
    }
    return pluginsExtensibleAreasAggregatedState.userListItemAdditionalInformation.filter((item) => {
      const userListItem = item as PluginSdk.UserListItemAdditionalInformationInterface;
      return userListItem.userId === user.userId;
    }) as PluginSdk.UserListItemAdditionalInformationInterface[];
  }, [pluginsExtensibleAreasAggregatedState.userListItemAdditionalInformation, user.userId]);

  const userListDropdownItems = useMemo(() => {
    if (!pluginsExtensibleAreasAggregatedState.userListDropdownItems) {
      return [] as PluginSdk.UserListDropdownInterface[];
    }
    return pluginsExtensibleAreasAggregatedState.userListDropdownItems;
  }, [pluginsExtensibleAreasAggregatedState.userListDropdownItems]);

  const layoutContextDispatch = layoutDispatch();
  const isChatEnabled = useIsChatEnabled();
  const isPrivateChatEnabled = useIsPrivateChatEnabled();

  const whiteboardAccess = hasWhiteboardWriteAccess(user);
  const { data: talkingUsers } = useWhoIsTalking();
  const { data: unmutedUsers } = useWhoIsUnmuted();
  const isMuted = !unmutedUsers[user.userId];
  const isTalking = talkingUsers[user.userId];

  const actionsPermitions = generateActionsPermissions(
    user,
    currentUserIsPresenter,
    currentUserIsModerator,
    currentUserLocked,
    lockSettings,
    usersPolicies,
    isBreakout,
    isMuted,
    isChatEnabled,
    isPrivateChatEnabled,
    type,
  );

  const {
    pinnedToolbarOptions,
    otherToolbarOptions,
  } = createToolbarOptions(
    intl,
    user,
    isMuted,
    whiteboardAccess,
    actionsPermitions,
    lockSettings,
    pageId,
    layoutContextDispatch,
    operations.chatCreateWithUser,
    operations.toggleVoiceFunction,
    operations.userSetWhiteboardWriteAccess,
    operations.setPresenter,
    operations.setRole,
    operations.setLocked,
    operations.userEjectCameras,
    () => modal.setIsOpen(true),
    operations.setRaiseHand,
  );

  const userAvatarFiltered = (user.away === true || (user.reactionEmoji && user.reactionEmoji !== 'none')) ? '' : user.avatar;

  const Settings = getSettingsSingletonInstance();
  const animations = Settings?.application?.animations;

  return (
    <Styled.UserItemContents
      id={`user-index-${index}`}
      tabIndex={-1}
      data-test={(isMe(user.userId)) ? 'userListItemCurrent' : 'userListItem'}
      role="listitem"
      aria-label={user.name}
      data-id={user.extId}
    >
      {modal.isOpen && (
        <ConfirmationModal
          intl={intl}
          title={intl.formatMessage({ id: 'app.userList.menu.removeConfirmation.label' }, { userName: user.name })}
          checkboxMessageId="app.userlist.menu.removeConfirmation.desc"
          confirmParam={user.userId}
          onConfirm={operations.removeUser}
          confirmButtonDataTest="removeUserConfirmation"
          onRequestClose={() => modal.setIsOpen(false)}
          priority="low"
          setIsOpen={modal.setIsOpen}
          isOpen={modal.isOpen}
        />
      )}
      <Styled.Avatar
        data-test-presenter={user.presenter ? '' : undefined}
        data-test-avatar="userAvatar"
        moderator={user.isModerator}
        presenter={user.presenter}
        talking={isTalking}
        muted={isMuted}
        color={user.color}
        animations={animations}
        avatar={userAvatarFiltered}
        you={user.userId === Auth.userID}
      >
        {/* @ts-ignore */}
        <AvatarContent
          data-test={user.isModerator ? 'moderatorAvatar' : 'viewerAvatar'}
          user={user}
        />
      </Styled.Avatar>
      <UserNameWithSubs
        subjectUser={user}
        lockSettings={lockSettings}
        intl={intl}
        userItemsFromPlugin={userItemsFromPlugin}
      />
      {renderUserListItemIconsFromPlugin(userItemsFromPlugin)}
      <UserItemToolbar
        subjectUser={user}
        pinnedToolbarOptions={pinnedToolbarOptions}
        otherToolbarOptions={otherToolbarOptions}
        setOpenUserAction={setOpenUserAction}
        open={open}
        userListDropdownItems={userListDropdownItems}
      />
    </Styled.UserItemContents>
  );
};

export default React.memo(UserListItem);
