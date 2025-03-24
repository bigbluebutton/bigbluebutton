package validation

import (
	"regexp"
	"strings"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/internal/common"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/internal/common/responses"
)

func ValidateMeetingID(meetingId string) error {
	id := strings.TrimSpace(meetingId)
	if id == "" {
		return common.NewBBBError(responses.MeetingIDMissingErrorKey, responses.MeetingIDMissingErrorMsg)
	}

	if len(id) < 2 || len(id) > 256 {
		return common.NewBBBError(responses.MeetingIDLengthErrorKey, responses.MeetingIDLengthErrorMsg)

	}

	r, _ := regexp.Compile("^[^,]+$")

	if !r.MatchString(id) {
		return common.NewBBBError(responses.MeetingIDFormatErrorKey, responses.MeetingIDFormatErrorMsg)
	}

	return nil
}
