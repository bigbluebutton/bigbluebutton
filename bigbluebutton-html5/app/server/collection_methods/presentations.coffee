# --------------------------------------------------------------------------------------------
# Private methods on server
# --------------------------------------------------------------------------------------------
@addPresentationToCollection = (meetingId, presentationObject) ->
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
    #Meteor.log.info "presentation added id =[#{id}]:#{presentationObject.id} in #{meetingId}. Presentations.size is now #{Meteor.Presentations.find({meetingId: meetingId}).count()}"

@removePresentationFromCollection = (meetingId, presentationId) ->
  if meetingId? and presentationId? and Meteor.Presentations.findOne({meetingId: meetingId, "presentation.id": presentationId})?
    id = Meteor.Presentations.findOne({meetingId: meetingId, "presentation.id": presentationId})
    if id?
      Meteor.Presentations.remove(id._id)
      Meteor.log.info "----removed presentation[" + presentationId + "] from " + meetingId


# called on server start and meeting end
@clearPresentationsCollection = (meetingId) ->
  if meetingId?
    Meteor.Presentations.remove({meetingId: meetingId}, Meteor.log.info "cleared Presentations Collection (meetingId: #{meetingId}!")
  else
    Meteor.Presentations.remove({}, Meteor.log.info "cleared Presentations Collection (all meetings)!")

# --------------------------------------------------------------------------------------------
# end Private methods on server
# --------------------------------------------------------------------------------------------
