Template.bbbSettingsInfo.helpers
  getBBBSettingsInfo: ->
    info = getBuildInformation()
    result = "(c) #{info.copyrightYear} BigBlueButton Inc. [build #{info.html5ClientBuild}] - For more information visit #{info.link}"

Template.settingsAudio.events
  "click #joinMicrophone": (event) ->
    introToAudio @, isListenOnly: false

  "click #joinListenOnly": (event) ->
    introToAudio @, isListenOnly: true

  "click #exitAudio": ->
    exitVoiceCall()

  "click .joinAudioButton": (event) ->
    $("#settingsModal").foundation('reveal', 'close')

Template.settingsCloseButton.events
  "click #closeSettings": ->
    setInSession "messageFontSize", getInSession("tempFontSize")

  "click #saveSettings": ->
    $("#settingsModal").foundation('reveal', 'close');
