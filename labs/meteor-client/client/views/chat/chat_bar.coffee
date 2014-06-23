Template.chatbar.helpers
  getMessagesInChat: ->
    c = Chats.findOne {chatId: Session.get("meetingId") }
    if c? then c.messages else []
    