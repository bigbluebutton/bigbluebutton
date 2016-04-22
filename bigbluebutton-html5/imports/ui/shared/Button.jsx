import React from 'react';
import { EmojisSVG } from '../whiteboard/EmojisSVG.jsx';

export let Button = React.createClass({
  componentDidMount() {
    return $('button[rel=tooltip]').tooltip();
  },

  hasGotUnreadMail(userId) {
    let chats, i, j, len, len1, tabs;
    chats = getInSession('chats');
    if (chats !== void 0) {
      if (userId === 'all_chats') {
        for (i = 0, len = chats.length; i < len; i++) {
          tabs = chats[i];
          if (tabs.gotMail === true) {
            return true;
          }
        }
      } else if (userId === 'PUBLIC_CHAT') {
        for (j = 0, len1 = chats.length; j < len1; j++) {
          tabs = chats[j];
          if (tabs.userId === userId && tabs.gotMail === true) {
            return true;
          }
        }
      }
    }

    return false;
  },

  getNumberOfUnreadMessages(userId) {
    let chat, chats, i, len;
    if (userId === 'all_chats') {
      return;
    } else {
      chats = getInSession('chats');
      if (chats !== void 0) {
        for (i = 0, len = chats.length; i < len; i++) {
          chat = chats[i];
          if (chat.userId === userId && chat.gotMail) {
            if (chat.number > 9) {
              return '9+';
            } else {
              return chat.number;
            }
          }
        }
      }
    }
  },

  getNotificationClass(userId) {
    if (userId === 'all_chats') {
      return 'unreadChat';
    }

    if (userId === 'PUBLIC_CHAT') {
      return 'unreadChatNumber';
    }
  },

  processNotification(notification) {
    let _className, _number;
    if (this.hasGotUnreadMail(notification)) {
      _className = this.getNotificationClass(notification);
      _number = this.getNumberOfUnreadMessages(notification);
      return (
        <div className={_className}>
          {_number}
        </div>
      );
    }
  },

  render() {
    return (
      <button onClick={this.props.onClick} type="submit" id={this.props.id} className={'btn' + this.props.btn_class} rel={this.props.rel} data-placement={this.props.data_placement} title={this.props.title} style={this.props.style}>
      {this.props.notification ? this.processNotification(this.props.notification) : null }
      {this.props.i_class ?
        <i className={this.props.i_class}></i>
      : null }

      {this.props.label ?
        <span>{this.props.label}</span>
      : null }      
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                {this.props.span ?
        <span></span>
      : null }
      {this.props.emoji ?
        <EmojisSVG emoji={ this.props.emoji } size="50"/>
      : null}
    </button>
    );
  },
});
