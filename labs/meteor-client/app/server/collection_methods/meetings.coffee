# --------------------------------------------------------------------------------------------
# Private methods on server
# --------------------------------------------------------------------------------------------
@addMeetingToCollection = (meetingId, name, intendedForRecording, voiceConf, duration) ->
	#check if the meeting is already in the collection
	unless Meteor.Meetings.findOne({meetingId: meetingId})?
		currentlyBeingRecorded = false # defaut value
		id = Meteor.Meetings.insert(
			meetingId: meetingId,
			meetingName: name,
			intendedForRecording: intendedForRecording,
			currentlyBeingRecorded: currentlyBeingRecorded,
			voiceConf: voiceConf,
			duration: duration)
		Meteor.log.info "added meeting _id=[#{id}]:meetingId=[#{meetingId}]:name=[#{name}]:duration=[#{duration}]:voiceConf=[#{voiceConf}]."


@clearMeetingsCollection = (meetingId) ->
	if meetingId?
		Meteor.Meetings.remove({meetingId: meetingId}, Meteor.log.info "cleared Meetings Collection (meetingId: #{meetingId}!")
	else
		Meteor.Meetings.remove({}, Meteor.log.info "cleared Meetings Collection (all meetings)!")


@removeMeetingFromCollection = (meetingId) ->
	if Meteor.Meetings.findOne({meetingId: meetingId})?
		# delete all users in the meeting
		if Meteor.Users.find({meetingId: meetingId}).count() isnt 0
			Meteor.log.info "on meeting end #{meetingId} deleting all users"
			for user in Meteor.Users.find({meetingId: meetingId}).fetch()
				Meteor.log.info "in meetings::removeMeetingFromCollection #{meetingId} #{user.userId}"
				removeUserFromCollection meetingId, user.userId

		# delete all slides in the meeting
		clearSlidesCollection(meetingId)

		# delete all shapes in the meeting
		clearShapesCollection(meetingId)

		# delete all presentations in the meeting
		clearPresentationsCollection(meetingId)

		# delete all chat messages in the meeting
		clearChatCollection(meetingId)

		# delete the meeting
		clearMeetingsCollection(meetingId)
# --------------------------------------------------------------------------------------------
# end Private methods on server
# --------------------------------------------------------------------------------------------
