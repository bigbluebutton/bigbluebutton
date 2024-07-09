package validation

import (
	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/internal/model"
)

type Validator interface {
	validate() (bool, string, string)
}

type IsMeetingRunningValidator struct {
	Request *model.IsMeetingRunningRequest
}

func (i *IsMeetingRunningValidator) Validate() (bool, string, string) {
	ok, key, msg := IsMeetingIdValid(i.Request.MeetingId)
	if !ok {
		return ok, key, msg
	}

	return true, "", ""
}

type GetMeetingInfoValidator struct {
	Request *model.GetMeetingInfoRequest
}

func (g *GetMeetingInfoValidator) Validate() (bool, string, string) {
	return true, "", ""
}

type CreateValidator struct {
	Request *model.CreateRequest
}

func (c *CreateValidator) Validate() (bool, string, string) {
	return true, "", ""
}
