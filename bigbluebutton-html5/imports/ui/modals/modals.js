Template.settingsModal.helpers({
  getBBBSettingsInfo() {
    let info, result;
    info = getBuildInformation();
    return result = `(c) ${info.copyrightYear} BigBlueButton Inc. [build ${info.html5ClientBuild}] - For more information visit ${info.link}`;
  },
});

Template.logoutModal.events({
  'click #yes'() {
    return userLogout(getInSession('meetingId'), getInSession('userId'));
  },

  'click #no'() {
    return $('#logoutModal').foundation('reveal', 'close');
  },

  'click .logoutButton'() {
    return $('.tooltip').hide();
  },
});

Template.settingsAudio.events({
  'click #exitAudio'() {
    return exitVoiceCall();
  },

  'click .joinAudioButton'(event) {
    return $('#settingsModal').foundation('reveal', 'close');
  },

  'click #joinListenOnly'(event) {
    return joinVoiceCall(this, {
      isListenOnly: true,
    });
  },

  'click #joinMicrophone'(event) {
    return joinVoiceCall(this, {
      isListenOnly: false,
    });
  },
});

Template.settingsModal.events({
  'click #closeSettings'() {
    return $('#settingsModal').foundation('reveal', 'close');
  },
});

Template.optionsFontSize.events({
  'click #decreaseFontSize'(event) {
    if (getInSession('messageFontSize') === 8) { // min
      $('#decreaseFontSize').disabled = true;
      $('#decreaseFontSize').removeClass('icon fi-minus');
      return $('#decreaseFontSize').html('MIN');
    } else {
      setInSession('messageFontSize', getInSession('messageFontSize') - 2);
      adjustChatInputHeight();
      setTimeout(scrollChatDown, 0);
      if ($('#increaseFontSize').html() === 'MAX') {
        $('#increaseFontSize').html('');
        return $('#increaseFontSize').addClass('icon fi-plus');
      }
    }
  },

  'click #increaseFontSize'(event) {
    if (getInSession('messageFontSize') === 40) { // max
      $('#increaseFontSize').disabled = true;
      $('#increaseFontSize').removeClass('icon fi-plus');
      return $('#increaseFontSize').html('MAX');
    } else {
      setInSession('messageFontSize', getInSession('messageFontSize') + 2);
      adjustChatInputHeight();
      setTimeout(scrollChatDown, 0);
      if ($('#decreaseFontSize').html() === 'MIN') {
        $('#decreaseFontSize').html('');
        return $('#decreaseFontSize').addClass('icon fi-minus');
      }
    }
  },
});
