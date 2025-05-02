package insertdocument

import (
	"context"
	"net/http"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/common"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/bbbhttp"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/validation"
	meetingapi "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting"
)

type RequestToMeetingInfo struct{}

func (r *RequestToMeetingInfo) Transform(msg pipeline.Message[*http.Request]) (pipeline.Message[*meeting.MeetingInfoRequest], error) {
	req := msg.Payload
	params := req.Context().Value(bbbhttp.ParamsKey).(bbbhttp.Params)

	meetingID := validation.StripCtrlChars(params.Get(meetingapi.IDParam).Value)
	grpcReq := &meeting.MeetingInfoRequest{
		MeetingData: &common.MeetingData{
			MeetingId: meetingID,
		},
	}

	ctx := context.WithValue(msg.Context(), core.ParamsKey, params)
	return pipeline.NewMessageWithContext(grpcReq, ctx), nil
}
