package validation

import (
	"regexp"
	"strconv"
	"strings"

	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/internal/model"
)

func StripCtrlChars(input string) string {
	r, _ := regexp.Compile("\\p{Cc}")
	output := r.ReplaceAllString(input, "")
	return strings.TrimSpace(output)
}

func IsMeetingIdValid(meetingId string) (bool, string, string) {
	id := strings.TrimSpace(meetingId)
	if id == "" {
		return false, model.MeetingIdMissingErrorKey, model.MeetingIdMissingErrorMsg
	}

	if len(id) < 2 || len(id) > 256 {
		return false, model.MeetingIdLengthErrorKey, model.MeetingIdLengthErrorMsg
	}

	r, _ := regexp.Compile("^[^,]+$")

	if !r.MatchString(id) {
		return false, model.MeetingIdFormatErrorKey, model.MeetingIdFormatErrorMsg
	}

	return true, "", ""
}

func IsMeetingNameValid(meetingName string) (bool, string, string) {
	name := strings.TrimSpace(meetingName)
	if name == "" {
		return false, model.MeetingNameMissingErrorKey, model.MeetingNameMissingErrorMsg
	}

	if len(name) < 2 || len(name) > 256 {
		return false, model.MeetingNameSizeErrorKey, model.MeetingNameSizeErrorMsg
	}

	return true, "", ""
}

func IsValidInteger(s string) bool {
	_, err := strconv.Atoi(s)
	return err == nil
}

func IsValidLength(s string, min int, max int) bool {
	trimmed := strings.TrimSpace(s)
	return len(trimmed) >= min && len(trimmed) <= max
}
