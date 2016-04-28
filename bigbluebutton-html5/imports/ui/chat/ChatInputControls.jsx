import React from 'react';
import { Users, Meetings } from '/collections/collections';

export let ChatInputControls = React.createClass({
  //#TODO MessageFontSize dynamic change
  componentDidMount: function () {
    $('.panel-footer').resizable({
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

    $('#newMessageInput').on('keydown paste cut', () => {
      return setTimeout(() => {
        return this.adjustChatInputHeight();
      }, 0);
    });
  },

  sendMessage: function () {
    let chattingWith, color, message, ref, toUsername;
    message = linkify($('#newMessageInput').val()); // get the message from the input box
    if (!((message != null ? message.length : void 0) > 0 && (/\S/.test(message)))) { // check the message has content and it is not whitespace
      return; // do nothing if invalid message
    }

    color = '0x000000'; //"0x#{getInSession("messageColor")}"
    if ((chattingWith = getInSession('inChatWith')) !== 'PUBLIC_CHAT') {
      toUsername = (ref = Users.findOne({
        userId: chattingWith,
      })) != null ? ref.user.name : void 0;
      BBB.sendPrivateChatMessage(color, 'en', message, chattingWith, toUsername);
    } else {
      BBB.sendPublicChatMessage(color, 'en', message);
    }

    return $('#newMessageInput').val(''); // Clear message box
  },

  adjustChatInputHeight: function () {
    let projectedHeight, ref;
    if (isLandscape()) {
      $('#newMessageInput').css('height', 'auto');
      projectedHeight = $('#newMessageInput')[0].scrollHeight + 23;
      if (projectedHeight !== $('.panel-footer').height() && projectedHeight >= getInSession('chatInputMinHeight')) {
        $('#newMessageInput').css('overflow', 'hidden'); // prevents a scroll bar

        // resizes the chat input area
        $('.panel-footer').css('top', `${-(projectedHeight - 70)}px`);
        $('.panel-footer').css('height', `${projectedHeight}px`);

        $('#newMessageInput').height($('#newMessageInput')[0].scrollHeight);

        // resizes the chat messages container
        $('#chatbody').height($('#chat').height() - projectedHeight - 45);
        $('#chatbody').scrollTop((ref = $('#chatbody')[0]) != null ? ref.scrollHeight : void 0);
      }

      return $('#newMessageInput').css('height', '');
    } else if (isPortrait()) {
      $('.panel-footer').attr('style', '');
      $('#chatbody').attr('style', '');
      return $('#newMessageInput').attr('style', '');
    }
  },

  handleClick: function () {
    $('#sendMessageButton').blur();
    this.sendMessage();
    return this.adjustChatInputHeight();
  },

  // user pressed a button inside the chatbox
  keyPressedHandler: function (event) {
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
      this.sendMessage();
      $('#newMessageInput').val('');
      return false;
    }
  },

  publicChatDisabled: function () {
    let presenter, publicChatIsDisabled, ref, ref1, ref2, userIsLocked;
    userIsLocked = (ref = Users.findOne({
      userId: getInSession('userId'),
    })) != null ? ref.user.locked : void 0;
    publicChatIsDisabled = (ref1 = Meetings.findOne({})) != null ? ref1.roomLockSettings.disablePublicChat : void 0;
    presenter = (ref2 = Users.findOne({
      userId: getInSession('userId'),
    })) != null ? ref2.user.presenter : void 0;
    return userIsLocked && publicChatIsDisabled && !presenter;
  },

  privateChatDisabled: function () {
    let presenter, privateChatIsDisabled, ref, ref1, ref2, userIsLocked;
    userIsLocked = (ref = Users.findOne({
      userId: getInSession('userId'),
    })) != null ? ref.user.locked : void 0;
    privateChatIsDisabled = (ref1 = Meetings.findOne({})) != null ? ref1.roomLockSettings.disablePrivateChat : void 0;
    presenter = (ref2 = Users.findOne({
      userId: getInSession('userId'),
    })) != null ? ref2.user.presenter : void 0;
    return userIsLocked && privateChatIsDisabled && !presenter;
  },

  getInputControls: function () {
    if (this.props.inPrivateChat && this.privateChatDisabled() || !this.props.inPrivateChat && this.publicChatDisabled()) {
      return (
          <textarea id="newMessageInput" className="disabledChat" style={this.props.messageFontSize()} placeholder="Private chat is temporarily locked (disabled)" rel="tooltip"
          data-placement="top" title="Private chat is temporarily locked" disabled></textarea>
        );
    } else {
      return (
          <div className="button-group radius">
            <textarea onKeyPress={this.keyPressedHandler} id="newMessageInput" rel="tooltip" data-placement="top" title="Write a new message"></textarea>
            <button onClick={this.handleClick} type="submit" id="sendMessageButton" className="button radius" rel="tooltip" data-placement="top">Send</button>
          </div>
      );
    }
  },

  render() {
    return (
      <div id="chatInput" className="chat-input-wrapper">	
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                { this.getInputControls() }
      </div>
    );
  },
});
