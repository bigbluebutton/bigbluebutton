package document

import (
	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
)

func NewDocumentFlow(client Client, fileExtension string) pipeline.Flow[*Presentation, *Presentation] {
	transformToMeetingRunning := pipeline.NewStep[*Presentation, *meeting.MeetingRunningRequest]().Transform(&PresentationToMeetingRunning{})
	sendReceiveMeetingRunning := pipeline.NewStep[*meeting.MeetingRunningRequest, *meeting.MeetingRunningResponse]().SendReceive(&SendMeetingRunningRequest{})
	filterTransformToPresentation := pipeline.NewStep[*meeting.MeetingRunningResponse, *Presentation]().Filter(&MeetingRunningFilter{}).Transform(&MeetingRunningToPresenation{})
	filterPresentation := pipeline.NewStep[*Presentation, *Presentation]().Filter(nil).Transform(nil)

	f1 := pipeline.Add(transformToMeetingRunning.Flow(), sendReceiveMeetingRunning)
	f2 := pipeline.Add(f1, filterTransformToPresentation)
	f3 := pipeline.Add(f2, filterPresentation)
	return f3
}
