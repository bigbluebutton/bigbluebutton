this.activateBreakLines = function(str) {
  let res;
  if(typeof str === 'string') {
    res = str.replace(new RegExp(CARRIAGE_RETURN, 'g'), BREAK_LINE);
    return res;
  }
};

this.detectUnreadChat = function() {
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
            populateNotifications(chatMessage);
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
};

this.getFormattedMessagesForChat = function() {
  let chattingWith;
  chattingWith = getInSession('inChatWith');
  if(chattingWith === 'PUBLIC_CHAT') {
    return Meteor.Chat.find({
      'message.chat_type': {
        $in: ["SYSTEM_MESSAGE", "PUBLIC_CHAT"]
      }
    }, {
      sort: {
        'message.from_time': 1
      }
    }).fetch();
  } else {
    return Meteor.Chat.find({
      'message.chat_type': 'PRIVATE_CHAT',
      $or: [
        {
          'message.to_userid': chattingWith
        }, {
          'message.from_userid': chattingWith
        }
      ]
    }).fetch();
  }
};

Handlebars.registerHelper("autoscroll", () => {
  let ref;
  $('#chatbody').scrollTop((ref = $('#chatbody')[0]) != null ? ref.scrollHeight : void 0);
  return false;
});

Handlebars.registerHelper("publicChatDisabled", () => {
  let presenter, publicChatIsDisabled, ref, ref1, ref2, userIsLocked;
  userIsLocked = (ref = Meteor.Users.findOne({
    userId: getInSession('userId')
  })) != null ? ref.user.locked : void 0;
  publicChatIsDisabled = (ref1 = Meteor.Meetings.findOne({})) != null ? ref1.roomLockSettings.disablePublicChat : void 0;
  presenter = (ref2 = Meteor.Users.findOne({
    userId: getInSession('userId')
  })) != null ? ref2.user.presenter : void 0;
  return userIsLocked && publicChatIsDisabled && !presenter;
});

Handlebars.registerHelper("privateChatDisabled", () => {
  let presenter, privateChatIsDisabled, ref, ref1, ref2, userIsLocked;
  userIsLocked = (ref = Meteor.Users.findOne({
    userId: getInSession('userId')
  })) != null ? ref.user.locked : void 0;
  privateChatIsDisabled = (ref1 = Meteor.Meetings.findOne({})) != null ? ref1.roomLockSettings.disablePrivateChat : void 0;
  presenter = (ref2 = Meteor.Users.findOne({
    userId: getInSession('userId')
  })) != null ? ref2.user.presenter : void 0;
  return userIsLocked && privateChatIsDisabled && !presenter;
});

Handlebars.registerHelper("inPrivateChat", () => {
  return (getInSession('inChatWith')) !== 'PUBLIC_CHAT';
});

this.sendMessage = function() {
  let chattingWith, color, message, ref, toUsername;
  message = linkify($('#newMessageInput').val());
  if(!((message != null ? message.length : void 0) > 0 && (/\S/.test(message)))) {
    return;
  }
  color = "0x000000";
  if((chattingWith = getInSession('inChatWith')) !== "PUBLIC_CHAT") {
    toUsername = (ref = Meteor.Users.findOne({
      userId: chattingWith
    })) != null ? ref.user.name : void 0;
    BBB.sendPrivateChatMessage(color, "en", message, chattingWith, toUsername);
  } else {
    BBB.sendPublicChatMessage(color, "en", message);
  }
  return $('#newMessageInput').val('');
};

