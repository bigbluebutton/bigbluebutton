# --------------------------------------------------------------------------------------------
# Private methods on server
# --------------------------------------------------------------------------------------------
@addMeetingToCollection = (meetingId, name, intendedForRecording, voiceConf, duration, callback) ->
	#check if the meeting is already in the collection

	Meteor.Meetings.upsert({meetingId:meetingId}, {$set: {
		meetingName:name
		intendedForRecording: intendedForRecording
		currentlyBeingRecorded: false # default value
		voiceConf: voiceConf
		duration: duration
		deskshare: {}
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
				Meteor.log.info "__added MEETING #{meetingId}"
				cbk()
			funct(callback)
		else
			Meteor.log.error "nothing happened"
			callback()
	)

	# initialize the cursor in the meeting
	initializeCursor(meetingId)

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

		# delete the cursor for the meeting
		clearCursorCollection(meetingId)

		clearDeskshareCollection(meetingId)

		callback()
	else
		funct = (localCallback) ->
			Meteor.log.error ("Error! There was no such meeting #{meetingId}")
			localCallback()
		funct(callback)


@handleDeskShareChange = (meetingId, deskshareInfo) ->
	console.error "__#{meetingId}__deskshareInfo=" + JSON.stringify deskshareInfo
	presenter = Meteor.Users.findOne({meetingId:meetingId, "user.presenter": true})?.user.userid
	Meteor.Deskshare.upsert({meetingId: meetingId}, {$set: {
		"deskshare.broadcasting": deskshareInfo.broadcasting
		"deskshare.timestamp": "now"
		"deskshare.vw": deskshareInfo.vw
		"deskshare.vh": deskshareInfo.vh
		"deskshare.voice_bridge": deskshareInfo.voice_bridge
		"deskshare.startedBy": presenter
	}})

@clearDeskshareCollection = (meetingId) ->
	if meetingId?
		Meteor.Deskshare.remove({meetingId: meetingId},
			Meteor.log.info "cleared Deskshare Collection (meetingId: #{meetingId}!")
	else
		Meteor.Deskshare.remove({}, Meteor.log.info "cleared Deskshare Collection (all meetings)!")


# --------------------------------------------------------------------------------------------
# end Private methods on server
# --------------------------------------------------------------------------------------------

# updates the server side database for deskshare information for a meeting
Meteor.methods
  simulatePresenterDeskshareHasStarted: (meetingId, bridge, startedBy) ->
      console.log("meeting started")
      console.log("meeting id: #{meetingId}")
      console.log("started by: #{startedBy}")
      Meteor.Deskshare.upsert({meetingId: meetingId}, {$set: {
          "deskshare.broadcasting": true,
          "deskshare.timestamp": "now",
          "deskshare.vw": null,
          "deskshare.vh": null,
          "deskshare.voice_bridge": bridge,
          "deskshare.startedBy": startedBy
      }})

  simulatePresenterDeskshareHasEnded: (meetingId, bridge, startedBy) ->
      console.log "meeting is being ended"
      Meteor.Deskshare.upsert({meetingId: meetingId}, {$set: {
          "deskshare.broadcasting": false
          "deskshare.timestamp": "now"
          "deskshare.vw": null
          "deskshare.vh": null
          "deskshare.voice_bridge": bridge
          "deskshare.startedBy": null
      }})
