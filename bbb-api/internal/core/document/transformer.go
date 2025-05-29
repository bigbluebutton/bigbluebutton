package document

import (
	"context"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/common"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
)

type PresentationToMeetingRunning struct{}

func (p *PresentationToMeetingRunning) Transform(msg pipeline.Message[*Presentation]) (pipeline.Message[*meeting.MeetingRunningRequest], error) {
	pres := msg.Payload

	req := &meeting.MeetingRunningRequest{
		MeetingData: &common.MeetingData{
			MeetingId: pres.MeetingID,
		},
	}

	ctx := context.WithValue(msg.Context(), core.PresentationKey, pres)

	return pipeline.NewMessageWithContext(req, ctx), nil
}

type MeetingRunningToPresenation struct{}

func (m *MeetingRunningToPresenation) Transform(msg pipeline.Message[*meeting.MeetingRunningResponse]) (pipeline.Message[*Presentation], error) {
	pres := msg.Context().Value(core.PresentationKey).(*Presentation)
	return pipeline.NewMessage(pres), nil
}