Template.chatbar.helpers({
  getCombinedMessagesForChat() {
    let deleted, i, j, len, msgs;
    msgs = getFormattedMessagesForChat();
    len = msgs != null ? msgs.length : void 0;
    i = 0;
    while(i < len) {
      if(msgs[i].message.from_userid !== 'System') {
        j = i + 1;
        while(j < len) {
          deleted = false;
          if(msgs[j].message.from_userid !== 'System') {
            if((parseFloat(msgs[j].message.from_time) - parseFloat(msgs[i].message.from_time)) >= 60000) {
              break;
            }
            if(msgs[i].message.from_userid === msgs[j].message.from_userid) {
              msgs[i].message.message += `${CARRIAGE_RETURN}${msgs[j].message.message}`;
              msgs.splice(j, 1);
              deleted = true;
            } else {
              break;
            }
          } else {
            break;
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
  userExists() {
    if(getInSession('inChatWith') === "PUBLIC_CHAT") {
      return true;
    } else {
      return Meteor.Users.findOne({
        userId: getInSession('inChatWith')
      }) != null;
    }
  }
});

Template.chatbar.rendered = function() {
  return detectUnreadChat();
};

Template.chatbar.events({
  'click .toPublic'(event) {
    setInSession('inChatWith', 'PUBLIC_CHAT');
    return setInSession('chats', getInSession('chats').map(chat => {
      if(chat.userId === "PUBLIC_CHAT") {
        chat.gotMail = false;
        chat.number = 0;
      }
      return chat;
    }));
  }
});

Template.privateChatTab.rendered = function() {
  if(isLandscape() || isPortrait()) {
    return $("#newMessageInput").focus();
  }
};

Template.message.rendered = function() {
  let ref;
  $('#chatbody').scrollTop((ref = $('#chatbody')[0]) != null ? ref.scrollHeight : void 0);
  return false;
};

Template.chatInput.rendered = function() {
  return $('.panel-footer').resizable({
    handles: 'n',
    minHeight: 70,
    resize(event, ui) {
      let ref;
      if($('.panel-footer').css('top') === '0px') {
        $('.panel-footer').height(70);
      } else {
        $('.panel-footer').css('top', `${parseInt($('.panel-footer').css('top'))}${1}px`);
      }
      $('#chatbody').height($('#chat').height() - $('.panel-footer').height() - 45);
      return $('#chatbody').scrollTop((ref = $('#chatbody')[0]) != null ? ref.scrollHeight : void 0);
    },
    start(event, ui) {
      $('#newMessageInput').css('overflow', '');
      return $('.panel-footer').resizable('option', 'maxHeight', Math.max($('.panel-footer').height(), $('#chat').height() / 2));
    },
    stop(event, ui) {
      return setInSession('chatInputMinHeight', $('.panel-footer').height() + 1);
    }
  });
};

Template.chatInput.events({
  'click #sendMessageButton'(event) {
    $('#sendMessageButton').blur();
    sendMessage();
    return adjustChatInputHeight();
  },
  'keypress #newMessageInput'(event) {
    let key;
    key = event.charCode ? event.charCode : (event.keyCode ? event.keyCode : 0);
    if(event.shiftKey && (key === 13)) {
      event.preventDefault();
      document.getElementById("newMessageInput").value += CARRIAGE_RETURN;
      return;
    }
    if(key === 13) {
      event.preventDefault();
      sendMessage();
      $('#newMessageInput').val("");
      return false;
    }
  }
});

Template.chatInputControls.rendered = function() {
  return $('#newMessageInput').on('keydown paste cut', () => {
    return setTimeout(() => {
      return adjustChatInputHeight();
    }, 0);
  });
};

Template.message.helpers({
  sanitizeAndFormat(str) {
    let res;
    if(typeof str === 'string') {
      res = str.replace(/&/g, '&amp;').replace(/<(?![au\/])/g, '&lt;').replace(/\/([^au])>/g, '$1&gt;').replace(/([^=])"(?!>)/g, '$1&quot;');
      res = toClickable(res);
      return res = activateBreakLines(res);
    }
  },
  toClockTime(epochTime) {
    let dateObj, hours, local, minutes, offset;
    if(epochTime === null) {
      return "";
    }
    local = new Date();
    offset = local.getTimezoneOffset();
    epochTime = epochTime - offset * 60000;
    dateObj = new Date(epochTime);
    hours = dateObj.getUTCHours();
    minutes = dateObj.getUTCMinutes();
    if(minutes < 10) {
      minutes = `0${minutes}`;
    }
    return `${hours}:${minutes}`;
  }
});

this.toClickable = function(str) {
  let res;
  if(typeof str === 'string') {
    res = str.replace(/<a href='event:/gim, "<a target='_blank' href='");
    return res = res.replace(/<a href="event:/gim, '<a target="_blank" href="');
  }
};
