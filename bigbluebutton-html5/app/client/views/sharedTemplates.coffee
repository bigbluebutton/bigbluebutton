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