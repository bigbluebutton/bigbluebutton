import React from 'react';

Chat = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData() {
    let chatMessages, privateChatName, chattingWith, user, messageFontSize, temp, user_exists;

    messageFontSize = { fontSize: getInSession("messageFontSize") + 'px' };
    chattingWith = getInSession('inChatWith');
    if(chattingWith === 'PUBLIC_CHAT') { // find all public and system messages
        chatMessages = Meteor.Chat.find({ 'message.chat_type': { $in: ["SYSTEM_MESSAGE", "PUBLIC_CHAT"] }}, 
          { sort: { 'message.from_time': 1 }}).fetch();
    } else {
      chatMessages = Meteor.Chat.find({ 'message.chat_type': 'PRIVATE_CHAT', $or: [{ 'message.to_userid': chattingWith }, 
        { 'message.from_userid': chattingWith }]}).fetch();
      }
    user = Meteor.Users.findOne({ userId: chattingWith });
    if(user != null) {
      privateChatName = user.user.name;
    }

    if(getInSession('inChatWith') === "PUBLIC_CHAT" || Meteor.Users.findOne({
        userId: getInSession('inChatWith')
      }) != null) {
      user_exists = true;
    } else {
      user_exists = false;
    }

    return {
      chatMessages: chatMessages,
      privateChatName: privateChatName,
      messageFontSize: messageFontSize,
      user_exists: user_exists
      };
  },

  detectUnreadChat: function() {
    //if the current tab is not the same as the tab we just published in
    return Meteor.Chat.find({}).observe({
      added: (_this => {
        return function(chatMessage) {
          let findDestinationTab;
          findDestinationTab = function() {
            let ref, ref1;
            if(((ref = chatMessage.message) != null ? ref.chat_type : void 0) === "PUBLIC_CHAT") {
              return "PUBLIC_CHAT";
            } else {
              return (ref1 = chatMessage.message) != null ? ref1.from_userid : void 0;
            }
          };
          return Tracker.autorun(comp => {
            let destinationTab, tabsTime;
            tabsTime = getInSession('userListRenderedTime');
            if((tabsTime != null) && chatMessage.message.from_userid !== "SYSTEM_MESSAGE" && chatMessage.message.from_time - tabsTime > 0) {
              populateNotifications(chatMessage); // check if we need to show a new notification
              destinationTab = findDestinationTab();
              if(destinationTab !== getInSession("inChatWith")) {
                setInSession('chats', getInSession('chats').map(tab => {
                  if(tab.userId === destinationTab) {
                    tab.gotMail = true;
                    tab.number++;
                  }
                  return tab;
                }));
              }
            }
            return comp.stop();
          });
        };
      })(this)
    });
  },

  componentDidMount: function(){
    this.detectUnreadChat();
  },

  getCombinedMessagesForChat(msgs) {
    let deleted, i, j, len;
    len = msgs != null ? msgs.length : void 0; // get length of messages
    i = 0;
    while(i < len) { // Must be a do while, for loop compiles and stores the length of array which can change inside the loop!
      if(msgs[i].message.from_userid !== 'System') { // skip system messages
        j = i + 1; // Start looking at messages right after the current one
        while(j < len) {
          deleted = false;
          if(msgs[j].message.from_userid !== 'System') { // Ignore system messages
            // Check if the time discrepancy between the two messages exceeds window for grouping
            if((parseFloat(msgs[j].message.from_time) - parseFloat(msgs[i].message.from_time)) >= 60000) { // 60 seconds/1 minute
              break; // Messages are too far between, so them seperated and stop joining here
            }
            if(msgs[i].message.from_userid === msgs[j].message.from_userid) { // Both messages are from the same user
              // insert a '\r' carriage return character between messages to put them on a new line
              msgs[i].message.message += `${CARRIAGE_RETURN}${msgs[j].message.message}`; // Combine the messages
              msgs.splice(j, 1); // Delete the message from the collection
              deleted = true;
            } else {
              break; // Messages are from different people, move on
            }
          } else {
            break; // This is the break point in the chat, don't merge
          }
          len = msgs.length;
          if(!deleted) {
            ++j;
          }
        }
      }
      ++i;
      len = msgs.length;
    }
    return msgs;
  },

  inPrivateChat(){
    return (getInSession('inChatWith') !== 'PUBLIC_CHAT');
  },

  render(){
    return (
      <div id="chat" className="component">
        <div className="chatBodyContainer">
          {this.inPrivateChat() ? 
            <PrivateChatToolBar inPrivateChat={this.inPrivateChat} privateChatName={this.data.privateChatName}/>
          : null }
          <div id="chatbody">
            <ul className="chat" style={this.data.messageFontSize}>
              {this.getCombinedMessagesForChat(this.data.chatMessages).map((message) =>
              <ChatMessage key={message._id} message={message} messageFontSize={this.data.messageFontSize}/>
              )}
              {this.data.user_exists ? null : <li>The user has left</li> }
            </ul>
          </div>
        </div>
        {this.data.user_exists ?
          <div className="panel-footer">
            <ChatInputControls inPrivateChat={this.inPrivateChat()}/>
          </div>
        : null }
      </div>
    );
  }
});
