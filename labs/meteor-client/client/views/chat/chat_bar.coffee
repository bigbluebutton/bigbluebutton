Template.chatbar.helpers
  getMessagesInChat: (cio) ->
    c = Chats.findOne {chatId:cio}
    if c? then c.messages else []