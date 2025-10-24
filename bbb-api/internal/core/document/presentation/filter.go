package presentation

import (
	"fmt"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/document"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/document/config"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/responses"
)

// MeetingRunningFilter is a pipeline.Filter implementation
// for checking the running status of a given meeting.
type MeetingRunningFilter struct{}

// Filter returns an error if the meeting associated with the
// provided [MeetingRunningResponse] is no longer running.
func (f *MeetingRunningFilter) Filter(msg pipeline.Message[*meeting.MeetingRunningResponse]) error {
	if !msg.Payload.MeetingRunning.IsRunning {
		return core.NewBBBError(responses.MeetingNotFoundKey, responses.MeetingNotFoundMsg)
	}
	return nil
}

// PresentationFilter is a pipeline.Filter implementation used for
// validating uploaded presentations before they enter the document
// conversion pipeline.
type PresentationFilter struct {
	scanner document.Scanner
}

// Filer verfifies that the provided presentation is valid. A valid
// presentation must have a proper content types that corresponds to
// the presentation's file extension. The presentation may also be
// scanner for malware is the setting is enabled in the document
// processing configuration.
func (f *PresentationFilter) Filter(msg pipeline.Message[*document.Presentation]) error {
	pres := msg.Payload

	_, ext := document.SplitFileName(pres.FilePath)

	ct, err := document.ContentType(pres.FilePath)
	if err != nil {
		return err
	}

	if verr := document.ValidateContentType(ct, ext); verr != nil {
		return fmt.Errorf("unsupported content type %s: %w", ct, verr)
	}

	cfg := config.DefaultConfig()

	if !cfg.Validation.Scan {
		return nil
	}

	if f.scanner == nil {
		return fmt.Errorf("no scanner implementation provided")
	}

	resp, err := f.scanner.Scan(pres.FilePath)
	if err != nil {
		return fmt.Errorf("file scan returned with bad result: %s", resp)
	}

	return nil
}
