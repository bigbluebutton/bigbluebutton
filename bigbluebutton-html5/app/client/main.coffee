# Helper to load javascript libraries from the BBB server
loadLib = (libname) ->
  successCallback = ->

  retryMessageCallback = (param) ->
    #Meteor.log.info "Failed to load library", param
    console.log "Failed to load library", param

  Meteor.Loader.loadJs("#{window.location.origin}/client/lib/#{libname}", successCallback, 10000).fail(retryMessageCallback)

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
  setInSession("gotChromeExtension", false)
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
    if isLandscape() or isLandscapeMobile()
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

  "click .btn": (event) ->
    $(".ui-tooltip").hide()

Template.menu.events
  'click .slideButton': (event) ->
    toggleShield()
    toggleRightDrawer()
    toggleRightArrowClockwise()
    $('.slideButton').blur()

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

  # keep track of the last orientation
  lastOrientationWasLandscape = isLandscape()
  $(window).resize( ->
    $('#dialog').dialog('close')

    # when the orientation switches call the handler
    if isLandscape() and not lastOrientationWasLandscape
        orientationBecameLandscape()
        lastOrientationWasLandscape = true
    else if isPortrait() and lastOrientationWasLandscape
        orientationBecamePortrait()
        lastOrientationWasLandscape = false
  )

  $('#shield').click () ->
    toggleSlidingMenu()

  if Meteor.config.app.autoJoinAudio
    onAudioJoinHelper()

  checkIfChromeExtExists()

@checkIfChromeExtExists = ->
    getChromeExtensionStatus (status) ->
        if status is "installed-enabled"
            setInSession("chromeExtensionIsInstalled", true)
        else
            setInSession("chromeExtensionIsInstalled", false)

Template.deskshareModal.rendered = ->
  makeWebcamResolutions();
  makeDeskshareResolutions();

