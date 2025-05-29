package document

import (
	"fmt"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/document/config"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/responses"
)

type MeetingRunningFilter struct{}

func (f *MeetingRunningFilter) Filter(msg pipeline.Message[*meeting.MeetingRunningResponse]) error {
	if !msg.Payload.MeetingRunning.IsRunning {
		return core.NewBBBError(responses.MeetingNotFoundKey, responses.MeetingNotFoundMsg)
	}
	return nil
}

type PresentationFilter struct {
	scanner Scanner
}

func (f *PresentationFilter) Filter(msg pipeline.Message[*Presentation]) error {
	pres := msg.Payload

	_, ext := SplitFileName(pres.FilePath)

	ct, err := ContentType(pres.FilePath)
	if err != nil {
		return err
	}

	if verr := ValidateContentType(ct, ext); verr != nil {
		return fmt.Errorf("unsupported content type %s: %w", ct, verr)
	}

	cfg := config.DefaultConfig()

	if !cfg.Validation.Scan {
		return nil
	}

	resp, err := f.scanner.Scan(pres.FilePath)
	if err != nil {
		return fmt.Errorf("file scan returned with bad result: %s", resp)
	}

	return nil
}
