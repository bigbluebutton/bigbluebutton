# Periodically check the status of the WebRTC call, when a call has been established attempt to hangup,
# retry if a call is in progress, send the leave voice conference message to BBB
@exitVoiceCall = (event) ->
	# To be called when the hangup is initiated
	hangupCallback = ->
	console.log "Exiting Voice Conference"

	# Checks periodically until a call is established so we can successfully end the call
	# clean state
	getInSession("triedHangup", false)
	# function to initiate call
	(checkToHangupCall = (context) ->
	# if an attempt to hang up the call is made when the current session is not yet finished, the request has no effect
	# keep track in the session if we haven't tried a hangup
	if BBB.getCallStatus() isnt null and !getInSession("triedHangup")
		console.log "Attempting to hangup on WebRTC call"
		if BBB.amIListenOnlyAudio() # notify BBB-apps we are leaving the call call if we are listen only
			Meteor.call('listenOnlyRequestToggle', BBB.getMeetingId(), getInSession("userId"), getInSession("authToken"), false)
		BBB.leaveVoiceConference hangupCallback
		getInSession("triedHangup", true) # we have hung up, prevent retries
		notification_WebRTCAudioExited()
	else
		console.log "RETRYING hangup on WebRTC call in #{Meteor.config.app.WebRTCHangupRetryInterval} ms"
		setTimeout checkToHangupCall, Meteor.config.app.WebRTCHangupRetryInterval # try again periodically
	)(@) # automatically run function
	return false

# join the conference. If listen only send the request to the server
@joinVoiceCall = (event, {isListenOnly} = {}) ->
	if !isWebRTCAvailable()
		notification_WebRTCNotSupported()
		return

	isListenOnly ?= true

	# create voice call params
	joinCallback = (message) ->
		console.log "Beginning WebRTC Conference Call"

	notification_WebRTCAudioJoining()
	if isListenOnly
		Meteor.call('listenOnlyRequestToggle', BBB.getMeetingId(), getInSession("userId"), getInSession("authToken"), true)
	BBB.joinVoiceConference joinCallback, isListenOnly # make the call #TODO should we apply role permissions to this action?

	return false
