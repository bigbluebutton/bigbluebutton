Template.usersList.helpers
  getMeetingSize: -> # Retreieve the number of users in the chat, or "error" string
    myDBID = Meteor.Users.findOne({'userId':getInSession('userId')})?._id
    
    # redirect to logout if for some reason (kicked out) the user is pushed out of the meeting
    if Meteor.Users.find().count() isnt 0 and Meteor.Users.findOne({_id: myDBID}) is undefined
      Router.go 'logout'
    return Meteor.Users.find().count()

