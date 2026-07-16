import React, { ReactNode, useContext, useMemo } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { defineMessages, IntlShape } from 'react-intl';
import {
  UserListItemAdditionalInformationType,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/user-list-item-additional-information/enums';
import { User, RaisedHandUser } from '/imports/ui/Types/user';
import { LockSettings, UsersPolicies } from '/imports/ui/Types/meeting';
import Icon from '/imports/ui/components/common/icon/icon-ts/component';
import { useIsChatEnabled, useIsPrivateChatEnabled, useIsReactionsEnabled } from '/imports/ui/services/features';
import useWhoIsUnmuted from '/imports/ui/core/hooks/useWhoIsUnmuted';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import { layoutDispatch } from '/imports/ui/components/layout/context';
import UserItemToolbar from '/imports/ui/components/user-list/user-list-participants/list-item/user-item-toolbar/component';
import ConfirmationModal from '/imports/ui/components/common/modal/confirmation/component';
import {
  generateActionsPermissions,
  hasWhiteboardWriteAccess,
  isMe,
  createToolbarOptions,
} from '/imports/ui/components/user-list/user-list-participants/list-item/service';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import Styled from '/imports/ui/components/user-list/user-list-participants/list-item/styles';
import UserNameStyled from '/imports/ui/components/user-list/user-list-participants/list-item/user-name-with-subs/styles';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';
import { convertRemToPixels } from '/imports/utils/dom-utils';
import RaisedHandsStyles from '../styles';
import { useUserOperations, mapRaisedHandToUser } from '/imports/ui/components/user-list/hooks/useUserOperations';

const intlMessages = defineMessages({
  presenter: {
    id: 'app.userList.presenter',
    description: 'Text for identifying presenter user',
  },
  moderator: {
    id: 'app.userList.moderator',
    description: 'Text for identifying moderator user',
  },
  you: {
    id: 'app.userList.you',
    description: 'Text for identifying your user',
  },
});

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

const RaisedHandUserName: React.FC<{ user: User; intl: IntlShape }> = ({ user, intl }) => {
  const subs = [];

  if (user.presenter) {
    subs.push(intl.formatMessage(intlMessages.presenter));
  }
  if (user.isModerator) {
    subs.push(intl.formatMessage(intlMessages.moderator));
  }

  const subsWithSeparators = subs.map((sub, index) => (
    <React.Fragment key={sub}>
      {sub}
      {index < subs.length - 1 && <span> | </span>}
    </React.Fragment>
  ));

  return (
    <UserNameStyled.UserNameContainer>
      <UserNameStyled.UserName>
        <TooltipContainer title={user.name}>
          {isMe(user.userId) ? (
            <UserNameStyled.StrongName>
              {user.name}
              &nbsp;
              {`(${intl.formatMessage(intlMessages.you)})`}
            </UserNameStyled.StrongName>
          ) : (
            <UserNameStyled.RegularName>{user.name}</UserNameStyled.RegularName>
          )}
        </TooltipContainer>
      </UserNameStyled.UserName>

      {subs.length > 0 && (
        <UserNameStyled.UserNameSub>
          {subsWithSeparators}
        </UserNameStyled.UserNameSub>
      )}
    </UserNameStyled.UserNameContainer>
  );
};

const renderUserListItemIconsFromPlugin = (
  userItemsFromPlugin: PluginSdk.UserListItemAdditionalInformationInterface[],
) => userItemsFromPlugin.filter(
  (item) => item.type === UserListItemAdditionalInformationType.ICON,
).map((item: PluginSdk.UserListItemAdditionalInformationInterface) => {
  const itemToRender = item as PluginSdk.UserListItemIcon;
  return (
    <Styled.IconRightContainer key={item.id} data-test={itemToRender.dataTest}>
      {getIconComponent(itemToRender.icon)}
    </Styled.IconRightContainer>
  );
});

interface RaisedHandsListItemProps {
  user: RaisedHandUser;
  currentUser: User;
  lockSettings: LockSettings;
  usersPolicies: UsersPolicies;
  isBreakout: boolean;
  pageId: string;
  index: number;
  openUserAction: string | null;
  setOpenUserAction: React.Dispatch<React.SetStateAction<string | null>>;
}

const RaisedHandsListItem: React.FC<RaisedHandsListItemProps> = ({
  user: raisedHandUser,
  currentUser,
  lockSettings,
  usersPolicies,
  isBreakout,
  pageId,
  index,
  openUserAction,
  setOpenUserAction,
}) => {
  const user = useMemo(() => mapRaisedHandToUser(raisedHandUser), [raisedHandUser]);
  const { intl, operations, modal } = useUserOperations(user.userId);

  const isReactionsEnabled = useIsReactionsEnabled();
  const emojiSize = convertRemToPixels(2.2);
  const handEmoji = { id: 'hand', native: '✋' };
  const type = 'raised-hand';

  const { pluginsExtensibleAreasAggregatedState } = useContext(PluginsContext);
  let userItemsFromPlugin = [] as PluginSdk.UserListItemAdditionalInformationInterface[];
  if (pluginsExtensibleAreasAggregatedState.userListItemAdditionalInformation) {
    userItemsFromPlugin = pluginsExtensibleAreasAggregatedState.userListItemAdditionalInformation.filter((item) => {
      const userListItem = item as PluginSdk.UserListItemAdditionalInformationInterface;
      return userListItem.userId === user.userId;
    }) as PluginSdk.UserListItemAdditionalInformationInterface[];
  }

  let userListDropdownItems = [] as PluginSdk.UserListDropdownInterface[];
  if (pluginsExtensibleAreasAggregatedState.userListDropdownItems) {
    userListDropdownItems = [
      ...pluginsExtensibleAreasAggregatedState.userListDropdownItems,
    ];
  }

  const layoutContextDispatch = layoutDispatch();
  const isChatEnabled = useIsChatEnabled();
  const isPrivateChatEnabled = useIsPrivateChatEnabled();

  const whiteboardAccess = hasWhiteboardWriteAccess(user);

  const { data: unmutedUsers } = useWhoIsUnmuted();
  const isMuted = !unmutedUsers[user.userId];

  const actionsPermitions = generateActionsPermissions(
    user,
    currentUser?.presenter ?? false,
    currentUser?.isModerator ?? false,
    currentUser?.locked ?? false,
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

  const Settings = getSettingsSingletonInstance();
  const animations = Settings?.application?.animations;

  return (
    <Styled.UserItemContents
      id={`raised-user-${index}`}
      tabIndex={-1}
      data-test="raisedHandsListItem"
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

      <Styled.RaiseHandAvatar
        data-test="raisedHandAvatar"
        moderator={user.isModerator}
        presenter={user.presenter}
        talking={false}
        color={user.color}
        animations={animations}
        avatar=""
      >
        <RaisedHandsStyles.IndexBadge data-test="raisedHandRank">
          {index + 1}
        </RaisedHandsStyles.IndexBadge>

        <RaisedHandsStyles.EmojiContainer>
          {isReactionsEnabled ? (
            // @ts-ignore
            <em-emoji emoji={handEmoji} native={handEmoji.native} size={emojiSize} />
          ) : (
            <Icon iconName="hand" />
          )}
        </RaisedHandsStyles.EmojiContainer>
      </Styled.RaiseHandAvatar>

      <RaisedHandUserName user={user} intl={intl} />

      {renderUserListItemIconsFromPlugin(userItemsFromPlugin)}

      <UserItemToolbar
        subjectUser={user}
        pinnedToolbarOptions={pinnedToolbarOptions}
        otherToolbarOptions={otherToolbarOptions}
        setOpenUserAction={setOpenUserAction}
        open={user.userId === openUserAction}
        userListDropdownItems={userListDropdownItems}
      />
    </Styled.UserItemContents>
  );
};

export default React.memo(RaisedHandsListItem);
