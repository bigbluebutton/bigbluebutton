package insertdocument

import (
	"net/http"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
	meetingapi "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting"
)

func NewInsertDocumentFlow(client meetingapi.Client) pipeline.Flow[*http.Request, *meetingapi.Response] {
	filterTransformToMeetingInfo := pipeline.NewStep[*http.Request, *meeting.MeetingInfoRequest]().
		Filter(&RequestFilter{}).
		Transform(&RequestToMeetingInfo{})

	sendReceiveMeetingInfo := pipeline.NewStep[*meeting.MeetingInfoRequest, *meeting.MeetingInfoResponse]().SendReceive(&SendMeetingInfoRequest{client})

	filterTransformToResponse := pipeline.NewStep[*meeting.MeetingInfoResponse, *meetingapi.Response]().
		Filter(&MeetingInfoResponseFilter{}).
		Transform(nil)

	f1 := pipeline.Add(filterTransformToMeetingInfo.Flow(), sendReceiveMeetingInfo)
	f2 := pipeline.Add(f1, filterTransformToResponse)
	return f2
}
