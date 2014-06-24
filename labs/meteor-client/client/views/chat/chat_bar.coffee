Template.chatbar.helpers
  getMessagesInChat: ->
    c = Chats.findOne {chatId: Session.get("meetingId") }
    if c? then c.messages else []

Template.chatbar.events
	"click .publicChatTab": (event) ->
		Session.set "display_messageBar", true

	"click .optionsChatTab": (event) ->
		Session.set "display_messageBar", false

