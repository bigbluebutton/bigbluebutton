package presentation

import (
	"context"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/common"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/document"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
)

// PresentationToMeetingRunning is a pipeline.Transformer
// implementation for transforming a [Presentation] into
// a [MeetingRunningRequest].
type PresentationToMeetingRunning struct{}

// Transform takes a [Presentation] and builds a
// [MeetingRunningRequest] for the meeting associated
// with the [Presentation].
func (p *PresentationToMeetingRunning) Transform(msg pipeline.Message[*document.Presentation]) (pipeline.Message[*meeting.MeetingRunningRequest], error) {
	pres := msg.Payload

	req := &meeting.MeetingRunningRequest{
		MeetingData: &common.MeetingData{
			MeetingId: pres.MeetingID,
		},
	}

	ctx := context.WithValue(msg.Context(), core.PresentationKey, pres)

	return pipeline.NewMessageWithContext(req, ctx), nil
}

// MeetingRunningToPresenation is a pipeline.Transformer
// implementation for transforming a [MeetingRunningResponse]
// into a [Presentation]
type MeetingRunningToPresenation struct{}

// Transform takes a [MeetingRunningResponse] and extracts
// the presentation stored in the message's context.
func (m *MeetingRunningToPresenation) Transform(msg pipeline.Message[*meeting.MeetingRunningResponse]) (pipeline.Message[*document.Presentation], error) {
	pres := msg.Context().Value(core.PresentationKey).(*document.Presentation)
	return pipeline.NewMessage(pres), nil
}

type NoOpTransformer struct{}

func (n *NoOpTransformer) Transform(msg pipeline.Message[*document.Presentation]) (pipeline.Message[*document.Presentation], error) {
	return msg, nil
}
