# --------------------------------------------------------------------------------------------
# Private methods on server
# --------------------------------------------------------------------------------------------

@addMeetingToCollection = (meetingId, name, intendedForRecording, voiceConf, duration, callback) ->
	#check if the meeting is already in the collection

	obj = Meteor.Meetings.upsert({meetingId:meetingId}, {$set: {
		meetingName:name
		intendedForRecording: intendedForRecording
		currentlyBeingRecorded: false # default value
		voiceConf: voiceConf
		duration: duration
		roomLockSettings:
			# by default the lock settings will be disabled on meeting create
			disablePrivateChat: false
			disableCam: false
			disableMic: false
			lockOnJoin: Meteor.config.lockOnJoin
			lockedLayout: false
			disablePublicChat: false
			lockOnJoinConfigurable: false # TODO
	}}, (err, numChanged) =>
		if numChanged.insertedId?
			funct = (cbk) ->
				Meteor.log.info "added MEETING #{meetingId}"
				cbk()
			funct(callback)
		else
			Meteor.log.error "nothing happened"
			callback()
	)



@clearMeetingsCollection = (meetingId) ->
	if meetingId?
		Meteor.Meetings.remove({meetingId: meetingId},
			Meteor.log.info "cleared Meetings Collection (meetingId: #{meetingId}!")
	else
		Meteor.Meetings.remove({}, Meteor.log.info "cleared Meetings Collection (all meetings)!")


#clean up upon a meeting's end
@removeMeetingFromCollection = (meetingId, callback) ->
	if Meteor.Meetings.findOne({meetingId: meetingId})?
		Meteor.log.info "end of meeting #{meetingId}. Clear the meeting data from all collections"
		# delete all users in the meeting
		clearUsersCollection(meetingId)

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

		callback()
	else
		funct (localCallback) ->
			Meteor.log.error ("Error! There was no such meeting #{meetingId}")
			localCallback()
		funct(callback)



# --------------------------------------------------------------------------------------------
# end Private methods on server
# --------------------------------------------------------------------------------------------
