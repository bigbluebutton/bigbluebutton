package validation

import (
	"regexp"
	"strings"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/internal/common"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/internal/core"
)

func ValidateMeetingID(meetingId string) error {
	id := strings.TrimSpace(meetingId)
	if id == "" {
		return common.NewBBBError(core.MeetingIDMissingErrorKey, core.MeetingIDMissingErrorMsg)
	}

	if len(id) < 2 || len(id) > 256 {
		return common.NewBBBError(core.MeetingIDLengthErrorKey, core.MeetingIDLengthErrorMsg)

	}

	r, _ := regexp.Compile("^[^,]+$")

	if !r.MatchString(id) {
		return common.NewBBBError(core.MeetingIDFormatErrorKey, core.MeetingIDFormatErrorMsg)
	}

	return nil
}
