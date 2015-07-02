Template.makeButton.helpers
  hasGotUnreadMail: (userId) ->
    console.log "I'm here"
    chats = getInSession('chats') if getInSession('chats') isnt undefined
    flag = false
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