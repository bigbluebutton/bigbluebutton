// Package validation provides functionality for validating request data
// that is common among the various endpoints in the Meeting API.
package validation

import (
	"regexp"
	"strings"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/responses"
)

// ValidateMeetingID checks whether the provided meeting ID is valid.
// A valid meeting ID is between 2 and 256 characters long and does not
// contain any commas. Returns an error if the meeting ID is not valid.
func ValidateMeetingID(meetingId string) error {
	id := strings.TrimSpace(meetingId)
	if id == "" {
		return core.NewBBBError(responses.MeetingIDMissingErrorKey, responses.MeetingIDMissingErrorMsg)
	}

	if len(id) < 2 || len(id) > 256 {
		return core.NewBBBError(responses.MeetingIDLengthErrorKey, responses.MeetingIDLengthErrorMsg)

	}

	r, _ := regexp.Compile("^[^,]+$")

	if !r.MatchString(id) {
		return core.NewBBBError(responses.MeetingIDFormatErrorKey, responses.MeetingIDFormatErrorMsg)
	}

	return nil
}

// ValidateMeetingName ensures that the provided meeting name is valid.
// A valid meeting name is between 2 and 256 characters long.
func ValidateMeetingName(meetingName string) error {
	name := strings.TrimSpace(meetingName)
	if name == "" {
		return core.NewBBBError(responses.MeetingNameMissingErrorKey, responses.MeetingNameMissingErrorMsg)
	}

	if len(name) < 2 || len(name) > 256 {
		return core.NewBBBError(responses.MeetingNameSizeErrorKey, responses.MeetingNameSizeErrorMsg)
	}

	return nil
}
