/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useContext } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import {
  UserListItemAdditionalInformationType,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/user-list-item-additional-information/enums';
import Styled from './styles';
import browserInfo from '/imports/utils/browserInfo';
import { defineMessages, useIntl } from 'react-intl';
import Icon from '/imports/ui/components/common/icon/icon-ts/component';
import { User } from '/imports/ui/Types/user';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';
import Auth from '/imports/ui/services/auth';
import { LockSettings } from '/imports/ui/Types/meeting';
import { uniqueId } from '/imports/utils/string-utils';
import { convertRemToPixels } from '/imports/utils/dom-utils';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import { useIsReactionsEnabled } from '/imports/ui/services/features';
import useWhoIsTalking from '/imports/ui/core/hooks/useWhoIsTalking';
import useWhoIsUnmuted from '/imports/ui/core/hooks/useWhoIsUnmuted';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';

const messages = defineMessages({
  moderator: {
    id: 'app.userList.moderator',
    description: 'Text for identifying moderator user',
  },
  mobile: {
    id: 'app.userList.mobile',
    description: 'Text for identifying mobile user',
  },
  guest: {
    id: 'app.userList.guest',
    description: 'Text for identifying guest user',
  },
  sharingWebcam: {
    id: 'app.userList.sharingWebcam',
    description: 'Text for identifying who is sharing webcam',
  },
  locked: {
    id: 'app.userList.locked',
    description: 'Text for identifying locked user',
  },
  breakoutRoom: {
    id: 'app.createBreakoutRoom.room',
    description: 'breakout room',
  },
  you: {
    id: 'app.userList.you',
    description: 'Text for identifying your user',
  },
});

const { isChrome, isFirefox, isEdge } = browserInfo;

interface EmojiProps {
  emoji: { native: string; };
  native: string;
  size: number;
}
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'em-emoji': EmojiProps;
    }
  }
}

interface UserListItemProps {
  user: User;
  lockSettings: LockSettings;
  index: number;
}

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

const Emoji: React.FC<EmojiProps> = ({ emoji, native, size }) => (
  <em-emoji emoji={emoji} native={native} size={size} />
);

