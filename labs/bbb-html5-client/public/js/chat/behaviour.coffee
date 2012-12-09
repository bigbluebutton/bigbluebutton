define [ "jquery", "cs!chat/whiteboard", "cs!chat/connection", "chat/chat" ], ($, Whiteboard, Connection, Chat) ->

  layout = $("#layout")
  chatToogleBtn = $("#chat-btn")
  usersToogleBtn = $("#users-btn")
  logoutBtn = $("#logout-btn")
  userclick = null
  chatclick = null

  # Ensure the status is set right at page load.
  chatToogleBtn.toggleClass "active", layout.hasClass("chat-enabled")
  usersToogleBtn.toggleClass "active", layout.hasClass("users-enabled")

  chatToogleBtn.on "click", ->
    clearTimeout chatclick if chatclick?
    layout.toggleClass "chat-enabled"
    chatToogleBtn.toggleClass "active", layout.hasClass("chat-enabled")
    chatclick = setTimeout(->
      Whiteboard.windowResized()
    , 1100)

  usersToogleBtn.on "click", ->
    clearTimeout userclick if userclick?
    layout.toggleClass "users-enabled"
    usersToogleBtn.toggleClass "active", layout.hasClass("users-enabled")
    userclick = setTimeout(->
      Whiteboard.windowResized "users"
    , 1100)

  logoutBtn.on "click", ->
    Connection.emitLogout()

  $("#prev-slide-btn").on "click", ->
    Connection.emitPrevSlide()
    false

  $("#next-slide-btn").on "click", ->
    Connection.emitNextSlide()
    false

  $("#tool-pan-btn").on "click", ->
    Connection.emitChangeTool "panzoom"
    false

  $("#tool-line-btn").on "click", ->
    Connection.emitChangeTool "line"
    false

  $("#tool-rect-btn").on "click", ->
    Connection.emitChangeTool "rect"
    false

  $("#tool-ellipse-btn").on "click", ->
    Connection.emitChangeTool "ellipse"
    false

  $("button#chat-send").on "click", ->
    Chat.sendMessage()
    false

  $("#colourView").on "click", ->
    Whiteboard.toggleColourPicker()
    false

  $("#switch-presenter").on "click", ->
    Chat.switchPresenter()
    false

  # $("#chat_input_box").on "keyup", (e) ->
  #   count = $(this).attr("maxlength")
  #   chcount.innerHTML = max - chatbox.value.length
