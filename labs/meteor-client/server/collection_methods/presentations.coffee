# It seems these two methods need to be client-callable. So they need to be secured so that only presenters can use them
Meteor.methods
  # addPresentationToCollection: (meetingId, presentationObject, requester_id, requesterUserId) ->
  addPresentationToCollection: (meetingId, presentationObject) ->
    # requester = Meteor.Users.findOne({_id: requester_id, userId: requesterUserId})
    # if requester? and (requester.presenter or requester.role is "MODERATOR")

    #check if the presentation is already in the collection
    unless Meteor.Presentations.findOne({meetingId: meetingId, 'presentation.id': presentationObject.id})?
      entry =
        meetingId: meetingId
        presentation:
          id: presentationObject.id
          name: presentationObject.name
          current: presentationObject.current

        pointer: #initially we have no data about the cursor
          x: 0.0
          y: 0.0

      id = Meteor.Presentations.insert(entry)
      console.log "presentation added id =[#{id}]:#{presentationObject.id} in #{meetingId}. Presentations.size is now #{Meteor.Presentations.find({meetingId: meetingId}).count()}"

  # removePresentationFromCollection: (meetingId, presentationId, requester_id, requesterUserId) ->
  removePresentationFromCollection: (meetingId, presentationId) ->
    # requester = Meteor.Users.findOne({_id: requester_id, userId: requesterUserId})
    # if requester? and (requester.presenter or requester.role is "MODERATOR")
    if meetingId? and presentationId? and Meteor.Presentations.findOne({meetingId: meetingId, "presentation.id": presentationId})?
      id = Meteor.Presentations.findOne({meetingId: meetingId, "presentation.id": presentationId})
      if id?
        Meteor.Presentations.remove(id._id)
        console.log "----removed presentation[" + presentationId + "] from " + meetingId