const UserListItem: React.FC<UserListItemProps> = ({ user, lockSettings, index }) => {
  const { pluginsExtensibleAreasAggregatedState } = useContext(PluginsContext);
  let userItemsFromPlugin = [] as PluginSdk.UserListItemAdditionalInformationInterface[];
  if (pluginsExtensibleAreasAggregatedState.userListItemAdditionalInformation) {
    userItemsFromPlugin = pluginsExtensibleAreasAggregatedState.userListItemAdditionalInformation.filter((item) => {
      const userListItem = item as PluginSdk.UserListItemAdditionalInformationInterface;
      return userListItem.userId === user.userId;
    }) as PluginSdk.UserListItemAdditionalInformationInterface[];
  }

  const intl = useIntl();
  const { data: talkingUsers } = useWhoIsTalking();
  const { data: unmutedUsers } = useWhoIsUnmuted();
  const voiceUser = {
    ...user.voice,
    talking: talkingUsers[user.userId],
    muted: !unmutedUsers[user.userId],
  };
  const subs = [];

  const LABEL = window.meetingClientSettings.public.user.label;

  if (user.isModerator && LABEL.moderator) {
    subs.push(intl.formatMessage(messages.moderator));
  }
  if (user.guest && LABEL.guest) {
    subs.push(intl.formatMessage(messages.guest));
  }
  if (user.mobile && LABEL.mobile) {
    subs.push(intl.formatMessage(messages.mobile));
  }
  if ((user.locked || user.userLockSettings?.disablePublicChat)
      && (user.userLockSettings?.disablePublicChat || lockSettings?.hasActiveLockSetting) && !user.isModerator) {
    subs.push(
      <span key={uniqueId('lock-')}>
        <Icon iconName="lock" />
        &nbsp;
        {intl.formatMessage(messages.locked)}
      </span>,
    );
  }
  if (user.lastBreakoutRoom?.currentlyInRoom) {
    subs.push(
      <span key={uniqueId('breakout-')}>
        <Icon iconName="rooms" />
        &nbsp;
        {user.lastBreakoutRoom?.shortName
          ? intl.formatMessage(messages.breakoutRoom, { roomNumber: user.lastBreakoutRoom?.sequence })
          : user.lastBreakoutRoom?.shortName}
      </span>,
    );
  }
  if (user?.cameras?.length > 0 && LABEL.sharingWebcam) {
    subs.push(
      <span key={uniqueId('breakout-')}>
        {user.pinned === true
          ? <Icon iconName="pin-video_on" />
          : <Icon iconName="video" />}
        &nbsp;
        {intl.formatMessage(messages.sharingWebcam)}
      </span>,
    );
  }
  userItemsFromPlugin.filter(
    (item) => item.type === UserListItemAdditionalInformationType.LABEL,
  ).forEach((item) => {
    const itemToRender = item as PluginSdk.UserListItemLabel;
    subs.push(
      <span key={itemToRender.id}>
        { itemToRender.icon
          && <Styled.UserAdditionalInformationIcon iconName={itemToRender.icon} /> }
        {itemToRender.label}
      </span>,
    );
  });

  const reactionsEnabled = useIsReactionsEnabled();

  const userAvatarFiltered = (user.raiseHand === true || user.away === true || (user.reactionEmoji && user.reactionEmoji !== 'none')) ? '' : user.avatar;

  const emojiIcons = [
    {
      id: 'hand',
      native: '✋',
    },
    {
      id: 'clock7',
      native: '⏰',
    },
  ];

  const getIconUser = () => {
    const emojiSize = convertRemToPixels(1.3);

    if (user.isDialIn) {
      return <Icon iconName="volume_level_2" />;
    }
    if (user.raiseHand === true) {
      return reactionsEnabled
        ? <Emoji key={emojiIcons[0].id} emoji={emojiIcons[0]} native={emojiIcons[0].native} size={emojiSize} />
        : <Icon iconName="hand" />;
    }
    if (user.away === true) {
      return reactionsEnabled
        ? <Emoji key="away" emoji={emojiIcons[1]} native={emojiIcons[1].native} size={emojiSize} />
        : <Icon iconName="time" />;
    }
    if (user.reactionEmoji && user.reactionEmoji !== 'none') {
      return user.reactionEmoji;
    }
    if (user.name && userAvatarFiltered.length === 0) {
      return user.name.toLowerCase().slice(0, 2);
    }
    return '';
  };

  const avatarContent = user.lastBreakoutRoom?.currentlyInRoom && userAvatarFiltered.length === 0
    ? user.lastBreakoutRoom?.sequence
    : getIconUser();

  const hasWhiteboardAccess = user?.presPagesWritable?.some((page) => page.isCurrentPage);

  function addSeparator(elements: (string | JSX.Element)[]) {
    const modifiedElements: (string | JSX.Element)[] = [];

    elements.forEach((element, index) => {
      modifiedElements.push(element);
      if (index !== elements.length - 1) {
        modifiedElements.push(<span key={uniqueId('separator-')}> | </span>);
      }
    });
    return modifiedElements;
  }

  const Settings = getSettingsSingletonInstance();
  const animations = Settings?.application?.animations;

  return (
    <Styled.UserItemContents id={`user-index-${index}`} tabIndex={-1} data-test={(user.userId === Auth.userID) ? 'userListItemCurrent' : 'userListItem'} role="listitem">
      <Styled.Avatar
        data-test={user.isModerator ? 'moderatorAvatar' : 'viewerAvatar'}
        data-test-presenter={user.presenter ? '' : undefined}
        data-test-avatar="userAvatar"
        moderator={user.isModerator}
        presenter={user.presenter}
        talking={voiceUser?.talking}
        muted={voiceUser?.muted}
        listenOnly={voiceUser?.listenOnly || voiceUser?.listenOnlyInputDevice}
        voice={voiceUser?.joined && !voiceUser?.deafened}
        noVoice={!voiceUser?.joined || voiceUser?.deafened}
        color={user.color}
        whiteboardAccess={hasWhiteboardAccess}
        animations={animations}
        avatar={userAvatarFiltered}
        isChrome={isChrome}
        isFirefox={isFirefox}
        isEdge={isEdge}
      >
        {avatarContent}
      </Styled.Avatar>
      <Styled.UserNameContainer>
        <Styled.UserName>
          <TooltipContainer title={user.name} role="button">
            <span>{user.name}</span>
          </TooltipContainer>
          &nbsp;
          {(user.userId === Auth.userID) ? `(${intl.formatMessage(messages.you)})` : ''}
        </Styled.UserName>
        <Styled.UserNameSub data-test={user.mobile ? 'mobileUser' : undefined}>
          {subs.length ? addSeparator(subs) : null}
        </Styled.UserNameSub>
      </Styled.UserNameContainer>
      {renderUserListItemIconsFromPlugin(userItemsFromPlugin)}
    </Styled.UserItemContents>
  );
};

export default UserListItem;
