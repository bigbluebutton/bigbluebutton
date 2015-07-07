Template.makeButton.helpers
  hasGotUnreadMail: (userId) ->
    chats = getInSession('chats')
    flag = false
    if chats isnt undefined
      if userId is "all_chats"
        chats.map((tabs) ->
          flag = true if tabs.gotMail is true
          tabs
      )
      else if userId is "PUBLIC_CHAT"
        chats.map((tabs) ->
          flag = true if tabs.userId is userId and tabs.gotMail is true
          tabs
      )
    if flag
      return "gotUnreadMail"
    else
      return ""