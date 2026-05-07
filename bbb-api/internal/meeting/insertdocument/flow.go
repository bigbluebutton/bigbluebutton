package insertdocument

import (
	"net/http"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
	meetingapi "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting/document"
)

// NewInsertDocumentFlow creates a pipleine.Flow for handling an incoming InsertDocument request and
// returning a meeting API response. The flow implements the following steps:
// take the incoming HTTP Request and validate it according to the requirements for an InsertDocument request,
// transform the HTTP request into a MeetingInfoRequest gRPC request,
// send the request to Akka Apps and receive a response,
// transform the gRPC response into a meeting API response.
func NewInsertDocumentFlow(client meetingapi.Client, proc document.Processor) pipeline.Flow[*http.Request, *meetingapi.Response] {
	filterTransformToMeetingInfo := pipeline.NewStep[*http.Request, *meeting.MeetingInfoRequest]().
		Filter(&RequestFilter{}).
		Transform(&RequestToMeetingInfo{})

	sendReceiveMeetingInfo := pipeline.NewStep[*meeting.MeetingInfoRequest, *meeting.MeetingInfoResponse]().SendReceive(&SendMeetingInfoRequest{client})

	filterTransformToResponse := pipeline.NewStep[*meeting.MeetingInfoResponse, *meetingapi.Response]().
		Filter(&MeetingInfoResponseFilter{}).
		Transform(&MeetingInfoToResponse{proc})

	f1 := pipeline.Add(filterTransformToMeetingInfo.Flow(), sendReceiveMeetingInfo)
	f2 := pipeline.Add(f1, filterTransformToResponse)
	return f2
}
