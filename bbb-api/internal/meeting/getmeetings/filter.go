package getmeetings

import (
	"net/http"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/bbbhttp"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
	corev "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/validation"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting/config"
	meetingv "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting/validation"
)

// GetMeetingsFilter is an impementaion of the pipeline.Filter interface. It verifies
// the validity of the request data for GetMeetings requests.
type GetMeetingsFilter struct{}

// Filter checks the validity of the checksum and the meeting ID for the incoming request.
func (f *GetMeetingsFilter) Filter(msg pipeline.Message[*http.Request]) error {
	req := msg.Payload
	cfg := config.DefaultConfig()

	if err := corev.ValidateChecksum(req, cfg.Security.Salt, cfg.ChecksumAlgorithms()); err != nil {
		return err
	}

	params := req.Context().Value(bbbhttp.ParamsKey).(bbbhttp.Params)

	if meetingID := params.Get(meeting.MeetingIDParam).Value; meetingID != "" {
		return meetingv.ValidateMeetingID(meetingID)
	}
	return nil
}
