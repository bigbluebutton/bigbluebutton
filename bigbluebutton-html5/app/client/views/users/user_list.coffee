Template.usersList.helpers
  getInfoNumberOfUsers: ->
    numberUsers = BBB.getNumberOfUsers()
    if numberUsers > 8
      return "Users: #{numberUsers}"
    # do not display the label if there are just a few users

Template.usersList.events
  "click .closeUserlistIcon": (event, template) ->
    toggleUsersList()

Template.usersList.rendered = ->
  Tracker.autorun (comp) ->
    setInSession 'userListRenderedTime', TimeSync.serverTime()
    if getInSession('userListRenderedTime') isnt undefined
      comp.stop()