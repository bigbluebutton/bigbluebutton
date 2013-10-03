define [
  'jquery',
  'underscore',
  'backbone',
  'globals',
  'text!templates/session_navbar.html',
  'text!templates/hideMenu.html'
], ($, _, Backbone, globals, sessionNavbarTemplate,hideMenuTemplate) ->

  # The navbar in a session
  # The contents are rendered by SessionView, this class is Used to
  # manage the events in the navbar.
  SessionNavbarView = Backbone.View.extend
    events:
      # TODO: temporary adaptation for iPads: chat always visible
      # "click #chat-btn": "_toggleChat"

      "click #users-btn": "_toggleUsers"
      "click #logout-btn": "_logout"
      "click #toggle-menu-btn": "_toggleMenu"
      "click #chat-btn": "_toggleChatBox"
      "click #video-btn": "_toggleVideo"
       

    initialize: ->
      @$parentEl = null
      

    render: ->
      compiledTemplate = _.template(sessionNavbarTemplate)
      @$el.html compiledTemplate
      @_setToggleButtonsStatus()
      $(document).ready =>
        $(".navbar-btngroup-right").css("right", 0 )
        $(".navbar-btngroup-right").css("width",$(".navbar-btn").width() * 3 * 2)
        console.log("initialized " + $(".navbar-btngroup-right").width() )
      

    # Ensure the status of the toggle buttons is ok
    _setToggleButtonsStatus: ->
      $("#chat-btn", @$el).toggleClass "active", @$parentEl.hasClass("chat-enabled")
      $("#users-btn", @$el).toggleClass "active", @$parentEl.hasClass("users-enabled")
    # Toggle the visibility of the chat panel
    
    _toggleChat: ->
      clearTimeout @toggleChatTimeout if @toggleChatTimeout?
      @$parentEl.toggleClass "chat-enabled"
      @_setToggleButtonsStatus()
      # TODO: timeouting this is not the best solution, maybe the js
      #       should control the visibility of the panel, not the css
      @toggleChatTimeout = setTimeout(->
        $(window).resize()
      , 510)

    # Toggle the visibility of the users panel
    _toggleUsers: ->
      # clearTimeout @toggleUsersTimeout if @toggleUsersTimeout?
      @$parentEl.toggleClass "users-enabled"
      @_setToggleButtonsStatus()
      # TODO: timeouting this is not the best solution, maybe the js
      #       should control the visibility of the panel, not the css
      # @toggleChatTimeout = setTimeout(->
      #   $(window).resize()
      # , 510)

      # TODO: temporary adaptation for iPads
      $("#users").toggle()

    # Log out of the session
    _logout: ->
      globals.connection.emitLogout()
      globals.currentAuth = null
    
    _toggleChatBox: ->
      $("#chat").toggle()
      chatdisplay = $("#chat").css('display')
      videodisplay = $("#video").css('display')
      $("#chat").css('top','6vh') if videodisplay is 'none'
      $("#chat").css('top','35vh') if videodisplay is 'block'
      if chatdisplay is 'block' or videodisplay is 'block'
        $("#whiteboard").css 
          "width":'77%' 
          "left":'0' 
      else
          $("#whiteboard").css "width",'100%' 
      #trigger 'whiteboard:reposition' event to center svg image in whiteboard
      globals.events.trigger("whiteboard:reposition")
                      
    _toggleVideo: ->
      $("#video").toggle()
      videodisplay = $("#video").css('display')
      chatdisplay = $("#chat").css('display')
      $("#chat").css('top','35vh') if chatdisplay is 'block' and videodisplay is 'block'
      $("#chat").css('top','6vh') if chatdisplay is 'block' and videodisplay is 'none'
      if chatdisplay is 'block' or videodisplay is 'block'
        $("#whiteboard").css 
          "width":'77%' 
          "left":'0' 
      else
        $("#whiteboard").css "width",'100%' 
      #trigger 'whiteboard:reposition' event to center svg image in whiteboard
      globals.events.trigger("whiteboard:reposition")
                   
    _toggleMenu: ->
      videodisplay = $("#video").css('display')
      chatdisplay = $("#chat").css('display')
      $("#chat").css 'top','0'
      if chatdisplay is 'none' and videodisplay is 'none'
        $("#whiteboard").css 
          "top":'0'
          "width":'100%'
      else if chatdisplay is 'block' and videodisplay is 'block'
        $("#whiteboard").css 
          "top":'0'
          "width":'77%'   
      else if videodisplay is 'block'
        $("#chat").hide()
        $("#whiteboard").css 
          "top":'0'
          "width":'100%'   
      else  
        $("#whiteboard").css 
          "top":'0'
          "width":'77%'
 
      $("#video").hide()
      $("#users").hide()   
      $("#navbar").hide()
      compiledTemplate = _.template(hideMenuTemplate)
      $("#layout").append compiledTemplate
      #trigger 'whiteboard:reposition' event to center svg image in whiteboard
      globals.events.trigger("whiteboard:reposition")
      
  SessionNavbarView
