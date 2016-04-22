import React from 'react';
import { Button } from '../shared/Button.jsx';

export let PrivateChatToolBar = React.createClass({
  componentDidMount: function() {
    if(isLandscape() || isPortrait()) {
      return $("#newMessageInput").focus();
    }
  },

  handleClick: function() {
    console.log("I'm in the handleClick function");
    setInSession('inChatWith', 'PUBLIC_CHAT');
    return setInSession('chats', getInSession('chats').map(chat => {
      if(chat.userId === "PUBLIC_CHAT") {
        chat.gotMail = false;
        chat.number = 0;
      }
      return chat;
    }));
  },

  render(){
    return (
      <div className="privateChatTab">
        <Button onClick={this.handleClick} id="close" btn_class=" secondary tiny toPublic " i_class="ion-ios-arrow-left" rel="tooltip"
        data_placement="bottom" title="Back to public" label="Public" notification="PUBLIC_CHAT" />
        <div className="privateChatName">
          {this.props.privateChatName}
        </div>
      </div>
    );
  }
});
