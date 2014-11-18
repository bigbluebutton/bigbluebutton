# TODO we should look into publishing the Users collection so that includes
# the secret of the specific user but not of the other users

moderator = null
presenter = null
viewer =
  # raising/lowering hand
  raiseOwnHand : true
  lowerOwnHand : true

  # muting
  muteSelf : true
  unmuteSelf : true

  logoutSelf : true

@isAllowedTo = (action, meetingId, userId, secret) ->

  user = Meteor.Users.findOne({meetingId:meetingId, userId: userId})
  if user?
    # we check if the user is who he claims to be
    if secret is user.userSecret
      if user.user?.role is 'VIEWER'
        return viewer[action] or false
    Meteor.log.info "in meetingId=#{meetingId} userId=#{userId} tried to perform #{action} without permission" #TODO make this a warning

    # the current version of the HTML5 client represents only VIEWER users
  return false
