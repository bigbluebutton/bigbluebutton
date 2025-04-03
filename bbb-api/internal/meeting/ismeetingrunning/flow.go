package ismeetingrunning

import (
	"net/http"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
	meetingapi "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/meeting"
)

func NewIsMeetingRunningFlow(client *meetingapi.Client) pipeline.Flow[*http.Request, *meetingapi.Response] {
	filterTransformGRPC := pipeline.NewStep[*http.Request, *meeting.MeetingRunningRequest]().
		Filter(&IsMeetingRunningFilter{}).
		Transform(&HTTPToGRPC{})

	sendReceive := pipeline.NewStep[*meeting.MeetingRunningRequest, *meeting.MeetingRunningResponse]().SendReceive(&SendMeetingRunningRequest{client})

	transformToResponse := pipeline.NewStep[*meeting.MeetingRunningResponse, *meetingapi.Response]().Transform(&GRPCToResponse{})

	f1 := pipeline.Add(filterTransformGRPC.Flow(), sendReceive)
	f2 := pipeline.Add(f1, transformToResponse)

	return f2
}
