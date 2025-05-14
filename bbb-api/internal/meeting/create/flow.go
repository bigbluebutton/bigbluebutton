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
// validate the response and transform the resposne into a GetMeetingInfo gRPC request,
// send the request to Akka Apps and receive a response,
// transform the response and the original request data into a CreateMeeting gRPC request,
// send the request to Akka Apps and receive a response,
// validate the response and transform it into a meeting API CreateMeetingResponse.
func NewCreateFlow(client meetingapi.Client) pipeline.Flow[*http.Request, *meetingapi.CreateMeetingResponse] {
	filterTransformToMeetingRunning := pipeline.NewStep[*http.Request, *meeting.MeetingRunningRequest]().
		Filter(&RequestFilter{}).
		Transform(&RequestToIsMeetingRunning{})

	sendReceiveMeetingRunning := pipeline.NewStep[*meeting.MeetingRunningRequest, *meeting.MeetingRunningResponse]().SendReceive(&SendMeetingRunningRequest{client})

	filterTransformToMeetingInfo := pipeline.NewStep[*meeting.MeetingRunningResponse, *meeting.MeetingInfoRequest]().
		Filter(&MeetingRunningResponseFilter{}).
		Transform(&MeetingRunningToMeetingInfo{})

	sendReceiveMeetingInfo := pipeline.NewStep[*meeting.MeetingInfoRequest, *meeting.MeetingInfoResponse]().SendReceive(&SendMeetingInfoRequest{client})

	transformToCreateMeeting := pipeline.NewStep[*meeting.MeetingInfoResponse, *meeting.CreateMeetingRequest]().Transform(&MeetingRunningToCreate{})

	sendReceiveCreateMeeting := pipeline.NewStep[*meeting.CreateMeetingRequest, *meeting.CreateMeetingResponse]().SendReceive(&SendCreateMeetingRequest{})

	filterTransformToResponse := pipeline.NewStep[*meeting.CreateMeetingResponse, *meetingapi.CreateMeetingResponse]().
		Filter(&CreateMeetingResponseFilter{}).
		Transform(&CreateMeetingToResponse{})

	f1 := pipeline.Add(filterTransformToMeetingRunning.Flow(), sendReceiveMeetingRunning)
	f2 := pipeline.Add(f1, filterTransformToMeetingInfo)
	f3 := pipeline.Add(f2, sendReceiveMeetingInfo)
	f4 := pipeline.Add(f3, transformToCreateMeeting)
	f5 := pipeline.Add(f4, sendReceiveCreateMeeting)
	f6 := pipeline.Add(f5, filterTransformToResponse)
	return f6
}
