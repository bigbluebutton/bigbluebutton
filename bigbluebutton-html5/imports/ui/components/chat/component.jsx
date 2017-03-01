import React, { Component } from 'react';
import { Link } from 'react-router';
import styles from './styles';

import MessageForm from './message-form/component';
import MessageList from './message-list/component';
import Icon from '../icon/component';
import Storage from '/imports/ui/services/storage/session';

const ELEMENT_ID = 'chat-messages';

export default class Chat extends Component {
  constructor(props) {
    super(props);
    this.closeChat = this.closeChat.bind(this);
  }

  render() {
    const {
      chatID,
      chatName,
      title,
      messages,
      scrollPosition,
      hasUnreadMessages,
      lastReadMessageTime,
      isChatLocked,
      actions,
    } = this.props;

        return (
        <section className={styles.chat}>

          <header className={styles.header}>
            <Link to="/users">
              <Icon iconName="left-arrow"/> {title}
            </Link>

            {
              ( (this.props.chatID == "public") ?
                null :
                <Link to="/users">
                  <Icon iconName="close" onClick={this.closeChat} className={styles.closeIcon}/>
                </Link> )
            }
          </header>

        <MessageList
          chatId={chatID}
          messages={messages}
          id={ELEMENT_ID}
          scrollPosition={scrollPosition}
          hasUnreadMessages={hasUnreadMessages}
          handleScrollUpdate={actions.handleScrollUpdate}
          handleReadMessage={actions.handleReadMessage}
          lastReadMessageTime={lastReadMessageTime}
        />
        <MessageForm
          disabled={isChatLocked}
          chatAreaId={ELEMENT_ID}
          chatTitle={title}
          chatName={chatName}
          handleSendMessage={actions.handleSendMessage}
        />
      </section>
    );
  }

  closeChat() {

    const { chatID } = this.props;


    // chatInfo is for session, cnt is for checking same chatID in the session array
    let chatInfo, cnt = false;
    let obj = Storage.getItem("closedArray");
    let sessionArray = [];
    let updateFlag = false;

    // closed chat info for session
    chatInfo = {
      chatID: chatID,
      flag: false,
    };

    // session is null
    if (obj == null) {
      obj = [];
      obj.push(chatInfo);
    } else {
      sessionArray = obj;

      obj.forEach((sess, i) => {

        // find chatID in session which is the same with chatID from this.props
        if (sess.chatID === chatID) {
          cnt = true;

          // if flag in session is true, it is changed to false
          if(sess.flag) {
            sessionArray[i].flag = false;
            updateFlag = true;
          }
        }

      });

      // no same chatID in session
      if (!cnt) {
        obj.push(chatInfo);
      }
    }

    // if session occurs some changes, remove the previous session and create new
    if (updateFlag) {
      Storage.removeItem('closedArray');
      obj = sessionArray;
    }

    Storage.setItem("closedArray", obj);
  }
}
