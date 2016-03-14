// --------------------------------------------------------------------------------------------------------------------
// If a function's last line is the statement false that represents the function returning false
// A function such as a click handler will continue along with the propogation and default behaivour if not stopped
// Returning false stops propogation/prevents default. You cannot always use the event object to call these methods
// Because most Meteor event handlers set the event object to the exact context of the event which does not
// allow you to simply call these methods.
// --------------------------------------------------------------------------------------------------------------------

this.activateBreakLines = function (str) {
  let res;
  if (typeof str === 'string') { // turn '\r' carriage return characters into '<br/>' break lines
    res = str.replace(new RegExp(CARRIAGE_RETURN, 'g'), BREAK_LINE);
    return res;
  }
};

this.detectUnreadChat = function () {
  //if the current tab is not the same as the tab we just published in
  return Meteor.Chat.find({}).observe({
    added: (_this => {
      return function (chatMessage) {
        let findDestinationTab;
        findDestinationTab = function () {
          let ref, ref1;
          if (((ref = chatMessage.message) != null ? ref.chat_type : void 0) === 'PUBLIC_CHAT') {
            return 'PUBLIC_CHAT';
          } else {
            return (ref1 = chatMessage.message) != null ? ref1.from_userid : void 0;
          }
        };

        return Tracker.autorun(comp => {
          let destinationTab, tabsTime;
          tabsTime = getInSession('userListRenderedTime');
          if ((tabsTime != null) && chatMessage.message.from_userid !== 'SYSTEM_MESSAGE' && chatMessage.message.from_time - tabsTime > 0) {
            populateNotifications(chatMessage); // check if we need to show a new notification
            destinationTab = findDestinationTab();
            if (destinationTab !== getInSession('inChatWith')) {
              setInSession('chats', getInSession('chats').map(tab => {
                if (tab.userId === destinationTab) {
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
    })(this),
  });
};

// This method returns all messages for the user. It looks at the session to determine whether the user is in
// private or public chat. If true is passed, messages returned are from before the user joined. Else, the messages are from after the user joined
this.getFormattedMessagesForChat = function () {
  let chattingWith;
  chattingWith = getInSession('inChatWith');
  if (chattingWith === 'PUBLIC_CHAT') { // find all public and system messages
    return Meteor.Chat.find({
      'message.chat_type': {
        $in: ['SYSTEM_MESSAGE', 'PUBLIC_CHAT'],
      },
    }, {
      sort: {
        'message.from_time': 1,
      },
    }).fetch();
  } else {
    return Meteor.Chat.find({
      'message.chat_type': 'PRIVATE_CHAT',
      $or: [
        {
          'message.to_userid': chattingWith,
        }, {
          'message.from_userid': chattingWith,
        },
      ],
    }).fetch();
  }
};

Handlebars.registerHelper('autoscroll', () => { // Scrolls the message container to the bottom. The number of pixels to scroll down is the height of the container
  let ref;
  $('#chatbody').scrollTop((ref = $('#chatbody')[0]) != null ? ref.scrollHeight : void 0);
  return false;
});

// true if the lock settings limit public chat and the current user is locked
Handlebars.registerHelper('publicChatDisabled', () => {
  let presenter, publicChatIsDisabled, ref, ref1, ref2, userIsLocked;
  userIsLocked = (ref = Meteor.Users.findOne({
    userId: getInSession('userId'),
  })) != null ? ref.user.locked : void 0;
  publicChatIsDisabled = (ref1 = Meteor.Meetings.findOne({})) != null ? ref1.roomLockSettings.disablePublicChat : void 0;
  presenter = (ref2 = Meteor.Users.findOne({
    userId: getInSession('userId'),
  })) != null ? ref2.user.presenter : void 0;
  return userIsLocked && publicChatIsDisabled && !presenter;
});

// true if the lock settings limit private chat and the current user is locked
Handlebars.registerHelper('privateChatDisabled', () => {
  let presenter, privateChatIsDisabled, ref, ref1, ref2, userIsLocked;
  userIsLocked = (ref = Meteor.Users.findOne({
    userId: getInSession('userId'),
  })) != null ? ref.user.locked : void 0;
  privateChatIsDisabled = (ref1 = Meteor.Meetings.findOne({})) != null ? ref1.roomLockSettings.disablePrivateChat : void 0;
  presenter = (ref2 = Meteor.Users.findOne({
    userId: getInSession('userId'),
  })) != null ? ref2.user.presenter : void 0;
  return userIsLocked && privateChatIsDisabled && !presenter;
});

// return whether the user's chat pane is open in Private chat
Handlebars.registerHelper('inPrivateChat', () => {
  return (getInSession('inChatWith')) !== 'PUBLIC_CHAT';
});

this.sendMessage = function () {
  let chattingWith, color, message, ref, toUsername;
  message = linkify($('#newMessageInput').val()); // get the message from the input box
  if (!((message != null ? message.length : void 0) > 0 && (/\S/.test(message)))) { // check the message has content and it is not whitespace
    return; // do nothing if invalid message
  }

  color = '0x000000'; //"0x#{getInSession("messageColor")}"
  if ((chattingWith = getInSession('inChatWith')) !== 'PUBLIC_CHAT') {
    toUsername = (ref = Meteor.Users.findOne({
      userId: chattingWith,
    })) != null ? ref.user.name : void 0;
    BBB.sendPrivateChatMessage(color, 'en', message, chattingWith, toUsername);
  } else {
    BBB.sendPublicChatMessage(color, 'en', message);
  }

  return $('#newMessageInput').val(''); // Clear message box
};

Template.chatbar.helpers({
  getCombinedMessagesForChat() {
    let deleted, i, j, len, msgs;
    msgs = getFormattedMessagesForChat();
    len = msgs != null ? msgs.length : void 0; // get length of messages
    i = 0;
    while (i < len) { // Must be a do while, for loop compiles and stores the length of array which can change inside the loop!
      if (msgs[i].message.from_userid !== 'System') { // skip system messages
        j = i + 1; // Start looking at messages right after the current one
        while (j < len) {
          deleted = false;
          if (msgs[j].message.from_userid !== 'System') { // Ignore system messages
            // Check if the time discrepancy between the two messages exceeds window for grouping
            if ((parseFloat(msgs[j].message.from_time) - parseFloat(msgs[i].message.from_time)) >= 60000) { // 60 seconds/1 minute
              break; // Messages are too far between, so them seperated and stop joining here
            }

            if (msgs[i].message.from_userid === msgs[j].message.from_userid) { // Both messages are from the same user
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
          if (!deleted) {
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
    if (getInSession('inChatWith') === 'PUBLIC_CHAT') {
      return true;
    } else {
      return Meteor.Users.findOne({
        userId: getInSession('inChatWith'),
      }) != null;
    }
  },
});

// When chatbar gets rendered, launch the auto-check for unread chat
Template.chatbar.rendered = function () {
  return detectUnreadChat();
};

// When "< Public" is clicked, go to public chat
Template.chatbar.events({
  'click .toPublic'(event) {
    setInSession('inChatWith', 'PUBLIC_CHAT');
    return setInSession('chats', getInSession('chats').map(chat => {
      if (chat.userId === 'PUBLIC_CHAT') {
        chat.gotMail = false;
        chat.number = 0;
      }

      return chat;
    }));
  },
});

Template.privateChatTab.rendered = function () {
  if (isLandscape() || isPortrait()) {
    return $('#newMessageInput').focus();
  }
};

// When message gets rendered, scroll to the bottom
Template.message.rendered = function () {
  let ref;
  $('#chatbody').scrollTop((ref = $('#chatbody')[0]) != null ? ref.scrollHeight : void 0);
  return false;
};

Template.chatInput.rendered = function () {
  return $('.panel-footer').resizable({
    handles: 'n',
    minHeight: 70,
    resize(event, ui) {
      let ref;
      if ($('.panel-footer').css('top') === '0px') {
        $('.panel-footer').height(70); // prevents the element from shrinking vertically for 1-2 px
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
    },
  });
};

Template.chatInput.events({
  'click #sendMessageButton'(event) {
    $('#sendMessageButton').blur();
    sendMessage();
    return adjustChatInputHeight();
  },

  'keypress #newMessageInput'(event) { // user pressed a button inside the chatbox
    let key;
    key = event.charCode ? event.charCode : (event.keyCode ? event.keyCode : 0);
    if (event.shiftKey && (key === 13)) {
      event.preventDefault();

      // append a '\r' carriage return character to the input box dropping the cursor to a new line
      document.getElementById('newMessageInput').value += CARRIAGE_RETURN; // Change newline character
      return;
    }

    if (key === 13) { // Check for pressing enter to submit message
      event.preventDefault();
      sendMessage();
      $('#newMessageInput').val('');
      return false;
    }
  },
});

Template.chatInputControls.rendered = function () {
  return $('#newMessageInput').on('keydown paste cut', () => {
    return setTimeout(() => {
      return adjustChatInputHeight();
    }, 0);
  });
};

Template.message.helpers({
  sanitizeAndFormat(str) {
    let res;
    if (typeof str === 'string') { // First, replace replace all tags with the ascii equivalent (excluding those involved in anchor tags)
      res = str.replace(/&/g, '&amp;').replace(/<(?![au\/])/g, '&lt;').replace(/\/([^au])>/g, '$1&gt;').replace(/([^=])"(?!>)/g, '$1&quot;');
      res = toClickable(res);
      return res = activateBreakLines(res);
    }
  },

  toClockTime(epochTime) {
    let dateObj, hours, local, minutes, offset;
    if (epochTime === null) {
      return '';
    }

    local = new Date();
    offset = local.getTimezoneOffset();
    epochTime = epochTime - offset * 60000; // 1 min = 60 s = 60,000 ms
    dateObj = new Date(epochTime);
    hours = dateObj.getUTCHours();
    minutes = dateObj.getUTCMinutes();
    if (minutes < 10) {
      minutes = `0${minutes}`;
    }

    return `${hours}:${minutes}`;
  },
});

// make links received from Flash client clickable in HTML
this.toClickable = function (str) {
  let res;
  if (typeof str === 'string') {
    res = str.replace(/<a href='event:/gim, "<a target='_blank' href='");
    return res = res.replace(/<a href="event:/gim, '<a target="_blank" href="');
  }
};
