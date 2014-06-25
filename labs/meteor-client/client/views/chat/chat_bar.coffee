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

