/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import Styled from './styles';
import browserInfo from '/imports/utils/browserInfo';
import { defineMessages, useIntl } from 'react-intl';
import Icon from '/imports/ui/components/common/icon/icon-ts/component';
import { User } from '/imports/ui/Types/user';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';
import Auth from '/imports/ui/services/auth';
import { LockSettings } from '/imports/ui/Types/meeting';
import { uniqueId } from '/imports/utils/string-utils';
import { Emoji } from 'emoji-mart';
import normalizeEmojiName from './service';
import { convertRemToPixels } from '/imports/utils/dom-utils';
import { isReactionsEnabled } from '/imports/ui/services/features';

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

// @ts-ignore - temporary, while meteor exists in the project
const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;
// @ts-ignore - temporary, while meteor exists in the project
const LABEL = Meteor.settings.public.user.label;

const { isChrome, isFirefox, isEdge } = browserInfo;

interface UserListItemProps {
  user: User;
  lockSettings: LockSettings;
}

const UserListItem: React.FC<UserListItemProps> = ({ user, lockSettings }) => {
  const intl = useIntl();
  const voiceUser = user.voice;
  const subs = [
    (user.role === ROLE_MODERATOR && LABEL.moderator) && intl.formatMessage(messages.moderator),
    (user.guest && LABEL.guest) && intl.formatMessage(messages.guest),
    (user.mobile && LABEL.mobile) && intl.formatMessage(messages.mobile),
    (user.locked && lockSettings.hasActiveLockSetting && !user.isModerator) && (
      <span key={uniqueId('lock-')}>
        <Icon iconName="lock" />
        &nbsp;
        {intl.formatMessage(messages.locked)}
      </span>
    ),
    user.lastBreakoutRoom?.currentlyInRoom && (
      <span key={uniqueId('breakout-')}>
        <Icon iconName="rooms" />
        &nbsp;
        {user.lastBreakoutRoom?.shortName
          ? intl.formatMessage(messages.breakoutRoom, { 0: user.lastBreakoutRoom?.sequence })
          : user.lastBreakoutRoom?.shortName}
      </span>
    ),
    (user.cameras.length > 0 && LABEL.sharingWebcam) && (
      <span key={uniqueId('breakout-')}>
        {user.pinned === true
          ? <Icon iconName="pin-video_on" />
          : <Icon iconName="video" />}
        &nbsp;
        {intl.formatMessage(messages.sharingWebcam)}
      </span>
    ),
  ].filter(Boolean);

  const reactionsEnabled = isReactionsEnabled();

  const userAvatarFiltered = user.avatar;

  const getIconUser = () => {
    const emojiSize = convertRemToPixels(1.3);

    if (user.raiseHand === true) {
      return reactionsEnabled
        ? <Emoji key="hand" emoji="hand" native size={emojiSize} />
        : <Icon iconName={normalizeEmojiName('raiseHand')} />;
    } if (user.away === true) {
      return reactionsEnabled
        ? <Emoji key="away" emoji="clock7" native size={emojiSize} />
        : <Icon iconName={normalizeEmojiName('away')} />;
    } if (user.emoji !== 'none' && user.emoji !== 'notAway') {
      return <Icon iconName={normalizeEmojiName(user.emoji)} />;
    } if (user.name && userAvatarFiltered.length === 0) {
      return user.name.toLowerCase().slice(0, 2);
    } return '';
  };

  const iconUser = getIconUser();

  const avatarContent = user.lastBreakoutRoom?.currentlyInRoom ? user.lastBreakoutRoom?.sequence : iconUser;

  return (
    <Styled.UserItemContents data-test={(user.userId === Auth.userID) ? 'userListItemCurrent' : 'userListItem'}>
      <Styled.Avatar
        data-test={user.role === ROLE_MODERATOR ? 'moderatorAvatar' : 'viewerAvatar'}
        data-test-presenter={user.presenter ? '' : undefined}
        data-test-avatar="userAvatar"
        moderator={user.role === ROLE_MODERATOR}
        presenter={user.presenter}
        talking={voiceUser?.talking}
        muted={voiceUser?.muted}
        listenOnly={voiceUser?.listenOnly}
        voice={voiceUser?.joined}
        noVoice={!voiceUser?.joined}
        color={user.color}
        whiteboardAccess={user?.presPagesWritable?.length > 0}
        animations
        emoji={user.emoji !== 'none'}
        avatar={userAvatarFiltered}
        isChrome={isChrome}
        isFirefox={isFirefox}
        isEdge={isEdge}
      >
        {avatarContent}
      </Styled.Avatar>
      <Styled.UserNameContainer>
        <Styled.UserName>
          <TooltipContainer title={user.name}>
            <span>{user.name}</span>
          </TooltipContainer>
          &nbsp;
          {(user.userId === Auth.userID) ? `(${intl.formatMessage(messages.you)})` : ''}
        </Styled.UserName>
        <Styled.UserNameSub data-test={user.mobile ? 'mobileUser' : undefined}>
          {subs.length ? subs.reduce((prev, curr) => [prev, ' | ', curr]) : null}
        </Styled.UserNameSub>
      </Styled.UserNameContainer>
    </Styled.UserItemContents>
  );
};

export default UserListItem;
