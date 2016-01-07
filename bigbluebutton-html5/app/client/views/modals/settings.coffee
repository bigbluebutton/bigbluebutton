Template.settingsModal.helpers
  getBBBSettingsInfo: ->
    info = getBuildInformation()
    result = "(c) #{info.copyrightYear} BigBlueButton Inc. [build #{info.html5ClientBuild}] - For more information visit #{info.link}"

Template.logoutModal.events
  "click #yes": -> userLogout(BBB.getMeetingId(), BBB.getMyUserId())
  "click #no": -> $("#logoutModal").foundation('reveal', 'close')
  "click .logoutButton": -> $(".tooltip").hide()

Template.settingsAudio.events
  "click #exitAudio": -> exitVoiceCall()

  "click .joinAudioButton": (event) -> $("#settingsModal").foundation('reveal', 'close')

  "click #joinListenOnly": (event) ->
    joinVoiceCall @, {
        listenOnly: true
    }

  "click #joinMicrophone": (event) ->
    joinVoiceCall @, {
        joinAudio: true
    }

  "click #hangupVerto": (event) -> exitVoiceCall()

Template.settingsModal.events
  "click #closeSettings": -> $("#settingsModal").foundation('reveal', 'close');

Template.optionsFontSize.events
  "click #decreaseFontSize": (event) ->
    if getInSession("messageFontSize") is 8 # min
      $('#decreaseFontSize').disabled = true
      $('#decreaseFontSize').removeClass('icon fi-minus')
      $('#decreaseFontSize').html('MIN')
    else
      setInSession "messageFontSize", getInSession("messageFontSize") - 2
      adjustChatInputHeight()
      setTimeout(scrollChatDown, 0)
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
      adjustChatInputHeight()
      setTimeout(scrollChatDown, 0)

      if $('#decreaseFontSize').html() is 'MIN'
        $('#decreaseFontSize').html('')
        $('#decreaseFontSize').addClass('icon fi-minus')
