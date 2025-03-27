package ismeetingrunning

import (
	"net/http"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/common"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/core"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/common/bbbhttp"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/common/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/common/responses"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/common/validation"
	meetingapi "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting"
)

type HTTPToGRPC struct{}

func (h *HTTPToGRPC) Transform(msg pipeline.Message[*http.Request]) (pipeline.Message[*core.MeetingRunningRequest], error) {
	req := msg.Payload
	params := req.Context().Value(bbbhttp.ParamsKey).(bbbhttp.Params)
	meetingID := validation.StripCtrlChars(params.Get(meetingapi.MeetingIDParam))
	grpcReq := &core.MeetingRunningRequest{
		MeetingData: &common.MeetingData{
			MeetingId: meetingID,
		},
	}
	return pipeline.NewMessage(grpcReq), nil
}

type GRPCToResponse struct{}

func (g *GRPCToResponse) Transform(msg pipeline.Message[*core.MeetingRunningResponse]) (pipeline.Message[*meetingapi.Response], error) {
	res := msg.Payload
	return pipeline.NewMessage(&meetingapi.Response{
		ReturnCode: responses.ReturnCodeSuccess,
		Running:    &res.MeetingRunning.IsRunning,
	}), nil
}
