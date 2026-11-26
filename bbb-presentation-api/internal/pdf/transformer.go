package pdf

import (
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/presentation"
)

// ProcessedTransformer is used to create a [presentation.ProcessedFile]
// that indciates the completion of document processing.
type ProcessedTransformer struct{}

// Transform converts an incoming [pipeline.Message] with a payload of type [FileWithPages] to
// a message with a payload of type [presentation.ProcessedFile].
func (t *ProcessedTransformer) Transform(msg pipeline.Message[*FileWithPages]) (pipeline.Message[*presentation.ProcessedFile], error) {
	return pipeline.NewMessageWithContext(&presentation.ProcessedFile{
		ID:   msg.Payload.ID,
		File: msg.Payload.File,
	}, msg.Context()), nil
}
