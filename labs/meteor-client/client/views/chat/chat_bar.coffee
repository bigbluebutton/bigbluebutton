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

Template.messageBar.helpers
	"scrollToBottom": ->
		#$("#chat-messages").scrollTop( $("#chat-public-box").height() )

Template.chatbar.events
	"click .publicChatTab": (event) ->
		Session.set "display_publicPane", true

	"click .optionsChatTab": (event) ->
		Session.set "display_publicPane", false


Template.chatInput.events 
	'keypress #newMessageInput': (event) ->
		if event.which is 13 # Check for pressing enter to submit message

			messageForServer = { # construct message for server
				"payload": {
					"message": {
						"message": $("#newMessageInput").val(),
						"chatType": "PUBLIC_CHAT",
						"fromUserID": Session.get("userId"),
						"fromUsername": Session.get("userName"),
						"fromTimezoneOffset": "240",
						"toUsername": "public_chat_username",
						"toUserID": "public_chat_userid",
						"fromLang": "en",
						"fromTime": "1.403794169042E12",
						"fromColor": "0"
					},
					"meeting_id": Session.get("meetingId"),
					"requester_id": Session.get("userId")
				},
				"header": {
					"timestamp": 1332389433,
					"name": "send_public_chat_message_request"
				}
			}
			#Meteor.call('sendChatMessagetoServer', messageForServer)

			console.log "Sending message to server"
			console.log JSON.stringify messageForServer

