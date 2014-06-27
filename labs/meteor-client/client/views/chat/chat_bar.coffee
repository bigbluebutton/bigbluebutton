# Template.messageBar.helpers
#   getMessagesInChat: ->
Template.messageBar.getMessagesInChat = [
  {chatId:"183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1403552477306", from: "Billy Bob", contents: "a message2", timestamp: "1:01pm"},
  {chatId:"183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1403552477306", from: "Sally Sue", contents: "a message3", timestamp: "1:02pm"},
  {chatId:"183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1403552477306", from: "Billy Bob", contents: "a message4", timestamp: "1:03pm"},
  {chatId:"183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1403552477306", from: "Billy Bob", contents: "a message4", timestamp: "1:03pm"},
  {chatId:"183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1403552477306", from: "Billy Bob", contents: "a message4", timestamp: "1:03pm"},
  {chatId:"183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1403552477306", from: "Billy Bob", contents: "a message4", timestamp: "1:03pm"},
  {chatId:"183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1403552477306", from: "Billy Bob", contents: "a message4", timestamp: "1:03pm"},
  {chatId:"183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1403552477306", from: "Billy Bob", contents: "a message4", timestamp: "1:03pm"},
  {chatId:"183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1403552477306", from: "Billy Bob", contents: "a message4", timestamp: "1:03pm"},
  {chatId:"183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1403552477306", from: "Billy Bob", contents: "a message4", timestamp: "1:03pm"},
  {chatId:"183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1403552477306", from: "Billy Bob", contents: "a message4", timestamp: "1:03pm"},
]

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
        "chatType": "PUBLIC_CHAT"
        "fromUserID": Session.get "userId"
        "fromUsername": Session.get "userName"
        "fromTimezoneOffset": "240"
        "toUsername": "public_chat_username"
        "toUserID": "public_chat_userid"
        "fromLang": "en"
        "fromTime": "1.403794169042E12"
        "fromColor": "0"
      }
      #Meteor.call 'sendChatMessagetoServer', messageForServer
      console.log "Sending message to server"
      alert JSON.stringify messageForServer
      Meteor.call "addChatToCollection", Session.get("meetingId"), messageForServer
      $('#newMessageInput').val '' # Clear message box
