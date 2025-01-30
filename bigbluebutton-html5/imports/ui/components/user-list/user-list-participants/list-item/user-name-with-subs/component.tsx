import React from 'react';
import { defineMessages } from 'react-intl';
import { UserListItemAdditionalInformationType } from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/user-list-item-additional-information/enums';
import { UserListItemLabel } from 'bigbluebutton-html-plugin-sdk';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';
import Icon from '/imports/ui/components/common/icon/icon-ts/component';
import { isMe } from '../service';
import Styled from './styles';
import { UserNameWithSubsProps } from './types';
import { uniqueId } from '/imports/utils/string-utils';

const intlMessages = defineMessages({
  presenter: {
    id: 'app.userList.presenter',
    description: 'Text for identifying presenter user',
  },
  moderator: {
    id: 'app.userList.moderator',
    description: 'Text for identifying moderator user',
  },
  guest: {
    id: 'app.userList.guest',
    description: 'Text for identifying guest user',
  },
  mobile: {
    id: 'app.userList.mobile',
    description: 'Text for identifying mobile user',
  },
  locked: {
    id: 'app.userList.locked',
    description: 'Text for identifying locked user',
  },
  breakoutRoom: {
    id: 'app.createBreakoutRoom.room',
    description: 'breakout room',
  },
  sharingWebcam: {
    id: 'app.userList.sharingWebcam',
    description: 'Text for identifying who is sharing webcam',
  },
  you: {
    id: 'app.userList.you',
    description: 'Text for identifying your user',
  },
});

const UserNameWithSubs: React.FC<UserNameWithSubsProps> = ({
  intl,
  subjectUser,
  lockSettings,
  userItemsFromPlugin,
}) => {
  const LABEL = window.meetingClientSettings.public.user.label;

  const subs = [];

  if (subjectUser.presenter && LABEL.presenter) {
    subs.push(intl.formatMessage(intlMessages.presenter));
  }
  if (subjectUser.isModerator && LABEL.moderator) {
    subs.push(intl.formatMessage(intlMessages.moderator));
  }
  if (subjectUser.guest && LABEL.guest) {
    subs.push(intl.formatMessage(intlMessages.guest));
  }
  if (subjectUser.mobile && LABEL.mobile) {
    subs.push(intl.formatMessage(intlMessages.mobile));
  }
  if ((subjectUser.locked || subjectUser.userLockSettings?.disablePublicChat)
      && (subjectUser.userLockSettings?.disablePublicChat || lockSettings?.hasActiveLockSetting)
      && !subjectUser.isModerator
  ) {
    subs.push(
      <span key={uniqueId('lock-')}>
        <Icon iconName="lock" />
        &nbsp;
        {intl.formatMessage(intlMessages.locked)}
      </span>,
    );
  }
  if (subjectUser.lastBreakoutRoom?.currentlyInRoom) {
    subs.push(
      <span key={uniqueId('breakout-')}>
        <Icon iconName="rooms" />
        &nbsp;
        {subjectUser.lastBreakoutRoom?.shortName
          ? intl.formatMessage(intlMessages.breakoutRoom, { 0: subjectUser.lastBreakoutRoom?.sequence })
          : subjectUser.lastBreakoutRoom?.shortName}
      </span>,
    );
  }
  if (subjectUser.cameras.length > 0 && LABEL.sharingWebcam) {
    subs.push(
      <span key={uniqueId('breakout-')}>
        {subjectUser.pinned === true
          ? <Icon iconName="pin-video_on" />
          : <Icon iconName="video" />}
        &nbsp;
        {intl.formatMessage(intlMessages.sharingWebcam)}
      </span>,
    );
  }

  userItemsFromPlugin.filter(
    (item) => item.type === UserListItemAdditionalInformationType.LABEL,
  ).forEach((item) => {
    const itemToRender = item as UserListItemLabel;
    subs.push(
      <span key={itemToRender.id}>
        { itemToRender.icon
          && <Styled.UserAdditionalInformationIcon iconName={itemToRender.icon} /> }
        {itemToRender.label}
      </span>,
    );
  });

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

  const subsWithSeparators = addSeparator(subs);

  return (
    <Styled.UserNameContainer>
      <Styled.UserName>
        <TooltipContainer title={subjectUser.name}>
          {isMe(subjectUser.userId) ? (
            <Styled.StrongName>{subjectUser.name} {`(${intl.formatMessage(intlMessages.you)})`}</Styled.StrongName>
          ) : (
            <Styled.RegularName>{subjectUser.name}</Styled.RegularName>
          )}
        </TooltipContainer>
      </Styled.UserName>
      <Styled.UserNameSub>
        {subsWithSeparators.length ? subsWithSeparators : null}
      </Styled.UserNameSub>
    </Styled.UserNameContainer>
  );
};

export default UserNameWithSubs;
