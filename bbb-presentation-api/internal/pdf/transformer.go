package pdf

import (
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/presentation"
)

type ProcessedTransformer struct{}

func (t *ProcessedTransformer) Transform(msg pipeline.Message[*FileWithPages]) (pipeline.Message[*presentation.ProcessedFile], error) {
	return pipeline.NewMessageWithContext(&presentation.ProcessedFile{
		ID:   msg.Payload.ID,
		File: msg.Payload.File,
	}, msg.Context()), nil
}
