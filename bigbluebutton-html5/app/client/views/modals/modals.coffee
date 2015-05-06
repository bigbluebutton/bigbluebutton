Template.settingsAudio.events
  "click #joinMicrophone": (event) ->
    introToAudio @, isListenOnly: false

  "click #joinListenOnly": (event) ->
    introToAudio @, isListenOnly: true

  "click #exitAudio": ->
    exitVoiceCall()

  "click #settingsButton": ->
    $('#settingsModal').foundation('reveal', 'close');

Template.bbbSettingsInfo.helpers
  getBBBSettingsInfo: ->
    info = getBuildInformation()
    result = "(c) #{info.copyrightYear} BigBlueButton Inc. [build #{info.bbbServerVersion} - #{info.dateOfBuild}] - For more information visit #{info.link}"
