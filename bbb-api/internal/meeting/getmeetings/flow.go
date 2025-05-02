package getmeetings

import (
	"net/http"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
	meetingapi "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting"
)

// NewGetMeetingsFlow creates a pipleine.Flow for handling an incoming GetMeetings request and
// returning a meeting API response. The flow implements the following steps:
// take the incoming HTTP Request and validate it according to the requirements for a GetMeetings request,
// transform the HTTP request into a GetMeetingsStreamRequest gRPC request,
// send the request to Akka Apps and receive a response,
// transform the gRPC response into a meeting API response.
func NewGetMeetingsFlow(client *meetingapi.Client) pipeline.Flow[*http.Request, *meetingapi.Response] {
	filterTransformGRPC := pipeline.NewStep[*http.Request, *meeting.GetMeetingsStreamRequest]().
		Filter(&RequestFilter{}).
		Transform(&HTTPToGRPC{})

	sendReceive := pipeline.NewStep[*meeting.GetMeetingsStreamRequest, []*meeting.MeetingInfoResponse]().SendReceive(&SendGetMeetingsRequest{})

	transformToResponse := pipeline.NewStep[[]*meeting.MeetingInfoResponse, *meetingapi.Response]().Transform(&GRPCToResponse{})

	f1 := pipeline.Add(filterTransformGRPC.Flow(), sendReceive)
	f2 := pipeline.Add(f1, transformToResponse)

	return f2
}
