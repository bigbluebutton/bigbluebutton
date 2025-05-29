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

// HTTPToGRPC is a pipleline.Transformer implementation that is used
// to transform a HTTP request into a [MeetingRunningRequest].
type HTTPToGRPC struct{}

// Transform takes an incoming message with a payload of type http.Request, transforms
// it into a [MeetingRunningRequest], and then returns it in a new message.
func (h *HTTPToGRPC) Transform(msg pipeline.Message[*http.Request]) (pipeline.Message[*meeting.MeetingRunningRequest], error) {
	req := msg.Payload
	params := req.Context().Value(bbbhttp.ParamsKey).(bbbhttp.Params)
	meetingID := validation.StripCtrlChars(params.Get(meetingapi.IDParam).Value)
	grpcReq := &meeting.MeetingRunningRequest{
		MeetingData: &common.MeetingData{
			MeetingId: meetingID,
		},
	}
	return pipeline.NewMessage(grpcReq), nil
}

// GRPCToResponse is a pipeline.Transformer implementation that is
// used to transform a [MeetingRunningResponse] into a meeting API response.
type GRPCToResponse struct{}

// Transform takes an incoming message with a payload of type [MeetingRunningResponse],
// transforms it into a meeting API response, and then returns it in a new message.
func (g *GRPCToResponse) Transform(msg pipeline.Message[*meeting.MeetingRunningResponse]) (pipeline.Message[*meetingapi.Response], error) {
	resp := msg.Payload
	return pipeline.NewMessage(&meetingapi.Response{
		ReturnCode: responses.ReturnCodeSuccess,
		Running:    &resp.MeetingRunning.IsRunning,
	}), nil
}
