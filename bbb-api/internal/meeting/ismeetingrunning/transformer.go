package ismeetingrunning

import (
	"net/http"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/common"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/bbbhttp"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/responses"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/validation"
	meetingapi "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting"
)

type HTTPToGRPC struct{}

func (h *HTTPToGRPC) Transform(msg pipeline.Message[*http.Request]) (pipeline.Message[*meeting.MeetingRunningRequest], error) {
	req := msg.Payload
	params := req.Context().Value(bbbhttp.ParamsKey).(bbbhttp.Params)
	meetingID := validation.StripCtrlChars(params.Get(meetingapi.MeetingIDParam).Value)
	grpcReq := &meeting.MeetingRunningRequest{
		MeetingData: &common.MeetingData{
			MeetingId: meetingID,
		},
	}
	return pipeline.NewMessage(grpcReq), nil
}

type GRPCToResponse struct{}

func (g *GRPCToResponse) Transform(msg pipeline.Message[*meeting.MeetingRunningResponse]) (pipeline.Message[*meetingapi.Response], error) {
	res := msg.Payload
	return pipeline.NewMessage(&meetingapi.Response{
		ReturnCode: responses.ReturnCodeSuccess,
		Running:    &res.MeetingRunning.IsRunning,
	}), nil
}
