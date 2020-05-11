import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedTime, defineMessages, injectIntl } from 'react-intl';
import _ from 'lodash';
import Auth from '/imports/ui/services/auth';
import UserAvatar from '/imports/ui/components/user-avatar/component';
import Message from './message/component';

import { styles } from './styles';
import BreakoutService from '/imports/ui/components/channels/service.js';
import { meetingIsBreakout } from '/imports/ui/components/app/service';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const propTypes = {
  user: PropTypes.shape({
    color: PropTypes.string,
    isModerator: PropTypes.bool,
    isOnline: PropTypes.bool,
    name: PropTypes.string,
  }),
  messages: PropTypes.arrayOf(Object).isRequired,
  time: PropTypes.number.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  scrollArea: PropTypes.instanceOf(Element),
  chatAreaId: PropTypes.string.isRequired,
  handleReadMessage: PropTypes.func.isRequired,
  lastReadMessageTime: PropTypes.number,
};

const defaultProps = {
  user: null,
  scrollArea: null,
  lastReadMessageTime: 0,
};

const intlMessages = defineMessages({
  offline: {
    id: 'app.chat.offline',
    description: 'Offline',
  },
});

class MessageListItem extends Component {
  shouldComponentUpdate(nextProps) {
    const {
      scrollArea,
      messages,
      user,
    } = this.props;

    const {
      scrollArea: nextScrollArea,
      messages: nextMessages,
      user: nextUser,
    } = nextProps;

    if (!scrollArea && nextScrollArea) return true;

    const hasNewMessage = messages.length !== nextMessages.length;
    const hasUserChanged = user && nextUser
      && (user.isModerator !== nextUser.isModerator || user.isOnline !== nextUser.isOnline);

    return hasNewMessage || hasUserChanged;
  }

  renderSystemMessage() {
    const {
      messages,
      chatAreaId,
      handleReadMessage,
    } = this.props;

    return (
      <div>
        {messages.map(message => (
          message.text !== ''
            ? (
              <Message
                className={(message.id ? styles.systemMessage : null)}
                key={_.uniqueId('id-')}
                text={message.text}
                time={message.time}
                chatAreaId={chatAreaId}
                handleReadMessage={handleReadMessage}
              />
            ) : null
        ))}
      </div>
    );
  }

  render() {
    const {
      user,
      messages,
      time,
      chatAreaId,
      currentUserId,
      lastReadMessageTime,
      handleReadMessage,
      scrollArea,
      intl,
    } = this.props;

    const { findBreakouts } = BreakoutService;
    const breakouts = findBreakouts();
    let breakoutRoomName;
    if(breakouts,user)
    {
      breakouts.map(
        (breakout) => {
        breakout.users.map(
          (buser) => {
          if (buser.userId == user.userId)
           {
            breakoutRoomName = breakout.name;
          }
        });
      }
      );
    
    }
   
    const isBreakOutMeeting = meetingIsBreakout();
    
   
    const dateTime = new Date(time);

    const regEx = /<a[^>]+>/i;

    if (!user) {
      return this.renderSystemMessage();
    }

    return (
      <div>
        {' '}
        {(user.userId !== Auth.userID) ? (
          <div className={styles.item}>
            <div className={styles.wrapperleft} ref={(ref) => { this.item = ref; }}>
              <div className={styles.avatarWrapper}>
                <UserAvatar
                  className={styles.avatar}
                  color={user.color}
                  moderator={user.isModerator}
                >
                  {user.name.toLowerCase().slice(0, 2)}
                </UserAvatar>
              </div>
              <div className={styles.contentleft}>
                <div className={styles.metaleft}>
                  <div className={user.isOnline ? styles.name : styles.logout}>
                    <span className={styles.name}>{user.name}</span>
                       {
                       (breakoutRoomName  && !user.isModerator) ? 
                       <span>{breakoutRoomName}</span> 
                       :
                       ( user.isModerator && !isBreakOutMeeting ? <span>(moderator)</span> : null)
                       }
                    {user.isOnline
                      ? null
                      : (
                        <span className={styles.offline}>
                          {`(${intl.formatMessage(intlMessages.offline)})`}
                        </span>
                      )}
                  </div>
                  <time className={styles.timeleft} dateTime={dateTime}>
                    <FormattedTime value={dateTime} />
                  </time>
                </div>
                <div className={styles.messagesleft}>
                  {messages.map(message => (
                    <Message
                      className={styles.messageleft}
                      key={message.id}
                      text={message.text}
                      time={message.time}
                      file={message.fileData}
                      userid={user.userId}
                      color={message.color}
                      chatAreaId={chatAreaId}
                      lastReadMessageTime={lastReadMessageTime}
                      handleReadMessage={handleReadMessage}
                      scrollArea={scrollArea}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
          : (
            <div className={styles.item}>
              <div className={styles.wrapperright} ref={(ref) => { this.item = ref; }}>
                <div className={styles.contentright}>
                  <div className={styles.metaright}>
                    <time className={styles.timeright} dateTime={dateTime}>
                      <FormattedTime value={dateTime} />
                    </time>
                  </div>
                  <div className={styles.messagesright}>
                    {messages.map(message => (
                      <Message
                        className={styles.messageright}
                        key={message.id}
                        text={message.text}
                        time={message.time}
                        file={message.fileData}
                        userid={user.userId}
                        color={message.color}
                        chatAreaId={chatAreaId}
                        lastReadMessageTime={lastReadMessageTime}
                        handleReadMessage={handleReadMessage}
                        scrollArea={scrollArea}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
}
      </div>
    );
  }
}

MessageListItem.propTypes = propTypes;
MessageListItem.defaultProps = defaultProps;

export default injectIntl(MessageListItem);
