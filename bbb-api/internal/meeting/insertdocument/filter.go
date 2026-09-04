package insertdocument

import (
	"net/http"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/bbbhttp"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/responses"
	corev "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/validation"
	meetingapi "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting/config"
	meetingv "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting/validation"
)

// RequestFilter is an impementaion of the pipeline.Filter interface. It verifies
// the validity of the request data for InsertDocument requests.
type RequestFilter struct{}

// Filter checks the validity of the checksum and the meeting ID for the incoming request.
func (f *RequestFilter) Filter(msg pipeline.Message[*http.Request]) error {
	req := msg.Payload
	cfg := config.DefaultConfig()

	if err := corev.ValidateChecksum(req, cfg.Security.Salt, cfg.ChecksumAlgorithms()); err != nil {
		return err
	}

	params := req.Context().Value(bbbhttp.ParamsKey).(bbbhttp.Params)
	return meetingv.ValidateMeetingID(params.Get(meetingapi.IDParam).Value)
}

// MeetingInfoResponseFilter is an impementaion of the pipeline.Filter interface.
// It verifies the validity of the response data from MeetingInfo responses.
type MeetingInfoResponseFilter struct{}

// Filter verifies that presentations are not part of the disabled features
// for this meeting.
func (f *MeetingInfoResponseFilter) Filter(msg pipeline.Message[*meeting.MeetingInfoResponse]) error {
	for _, df := range msg.Payload.MeetingInfo.DisabledFeatures {
		if df == "presentation" {
			return core.NewBBBError(responses.PresentationDisabledKey, responses.PresentationDisabledMsg)
		}
	}
	return nil
}