Template.main.events
  'click .shield': (event) ->
    $(".tooltip").hide()
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
      panIsValid = getInSession('panIsValid')
      initTransformValue = getInSession('initTransform')
      menuPanned = getInSession('menuPanned')
      screenWidth = $('#container').width()

      setInSession 'panStarted', true

      if panIsValid and
      menuPanned is 'left' and
      initTransformValue + event.deltaX >= 0 and
      initTransformValue + event.deltaX <= $('.left-drawer').width()
        $('.left-drawer').css('transform', 'translateX(' + (initTransformValue + event.deltaX) + 'px)')

      else if panIsValid and
      menuPanned is 'right' and
      initTransformValue + event.deltaX >= screenWidth - $('.right-drawer').width() and
      initTransformValue + event.deltaX <= screenWidth
        $('.right-drawer').css('transform', 'translateX(' + (initTransformValue + event.deltaX) + 'px)')

  'panend #container': (event, template) ->
    if isPortraitMobile()
      panIsValid = getInSession('panIsValid')
      menuPanned = getInSession('menuPanned')
      leftDrawerWidth = $('.left-drawer').width()
      screenWidth = $('#container').width()

      setInSession 'panStarted', false

      if panIsValid and
      menuPanned is 'left' and
      $('.left-drawer').css('transform') isnt 'none'

        if parseInt($('.left-drawer').css('transform').split(',')[4]) < leftDrawerWidth / 2
          $('.shield').removeClass('animatedShield')
          $('.shield').css('opacity', '')
          $('.left-drawer').removeClass('sl-left-drawer-out')
          $('.left-drawer').css('transform', '')
          $('.toggleUserlistButton').removeClass('sl-toggled-on')
          $('.shield').removeClass('darken') # in case it was opened by clicking a button
        else
          $('.left-drawer').css('transform', 'translateX(' + leftDrawerWidth + 'px)')
          $('.shield').css('opacity', 0.5)
          $('.left-drawer').addClass('sl-left-drawer-out')
          $('.left-drawer').css('transform', '')
          $('.toggleUserlistButton').addClass('sl-toggled-on')

      if panIsValid and
      menuPanned is 'right' and
      parseInt($('.right-drawer').css('transform').split(',')[4]) isnt leftDrawerWidth

        if parseInt($('.right-drawer').css('transform').split(',')[4]) > screenWidth - $('.right-drawer').width() / 2
          $('.shield').removeClass('animatedShield')
          $('.shield').css('opacity', '')
          $('.right-drawer').css('transform', 'translateX(' + screenWidth + 'px)')
          $('.right-drawer').removeClass('sl-right-drawer-out')
          $('.right-drawer').css('transform', '')
          $('.toggleMenuButton').removeClass('sl-toggled-on')
          $('.shield').removeClass('darken') # in case it was opened by clicking a button
        else
          $('.shield').css('opacity', 0.5)
          $('.right-drawer').css('transform', 'translateX(' + (screenWidth - $('.right-drawer').width()) + 'px)')
          $('.right-drawer').addClass('sl-right-drawer-out')
          $('.right-drawer').css('transform', '')
          $('.toggleMenuButton').addClass('sl-toggled-on')

      $('.left-drawer').addClass('sl-left-drawer')
      $('.sl-left-drawer').removeClass('left-drawer')
      $('.sl-left-drawer').addClass('sl-left-drawer-content-delay')

      $('.right-drawer').addClass('sl-right-drawer')
      $('.sl-right-drawer').removeClass('right-drawer')
      $('.sl-right-drawer').addClass('sl-right-drawer-content-delay')

  'panright #container, panleft #container': (event, template) ->
    if isPortraitMobile() and isPanHorizontal(event)

      # panright/panleft is always triggered once right before panstart
      if !getInSession('panStarted')

        # opening the left-hand menu
        if event.type is 'panright' and
        event.center.x <= $('#container').width() * 0.1
          setInSession 'panIsValid', true
          setInSession 'menuPanned', 'left'

        # closing the left-hand menu
        else if event.type is 'panleft' and
        event.center.x < $('#container').width() * 0.9
          setInSession 'panIsValid', true
          setInSession 'menuPanned', 'left'

        # opening the right-hand menu
        else if event.type is 'panleft' and
        event.center.x >= $('#container').width() * 0.9
          setInSession 'panIsValid', true
          setInSession 'menuPanned', 'right'

        # closing the right-hand menu
        else if event.type is 'panright' and
        event.center.x > $('#container').width() * 0.1
          setInSession 'panIsValid', true
          setInSession 'menuPanned', 'right'

        else
          setInSession 'panIsValid', false

        setInSession 'eventType', event.type

        if getInSession('menuPanned') is 'left'
          if $('.sl-left-drawer').css('transform') isnt 'none' # menu is already transformed
            setInSession 'initTransform', parseInt($('.sl-left-drawer').css('transform').split(',')[4]) # translateX value
          else if $('.sl-left-drawer').hasClass('sl-left-drawer-out')
            setInSession 'initTransform', $('.sl-left-drawer').width()
          else
            setInSession 'initTransform', 0
          $('.sl-left-drawer').addClass('left-drawer')
          $('.left-drawer').removeClass('sl-left-drawer') # to prevent animations from Sled library
          $('.left-drawer').removeClass('sl-left-drawer-content-delay') # makes the menu content movable too

        else if getInSession('menuPanned') is 'right'
          if $('.sl-right-drawer').css('transform') isnt 'none' # menu is already transformed
            setInSession 'initTransform', parseInt($('.sl-right-drawer').css('transform').split(',')[4]) # translateX value
          else if $('.sl-right-drawer').hasClass('sl-right-drawer-out')
            setInSession 'initTransform', $('.sl-right-drawer').width()
          else
            setInSession 'initTransform', 0
          $('.sl-right-drawer').addClass('right-drawer')
          $('.right-drawer').removeClass('sl-right-drawer') # to prevent animations from Sled library
          $('.right-drawer').removeClass('sl-right-drawer-content-delay') # makes the menu content movable too

      initTransformValue = getInSession('initTransform')
      panIsValid = getInSession('panIsValid')
      menuPanned = getInSession('menuPanned')
      leftDrawerWidth = $('.left-drawer').width()
      rightDrawerWidth = $('.right-drawer').width()
      screenWidth = $('#container').width()

      # moving the left-hand menu
      if panIsValid and
      menuPanned is 'left' and
      initTransformValue + event.deltaX >= 0 and
      initTransformValue + event.deltaX <= leftDrawerWidth

        if $('.sl-right-drawer').hasClass('sl-right-drawer-out')
          toggleRightDrawer()
          toggleRightArrowClockwise()

        $('.left-drawer').css('transform', 'translateX(' + (initTransformValue + event.deltaX) + 'px)')

        if !getInSession('panStarted')
          $('.shield').addClass('animatedShield')
        $('.shield').css('opacity',
          0.5 * (initTransformValue + event.deltaX) / leftDrawerWidth)

      # moving the right-hand menu
      else if panIsValid and
      menuPanned is 'right' and
      initTransformValue + event.deltaX >= screenWidth - rightDrawerWidth and
      initTransformValue + event.deltaX <= screenWidth

        if $('.sl-left-drawer').hasClass('sl-left-drawer-out')
          toggleLeftDrawer()
          toggleLeftArrowClockwise()

        $('.right-drawer').css('transform', 'translateX(' + (initTransformValue + event.deltaX) + 'px)')

        if !getInSession('panStarted')
          $('.shield').addClass('animatedShield')
        $('.shield').css('opacity',
          0.5 * (screenWidth - initTransformValue - event.deltaX) / rightDrawerWidth)

Template.makeButton.rendered = ->
  $('button[rel=tooltip]').tooltip()
