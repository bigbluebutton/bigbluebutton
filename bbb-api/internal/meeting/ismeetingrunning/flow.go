package ismeetingrunning

import (
	"net/http"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
	meetingapi "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting"
)

// NewIsMeetingRunningFlow creates a pipleine.Flow for handling an incoming IsMeetingRunning request and
// returning a meeting API response. The flow implements the following steps:
// take the incoming HTTP Request and validate it according to the requirements for an IsMeetingRunning request,
// transform the HTTP request into a MeetingRunningRequest gRPC request,
// send the request to Akka Apps and receive a response,
// transform the gRPC response into a meeting API response.
func NewIsMeetingRunningFlow(client *meetingapi.Client) pipeline.Flow[*http.Request, *meetingapi.Response] {
	filterTransformGRPC := pipeline.NewStep[*http.Request, *meeting.MeetingRunningRequest]().
		Filter(&RequestFilter{}).
		Transform(&HTTPToGRPC{})

	sendReceive := pipeline.NewStep[*meeting.MeetingRunningRequest, *meeting.MeetingRunningResponse]().SendReceive(&SendMeetingRunningRequest{client})

	transformToResponse := pipeline.NewStep[*meeting.MeetingRunningResponse, *meetingapi.Response]().Transform(&GRPCToResponse{})

	f1 := pipeline.Add(filterTransformGRPC.Flow(), sendReceive)
	f2 := pipeline.Add(f1, transformToResponse)

	return f2
}
