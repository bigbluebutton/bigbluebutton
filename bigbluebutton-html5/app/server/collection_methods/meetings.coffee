# --------------------------------------------------------------------------------------------
# Private methods on server
# --------------------------------------------------------------------------------------------
@addMeetingToCollection = (meetingId, name, intendedForRecording, voiceConf, duration) ->
  #check if the meeting is already in the collection
  unless Meteor.Meetings.findOne({meetingId: meetingId})?
    entry =
      meetingId: meetingId
      meetingName: name
      intendedForRecording: intendedForRecording
      currentlyBeingRecorded: false # defaut value
      voiceConf: voiceConf
      duration: duration
      roomLockSettings:
        # by default the lock settings will be disabled on meeting create
        disablePrivChat: false
        disableCam: false
        disableMic: false
        lockOnJoin: Meteor.config.lockOnJoin
        lockedLayout: false
        disablePubChat: false
      deskshare:
        broadcasting: false
        timestamp: null
        vw: 0
        vh: 0
        voice_bridge: null

    id = Meteor.Meetings.insert(entry)
    Meteor.log.info "added meeting _id=[#{id}]:meetingId=[#{meetingId}]:name=[#{name}]:duration=[#{duration}]:voiceConf=[#{voiceConf}]
    roomLockSettings:[#{JSON.stringify entry.roomLockSettings}]."


@clearMeetingsCollection = (meetingId) ->
	if meetingId?
		Meteor.Meetings.remove({meetingId: meetingId}, Meteor.log.info "cleared Meetings Collection (meetingId: #{meetingId}!")
	else
		Meteor.Meetings.remove({}, Meteor.log.info "cleared Meetings Collection (all meetings)!")

#clean up upon a meeting's end
@removeMeetingFromCollection = (meetingId) ->
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
# --------------------------------------------------------------------------------------------
# end Private methods on server
# --------------------------------------------------------------------------------------------

# updates the server side database for deskshare information for a meeting
Meteor.methods
    simulatePresenterDeskshareHasStarted: (meetingId, bridge, startedBy) ->
        console.log("\n\n\n\n\n\n\nmeeting started")
        console.log("started by: #{startedBy}\n\n\n\n\n\n\n")
        Meteor.Meetings.update({meetingId: meetingId}, {$set: {
            "deskshare.broadcasting": true
            "deskshare.timestamp": "now"
            "deskshare.vw": null
            "deskshare.vh": null
            "deskshare.voice_bridge": bridge
            "deskshare.startedBy": startedBy
        }})

    simulatePresenterDeskshareHasEnded: (meetingId, startedBy) ->
        console.log "\n\n\n\n\n\n\nmeeting is being ended\n\n\n\n\n\n\n"
        Meteor.Meetings.update({meetingId: meetingId}, {$set: {
            "deskshare.broadcasting": false
            "deskshare.timestamp": "now"
            "deskshare.vw": null
            "deskshare.vh": null
            # "deskshare.voice_bridge": bridge
            "deskshare.startedBy": null
        }})
