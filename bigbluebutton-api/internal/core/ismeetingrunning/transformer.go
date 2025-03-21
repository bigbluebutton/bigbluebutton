package ismeetingrunning

import (
	"net/http"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/gen/common"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/gen/core"
	commonapi "github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/internal/common"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/internal/common/bbbhttp"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/internal/common/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/internal/common/validation"
	coreapi "github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/internal/core"
)

type HTTPToGRPC struct{}

func (h *HTTPToGRPC) Transform(msg pipeline.Message[*http.Request]) (pipeline.Message[*core.MeetingRunningRequest], error) {
	req := msg.Payload
	params := req.Context().Value(bbbhttp.ParamsKey).(bbbhttp.Params)
	meetingID := validation.StripCtrlChars(params.Get(coreapi.MeetingIDParam))
	grpcReq := &core.MeetingRunningRequest{
		MeetingData: &common.MeetingData{
			MeetingId: meetingID,
		},
	}
	return pipeline.NewMessage(grpcReq), nil
}

type GRPCToResponse struct{}

func (g *GRPCToResponse) Transform(msg pipeline.Message[*core.MeetingRunningResponse]) (pipeline.Message[*coreapi.Response], error) {
	res := msg.Payload
	return pipeline.NewMessage(&coreapi.Response{
		ReturnCode: commonapi.ReturnCodeSuccess,
		Running:    &res.MeetingRunning.IsRunning,
	}), nil
}
