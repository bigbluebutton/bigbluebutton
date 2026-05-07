package getmeetinginfo

import (
	"net/http"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
	meetingapi "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting"
)

// NewGetMeetingInfoFlow creates a pipleine.Flow for handling an incoming GetMeetingInfo request and
// returning a [GetMeetingInfoResponse]. The flow implements the following steps:
// take the incoming HTTP Request and validate it according to the requirements for a GetMeetingInfo request,
// transform the HTTP request into a MeetingInfoRequest gRPC request,
// send the request to Akka Apps and receive a response,
// transform the gRPC response into a GetMeetingInfoResponse.
func NewGetMeetingInfoFlow(client meetingapi.Client) pipeline.Flow[*http.Request, *meetingapi.GetMeetingInfoResponse] {
	filterTransformGRPC := pipeline.NewStep[*http.Request, *meeting.MeetingInfoRequest]().
		Filter(&RequestFilter{}).
		Transform(&HTTPToGRPC{})

	sendReceive := pipeline.NewStep[*meeting.MeetingInfoRequest, *meeting.MeetingInfoResponse]().SendReceive(&SendMeetingInfoRequest{})

	transformToResponse := pipeline.NewStep[*meeting.MeetingInfoResponse, *meetingapi.GetMeetingInfoResponse]().Transform(&GRPCToResponse{})

	f1 := pipeline.Add(filterTransformGRPC.Flow(), sendReceive)
	f2 := pipeline.Add(f1, transformToResponse)

	return f2
}
