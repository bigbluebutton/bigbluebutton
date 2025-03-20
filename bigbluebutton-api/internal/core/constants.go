package core

import "github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/internal/common"

const (
	MeetingIdMissingErrorKey string = "missingParamMeetingID"
	MeetingIdMissingErrorMsg string = "You must provide a meeting ID."

	MeetingIdLengthErrorKey string = common.ValidationErrorKey
	MeetingIdLengthErrorMsg string = "Meeting ID must be between 2 and 256 characters."

	MeetingIdFormatErrorKey string = common.ValidationErrorKey
	MeetingIdFormatErrorMsg string = "Meeting ID cannot contain ','."

	MeetingIdNotUniqueErrorKey string = "idNotUnique"
	MeetingIdNotUniqueErrorMsg string = "A meeting already exists with that meeting ID.  Please use a different meeting ID."

	MeetingNameMissingErrorKey string = common.ValidationErrorKey
	MeetingNameMissingErrorMsg string = "You must provide a meeting name."

	MeetingNameSizeErrorKey string = common.ValidationErrorKey
	MeetingNameSizeErrorMsg string = "Meeting name must be between 2 and 256 characters."

	VoiceBridgeFormatErrorKey string = common.ValidationErrorKey
	VoiceBridgeFormatErrorMsg string = "Voice bridge must be an integer."

	VoiceBridgeInUserErrorKey string = "nonUniqueVoiceBridge"
	VoiceBridgeInUserErrorMsg string = "The selected voice bridge is already in use."

	PasswordLengthErrorKey string = "invalidPassword"
	PasswordLengthErrorMsg string = "Passwords must be between 2 and 64 character in length"

	IsBreakoutRoomFormatErrorKey string = common.ValidationErrorKey
	IsBreakoutRoomFormatErrorMsg string = "You must provide a boolean value (true or false) for the breakout room"

	RecordFormatErrorKey string = common.ValidationErrorKey
	RecordFormatErrorMsg string = "Record must be a boolean value (true or false)"

	ParentMeetingIdMissingErrorKey string = "parentMeetingIDMissing"
	ParentMeetingIdMissingErrorMsg string = "No parent meeting ID was provided for the breakout room"

	ParentMeetingDoesNotExistErrorKey string = "parentMeetingDoesNotExist"
	ParentMeetingDoesNotExistErrorMsg string = "No parent meeting exists for the breakout room"

	CreateMeetingErrorKey string = "createFailed"
	CreateMeetingErrorMsg string = "Failed to create meeting"

	CreateMeetingDuplicateKey string = "duplicateWarning"
	CreateMeetingDuplicateMsg string = "This conference was already in existence and may currently be in progress."

	MeetingNotFoundKey string = "notFound"
	MeetingNotFoundMsg string = "A meeting with that ID does not exist."

	PresentationDisabledKey string = "presentationDisabled"
	PresentationDisabledMsg string = "Presentation feature is disabled, ignoring."
)
