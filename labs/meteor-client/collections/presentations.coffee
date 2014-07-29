Meteor.methods
  addPresentationToCollection: (meetingId, presentationObject) ->
    #check if the presentation is already in the collection
    unless Meteor.Presentations.findOne({meetingId: meetingId, 'presentation.id': presentationObject.id})?
      entry =
        meetingId: meetingId
        presentation:
          id: presentationObject.id
          name: presentationObject.name
          current: presentationObject.current

      id = Meteor.Presentations.insert(entry)
      console.log "added presentation id =[#{id}]:#{presentationObject.id} in #{meetingId}. Presentations.size is now 
      #{Meteor.Presentations.find({meetingId: meetingId}).count()}"
