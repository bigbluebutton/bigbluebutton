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

Template.optionsFontSize.events
  "click #decreaseFontSize": (event) ->
    if getInSession("messageFontSize") is 8 # min
      $('#decreaseFontSize').disabled = true
      $('#decreaseFontSize').removeClass('icon fi-minus')
      $('#decreaseFontSize').html('MIN')
    else
      setInSession "messageFontSize", getInSession("messageFontSize") - 2
      if $('#increaseFontSize').html() is 'MAX'
        $('#increaseFontSize').html('')
        $('#increaseFontSize').addClass('icon fi-plus')

  "click #increaseFontSize": (event) ->
    if getInSession("messageFontSize") is 40 # max
      $('#increaseFontSize').disabled = true
      $('#increaseFontSize').removeClass('icon fi-plus')
      $('#increaseFontSize').html('MAX')
    else
      setInSession "messageFontSize", getInSession("messageFontSize") + 2
      if $('#decreaseFontSize').html() is 'MIN'
        $('#decreaseFontSize').html('')
        $('#decreaseFontSize').addClass('icon fi-minus')
