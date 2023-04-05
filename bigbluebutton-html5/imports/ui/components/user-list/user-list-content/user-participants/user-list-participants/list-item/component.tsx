import React from 'react';
import Styled from './styles';
import browserInfo from '/imports/utils/browserInfo';
import { injectIntl, defineMessages, useIntl } from 'react-intl';
import { EMOJI_STATUSES } from '/imports/utils/statuses';
import { User } from '/imports/ui/Types/user';


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
});

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;
const LABEL = Meteor.settings.public.user.label;

const { isChrome, isFirefox, isEdge } = browserInfo;

const Icon: React.FC<{ iconName: string, content?: string }> = ({ iconName, content }) => {
  return (
    <span>
      <span className={`icon-bbb-${iconName}`}></span>
      &nbsp;
      {content || null}
    </span>
  );
}

interface UserListItemProps {
  user: User;
}

const UserListItem: React.FC<UserListItemProps> = ({ user }) => {
  const intl = useIntl()
  const voiceUser = user.microphones[0];
  const subs = [
    (user.cameras.length > 0 && LABEL.sharingWebcam) && intl.formatMessage(messages.sharingWebcam),
    // TODO: make locked work
    (user.role === ROLE_MODERATOR && LABEL.moderator) && intl.formatMessage(messages.moderator),
    (user.guest && LABEL.guest) && intl.formatMessage(messages.guest),
    (user.mobile && LABEL.mobile) && intl.formatMessage(messages.mobile),
    user.breakoutRoom?.online && (<Icon iconName='rooms' content={user.breakoutRoom?.shortName} />),
  ].filter(Boolean);

  const iconUser = user.emoji !== 'none'
    ? (<Icon iconName={`${EMOJI_STATUSES[user.emoji]}`} />)
    : user.name.toLowerCase().slice(0, 2);

   const avatarContent = user.breakoutRoom?.online ? user.breakoutRoom?.sequence : iconUser

  return <Styled.UserItemContents>
  <Styled.Avatar
    moderator={user.role === ROLE_MODERATOR}
    presenter={user.presenter}
    talking={voiceUser?.talking}
    muted={voiceUser?.muted}
    listenOnly={voiceUser?.listenOnly}
    voice={voiceUser?.joined}
    noVoice={!voiceUser?.joined}
    color={user.color}
    whiteboardAccess={user.whiteboardAccess}
    animations={true} 
    emoji={user.emoji !== 'none'}
    avatar={user.avatar || ''}
    isChrome={isChrome}
    isFirefox={isFirefox}
    isEdge={isEdge}
  >
    {avatarContent}
  </Styled.Avatar>
  <Styled.UserNameContainer>
    <Styled.UserName>
      {user.name}
    </Styled.UserName>
    <Styled.UserNameSub>
      {subs.length ? subs.reduce((prev, curr) => [prev, ' | ', curr]) : null}
    </Styled.UserNameSub>
  </Styled.UserNameContainer>
  </Styled.UserItemContents>;
};

export default UserListItem;