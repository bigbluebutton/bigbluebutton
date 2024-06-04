package validation

import (
	"regexp"

	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/internal/model"
)

func IsMeetingIdValid(meetingId string) (bool, string, string) {
	if meetingId == "" {
		return false, model.MeetingIdMissingErrorKey, model.MeetingIdMissingErrorMsg
	}

	if len(meetingId) < 2 || len(meetingId) > 256 {
		return false, model.MeetingIdLengthErrorKey, model.MeetingIdLengthErrorMsg
	}

	r, _ := regexp.Compile("^[^,]+$")

	if !r.MatchString(meetingId) {
		return false, model.MeetingIdFormatErrorKey, model.MeetingIdFormatErrorMsg
	}

	return true, "", ""
}
