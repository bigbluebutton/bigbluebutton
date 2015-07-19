Template.makeButton.helpers
  hasGotUnreadMail: (userId) ->
    chats = getInSession('chats')
    if chats isnt undefined
      if userId is "all_chats"
        for tabs in chats
          if tabs.gotMail is true
            return true
      else if userId is "PUBLIC_CHAT"
        for tabs in chats
          if tabs.userId is userId and tabs.gotMail is true
            return true
    return false
  
  getNumberOfUnreadMessages: (userId) ->
    if userId is "all_chats"
      return
    else
      chats = getInSession('chats')
      if chats isnt undefined
        for chat in chats
          if chat.userId is userId and chat.gotMail
            if chat.number > 9
              return "9+"
            else
              return chat.number
    return

  getNotificationClass: (userId) ->
    if userId is "all_chats"
      return "unreadChat"
    if userId is "PUBLIC_CHAT"
      return "unreadChatNumber"
