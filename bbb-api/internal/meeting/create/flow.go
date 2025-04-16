package create

import (
	"net/http"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
	meetingapi "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting"
)

// NewCreateFlow creates a pipleine.Flow for handling an incoming create request and
// returning a create meeting API response. The flow implements the following steps:
// take the incoming HTTP Request and validate it according to the requirements for a create request,
// transform the HTTP request into a MeetingRunningRequest gRPC request,
// send the request to Akka Apps and receive a response,
// validate the response and transform the original request data into a CreateMeetingRequest gRPC request,
// send the request to Akka Apps and receive a response,
// validate the response and transform it into a meeting API CreateMeetingResponse.
func NewCreateFlow(client *meetingapi.Client) pipeline.Flow[*http.Request, *meetingapi.CreateMeetingResponse] {
	filterTransformToMeetingRunning := pipeline.NewStep[*http.Request, *meeting.MeetingRunningRequest]().
		Filter(&CreateMeetingFilter{}).
		Transform(nil)

	sendReceiveMeetingRunning := pipeline.NewStep[*meeting.MeetingRunningRequest, *meeting.MeetingRunningResponse]().SendReceive(nil)

	filterTransformToCreateMeeting := pipeline.NewStep[*meeting.MeetingRunningResponse, *meeting.CreateMeetingRequest]().
		Filter(nil).
		Transform(nil)

	sendReceiveCreateMeeting := pipeline.NewStep[*meeting.CreateMeetingRequest, *meeting.CreateMeetingResponse]()

	filterTransformToResponse := pipeline.NewStep[*meeting.CreateMeetingResponse, *meetingapi.CreateMeetingResponse]().
		Filter(nil).
		Transform(nil)

	f1 := pipeline.Add(filterTransformToMeetingRunning.Flow(), sendReceiveMeetingRunning)
	f2 := pipeline.Add(f1, filterTransformToCreateMeeting)
	f3 := pipeline.Add(f2, sendReceiveCreateMeeting)
	f4 := pipeline.Add(f3, filterTransformToResponse)
	return f4
}
