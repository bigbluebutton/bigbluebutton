package ismeetingrunning

import (
	"net/http"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/core"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/common/pipeline"
	meetingapi "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting"
)

func NewIsMeetingRunningFlow(client *meetingapi.Client) pipeline.Flow[*http.Request, *meetingapi.Response] {
	filterTransformGRPC := pipeline.NewStep[*http.Request, *core.MeetingRunningRequest]().
		Filter(&IsMeetingRunningFilter{}).
		Transform(&HTTPToGRPC{})

	sendReceive := pipeline.NewStep[*core.MeetingRunningRequest, *core.MeetingRunningResponse]().SendReceive(&SendMeetingRunningRequest{client})

	transformToResponse := pipeline.NewStep[*core.MeetingRunningResponse, *meetingapi.Response]().Transform(&GRPCToResponse{})

	f1 := pipeline.Add(filterTransformGRPC.Flow(), sendReceive)
	f2 := pipeline.Add(f1, transformToResponse)

	return f2
}
