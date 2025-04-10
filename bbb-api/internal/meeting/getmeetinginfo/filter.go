package getmeetinginfo

import (
	"net/http"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/bbbhttp"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
	corev "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/validation"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting/config"
	meetingv "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting/validation"
)

// GetMeetingInfoFilter is an impementaion of the pipeline.Filter interface. It verifies
// the validity of the request data for GetMeetingInfo requests.
type GetMeetingInfoFilter struct{}

// Filter checks the validity of the checksum and the meeting ID for the incoming request.
func (f *GetMeetingInfoFilter) Filter(msg pipeline.Message[*http.Request]) error {
	req := msg.Payload
	cfg := config.DefaultConfig()

	if err := corev.ValidateChecksum(req, cfg.Security.Salt, cfg.ChecksumAlgorithms()); err != nil {
		return err
	}

	params := req.Context().Value(bbbhttp.ParamsKey).(bbbhttp.Params)
	return meetingv.ValidateMeetingID(params.Get(meeting.MeetingIDParam).Value)

}
