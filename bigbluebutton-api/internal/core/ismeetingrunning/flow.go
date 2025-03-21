package ismeetingrunning

import (
	"net/http"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/gen/core"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/internal/common/pipeline"
	coreapi "github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/internal/core"
)

func NewIsMeetingRunningFlow() pipeline.Flow[*http.Request, *coreapi.Response] {
	filterTransformGRPC := pipeline.NewStep[*http.Request, *core.MeetingRunningRequest]().
		Filter(&IsMeetingRunningFilter{}).
		Transform(&HTTPToGRPC{})

	sendReceive := pipeline.NewStep[*core.MeetingRunningRequest, *core.MeetingRunningResponse]().SendReceive(&SendMeetingRunningRequest{})

	transformToResponse := pipeline.NewStep[*core.MeetingRunningResponse, *coreapi.Response]().Transform(&GRPCToResponse{})

	f1 := pipeline.Add(filterTransformGRPC.Flow(), sendReceive)
	f2 := pipeline.Add(f1, transformToResponse)

	return f2
}
