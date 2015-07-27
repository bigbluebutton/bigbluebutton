# Helper to load javascript libraries from the BBB server
loadLib = (libname) ->
  successCallback = ->

  retryMessageCallback = (param) ->
    #Meteor.log.info "Failed to load library", param
    console.log "Failed to load library", param

  Meteor.Loader.loadJs("http://#{window.location.hostname}/client/lib/#{libname}", successCallback, 10000).fail(retryMessageCallback)

# These settings can just be stored locally in session, created at start up
Meteor.startup ->
  # Load SIP libraries before the application starts
  loadLib('sip.js')
  loadLib('bbb_webrtc_bridge_sip.js')
  loadLib('bbblogger.js')

  @SessionAmplify = _.extend({}, Session,
    keys: _.object(_.map(amplify.store(), (value, key) ->
      [
        key
        JSON.stringify(value)
      ]
    ))
    set: (key, value) ->
      Session.set.apply this, arguments
      amplify.store key, value
      return
  )
#
Template.header.events
  "click .chatBarIcon": (event) ->
    $(".tooltip").hide()
    toggleChatbar()

  "click .hideNavbarIcon": (event) ->
    $(".tooltip").hide()
    toggleNavbar()

  "click .leaveAudioButton": (event) ->
    exitVoiceCall event

  "click .muteIcon": (event) ->
    $(".tooltip").hide()
    toggleMic @

  "click .hideNavbarIcon": (event) ->
    $(".tooltip").hide()
    toggleNavbar()

  "click .videoFeedIcon": (event) ->
    $(".tooltip").hide()
    toggleCam @

  "click .toggleUserlistButton": (event) ->
    if isLandscape()
      toggleUsersList()
    else
      if $('.sl-right-drawer').hasClass('sl-right-drawer-out')
        toggleRightDrawer()
        toggleRightArrowClockwise()
      else
        toggleShield()
      toggleLeftDrawer()
      toggleLeftArrowClockwise()

  "click .toggleMenuButton": (event) ->
    if $('.sl-left-drawer').hasClass('sl-left-drawer-out')
      toggleLeftDrawer()
      toggleLeftArrowClockwise()
    else
      toggleShield()
    toggleRightDrawer()
    toggleRightArrowClockwise()

Template.menu.events
  'click .slideButton': (event) ->
    toggleShield()
    toggleRightDrawer()
    toggleRightArrowClockwise()

  'click .toggleChatButton': (event) ->
    toggleChatbar()

Template.main.rendered = ->
  $("#dialog").dialog(
    modal: true
    draggable: false
    resizable: false
    autoOpen: false
    dialogClass: 'no-close logout-dialog'
    buttons: [
      {
        text: 'Yes'
        click: () ->
          userLogout BBB.getMeetingId(), getInSession("userId"), true
          $(this).dialog("close")
        class: 'btn btn-xs btn-primary active'
      }
      {
        text: 'No'
        click: () ->
          $(this).dialog("close")
          $(".tooltip").hide()
        class: 'btn btn-xs btn-default'
      }
    ]
    open: (event, ui) ->
      $('.ui-widget-overlay').bind 'click', () ->
        if isMobile()
          $("#dialog").dialog('close')
    position:
      my: 'right top'
      at: 'right bottom'
      of: '.signOutIcon'
  )

  Meteor.NotificationControl = new NotificationControl('notificationArea')
  $(document).foundation() # initialize foundation javascript

  $(window).resize( ->
    $('#dialog').dialog('close')
  )

  $('#shield').click () ->
    toggleSlidingMenu()

  if Meteor.config.app.autoJoinAudio
    onAudioJoinHelper()

Template.main.events
  'click .shield': (event) ->
    toggleShield()
    closeMenus()

  'click .settingsIcon': (event) ->
    setInSession("tempFontSize", getInSession("messageFontSize"))
    $("#settingsModal").foundation('reveal', 'open');

  'click .signOutIcon': (event) ->
    $('.signOutIcon').blur()
    $("#logoutModal").foundation('reveal', 'open');

Template.main.gestures
  'panstart #container': (event, template) ->
    if isPortraitMobile() and isPanHorizontal(event)
      setInSession 'panStarted', true
      if getInSession('panIsValid') and
      getInSession('initTransform') + event.deltaX >= 0 and
      getInSession('initTransform') + event.deltaX <= $('.left-drawer').width()
        $('.left-drawer').css('transform', 'translateX(' + (getInSession('initTransform') + event.deltaX) + 'px)')
  'panend #container': (event, template) ->
    if isPortraitMobile()
      setInSession 'panStarted', false
      if getInSession('panIsValid') and $('.left-drawer').css('transform') isnt 'none'
        if parseInt($('.left-drawer').css('transform').split(',')[4]) < $('.left-drawer').width() / 2
          $('.shield').removeClass('animatedShield')
          $('.shield').css('opacity', '')
          $('.left-drawer').removeClass('sl-left-drawer-out')
          $('.left-drawer').css('transform', '')
          $('.toggleUserlistButton').removeClass('sl-toggled-on')
          $('.shield').removeClass('darken') # in case it was opened by clicking a button
        else
          $('.left-drawer').css('transform', 'translateX(' + $('.left-drawer').width() + 'px)')
          $('.shield').css('opacity', 0.5)
          $('.left-drawer').addClass('sl-left-drawer-out')
          $('.left-drawer').css('transform', '')
          $('.toggleUserlistButton').addClass('sl-toggled-on')
      $('.left-drawer').addClass('sl-left-drawer')
      $('.sl-left-drawer').removeClass('left-drawer')
  'panright #container, panleft #container': (event, template) ->
    if isPortraitMobile() and isPanHorizontal(event)
      if !getInSession('panStarted') # panright/panleft is always triggered once right before panstart
        if event.type is 'panleft' or
        event.center.x <= $('#container').width() / 10
          setInSession 'panIsValid', true
        else
          setInSession 'panIsValid', false
        setInSession 'eventType', event.type
        if $('.sl-left-drawer').css('transform') isnt 'none' # menu is already transformed
          setInSession 'initTransform', parseInt($('.sl-left-drawer').css('transform').split(',')[4]) # translateX value
        else if $('.sl-left-drawer').hasClass('sl-left-drawer-out')
          setInSession 'initTransform', $('.sl-left-drawer').width()
        else
          setInSession 'initTransform', 0
        $('.sl-left-drawer').addClass('left-drawer')
        $('.left-drawer').removeClass('sl-left-drawer') # to prevent animations from Sled library
        $('.left-drawer').removeClass('sl-left-drawer-content-delay') # makes the menu content movable too
      if getInSession('panIsValid') and
      getInSession('initTransform') + event.deltaX >= 0 and
      getInSession('initTransform') + event.deltaX <= $('.left-drawer').width()
        $('.left-drawer').css('transform', 'translateX(' + (getInSession('initTransform') + event.deltaX) + 'px)')
        if !getInSession('panStarted')
          $('.shield').addClass('animatedShield')
        $('.shield').css('opacity', 0.5 * (getInSession('initTransform') + event.deltaX) / $('.left-drawer').width())

Template.makeButton.rendered = ->
  $('button[rel=tooltip]').tooltip()
