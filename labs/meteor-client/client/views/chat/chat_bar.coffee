Template.messageBar.helpers
  getMessagesInChat: ->
    messages = Meteor.Chat.find("meetingId": getInSession("currentChatId"))
    console.log messages
    messages

# Must be be called when template is finished rendering or will not work
Template.messageBar.rendered = -> # Scroll down the messages box the amount of its height, which places it at the bottom
    height = $("#chatScrollWindow").height()
    $("#chatScrollWindow").scrollTop(height)  

Template.tabButtons.events
  "click .publicChatTab": (event) ->
    Session.set "display_publicPane", true

  "click .optionsChatTab": (event) ->
    Session.set "display_publicPane", false

Template.chatInput.events
  'keypress #newMessageInput': (event) ->
    if event.which is 13 # Check for pressing enter to submit message

      messageForServer = { # construct message for server
        "message": $("#newMessageInput").val()
        "chat_type": "PUBLIC_CHAT"
        "from_userid": Session.get "userId"
        "from_username": Session.get "userName"
        "from_tz_offset": "240"
        "to_username": "public_chat_username"
        "to_userid": "public_chat_userid"
        "from_lang": "en"
        "from_time": "1.403794169042E12"
        "from_color": "0"
      }
      console.log "Sending message to server: '#{messageForServer.message}'"
      Meteor.call "sendChatMessagetoServer", Session.get("meetingId"), messageForServer
      $('#newMessageInput').val '' # Clear message box
