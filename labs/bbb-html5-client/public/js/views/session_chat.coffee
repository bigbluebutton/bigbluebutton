define [
  'jquery',
  'underscore',
  'backbone',
  'globals'
], ($, _, Backbone, globals) ->

  # The chat panel in a session
  # The contents are rendered by SessionView, this class is Used to
  # manage the events in the chat.
  SessionChatView = Backbone.View.extend
    events:
      "click button#chat-send": "chatSend"

    # don't need to render anything, the rendering is done by SessionView
    render: ->

    # Send chat message
    chatSend: ->
      # Chat.sendMessage() # TODO

    # TODO
    # $("#chat_input_box").on "keyup", (e) ->
    #   count = $(this).attr("maxlength")
    #   chcount.innerHTML = max - chatbox.value.length

  SessionChatView
