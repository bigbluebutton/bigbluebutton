package validation

import (
	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/internal/model"
	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/util"
)

type Validator interface {
	validate() (bool, string, string)
}

type IsMeetingRunningValidator struct {
	Request *model.IsMeetingRunningRequest
}

func (i *IsMeetingRunningValidator) Validate() (bool, string, string) {
	ok, key, msg := IsMeetingIdValid(i.Request.MeetingId)
	return ok, key, msg
}

type GetMeetingInfoValidator struct {
	Request *model.GetMeetingInfoRequest
}

func (g *GetMeetingInfoValidator) Validate() (bool, string, string) {
	ok, key, msg := IsMeetingIdValid(g.Request.MeetingId)
	return ok, key, msg
}

type GetMeetingsValidator struct {
	Request *model.GetMeetingsRequest
}

func (g *GetMeetingsValidator) Validate() (bool, string, string) {
	meetingId := g.Request.MeetingId
	if meetingId == "" {
		return true, "", ""
	}

	ok, key, msg := IsMeetingIdValid(meetingId)
	return ok, key, msg
}

type CreateValidator struct {
	Request *model.CreateRequest
}

func (c *CreateValidator) Validate() (bool, string, string) {
	ok, key, msg := IsMeetingIdValid(c.Request.MeetingId)
	if !ok {
		return ok, key, msg
	}

	ok, key, msg = IsMeetingNameValid(c.Request.Name)
	if !ok {
		return ok, key, msg
	}

	if c.Request.VoiceBridge != "" {
		ok = IsValidInteger(c.Request.VoiceBridge)
		if !ok {
			return ok, model.VoiceBridgeFormatErrorKey, model.VoiceBridgeFormatErrorMsg
		}
	}

	ok = IsValidLength(c.Request.AttendeePw, 2, 64)
	if !ok {
		return ok, model.PasswordLengthErrorKey, model.PasswordLengthErrorMsg
	}

	ok = IsValidLength(c.Request.ModeratorPw, 2, 64)
	if !ok {
		return ok, model.PasswordLengthErrorKey, model.PasswordLengthErrorMsg
	}

	if c.Request.IsBreakoutRoom != "" {
		ok = IsValidBoolean(c.Request.IsBreakoutRoom)
		if !ok {
			return ok, model.IsBreakoutRoomFormatErrorKey, model.IsBreakoutRoomFormatErrorMsg
		}

		if util.GetBoolOrDefaultValue(c.Request.IsBreakoutRoom, false) {
			if c.Request.ParentMeetingId == "" {
				return false, model.ParentMeetingIdMissingErrorKey, model.ParentMeetingIdMissingErrorMsg
			}
		}
	}

	if c.Request.Record != "" {
		ok = IsValidBoolean(c.Request.Record)
		if !ok {
			return ok, model.RecordFormatErrorKey, model.RecordFormatErrorMsg
		}
	}

	return true, "", ""
}
