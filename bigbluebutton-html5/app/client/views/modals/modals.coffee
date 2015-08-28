Template.settingsModal.helpers
  getBBBSettingsInfo: ->
    info = getBuildInformation()
    result = "(c) #{info.copyrightYear} BigBlueButton Inc. [build #{info.html5ClientBuild}] - For more information visit #{info.link}"

Template.logoutModal.events
  "click #yes": -> userLogout(getInSession("meetingId"), getInSession("userId"))
  "click #no": -> $("#logoutModal").foundation('reveal', 'close')
  "click .logoutButton": -> $(".tooltip").hide()

Template.settingsAudio.events
  "click #exitAudio": -> exitVoiceCall()

  "click .joinAudioButton": (event) -> $("#settingsModal").foundation('reveal', 'close')

  "click #joinListenOnly": (event) -> joinVoiceCall @, isListenOnly: true

  "click #joinMicrophone": (event) -> joinVoiceCall @, isListenOnly: false

Template.settingsModal.events
  "click .closeSettings": -> setInSession "messageFontSize", getInSession("tempFontSize")
  "click #saveSettings": -> $("#settingsModal").foundation('reveal', 'close');
