package core

import "github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/internal/common"

const (
	retryPolicy = `{
		"methodConfig": [{
			"name": [{"service": "org.bigbluebutton.protos.BbbCoreService"}],
			"waitForReady": true,
	
			"retryPolicy": {
				"MaxAttempts": 5,
				"InitialBackoff": ".01s",
				"MaxBackoff": ".1s",
				"BackoffMultiplier": 2.0,
				"RetryableStatusCodes": [ "UNAVAILABLE" ]
			}
		}]
	}`

	MeetingIDParam = "meetingID"

	MeetingIDMissingErrorKey = "missingParamMeetingID"
	MeetingIDMissingErrorMsg = "You must provide a meeting ID."

	MeetingIDLengthErrorKey = common.ValidationErrorKey
	MeetingIDLengthErrorMsg = "Meeting ID must be between 2 and 256 characters."

	MeetingIDFormatErrorKey = common.ValidationErrorKey
	MeetingIDFormatErrorMsg = "Meeting ID cannot contain ','."

	MeetingIDNotUniqueErrorKey = "idNotUnique"
	MeetingIDNotUniqueErrorMsg = "A meeting already exists with that meeting ID.  Please use a different meeting ID."

	MeetingNameMissingErrorKey = common.ValidationErrorKey
	MeetingNameMissingErrorMsg = "You must provide a meeting name."

	MeetingNameSizeErrorKey = common.ValidationErrorKey
	MeetingNameSizeErrorMsg = "Meeting name must be between 2 and 256 characters."

	VoiceBridgeFormatErrorKey = common.ValidationErrorKey
	VoiceBridgeFormatErrorMsg = "Voice bridge must be an integer."

	VoiceBridgeInUserErrorKey = "nonUniqueVoiceBridge"
	VoiceBridgeInUserErrorMsg = "The selected voice bridge is already in use."

	PasswordLengthErrorKey = "invalidPassword"
	PasswordLengthErrorMsg = "Passwords must be between 2 and 64 character in length"

	IsBreakoutRoomFormatErrorKey = common.ValidationErrorKey
	IsBreakoutRoomFormatErrorMsg = "You must provide a boolean value (true or false) for the breakout room"

	RecordFormatErrorKey = common.ValidationErrorKey
	RecordFormatErrorMsg = "Record must be a boolean value (true or false)"

	ParentMeetingIdMissingErrorKey = "parentMeetingIDMissing"
	ParentMeetingIdMissingErrorMsg = "No parent meeting ID was provided for the breakout room"

	ParentMeetingDoesNotExistErrorKey = "parentMeetingDoesNotExist"
	ParentMeetingDoesNotExistErrorMsg = "No parent meeting exists for the breakout room"

	CreateMeetingErrorKey = "createFailed"
	CreateMeetingErrorMsg = "Failed to create meeting"

	CreateMeetingDuplicateKey = "duplicateWarning"
	CreateMeetingDuplicateMsg = "This conference was already in existence and may currently be in progress."

	MeetingNotFoundKey = "notFound"
	MeetingNotFoundMsg = "A meeting with that ID does not exist."

	PresentationDisabledKey = "presentationDisabled"
	PresentationDisabledMsg = "Presentation feature is disabled, ignoring."
)
