package presentation

import (
	"path/filepath"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/gen/meeting"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/document"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/document/config"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/document/image"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/document/office"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/document/pdf"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
)

// NewPresentationFlow creates a [pipeline.Flow] for handling presentation conversion. Validation is performed
// to ensure that the meeting associated with the uploaded document is currently running. If the meeting
// is running, validation is then performed on the document. If the document passes validation this flow
// will be merged with one of the flows provided by either the image, office, or pdf packages for further processing.
func NewPresentationFlow(client document.Client) pipeline.Flow[*document.Presentation, *document.Presentation] {
	transformToMeetingRunning := pipeline.NewStep[*document.Presentation, *meeting.MeetingRunningRequest]().Transform(&PresentationToMeetingRunning{})
	sendReceiveMeetingRunning := pipeline.NewStep[*meeting.MeetingRunningRequest, *meeting.MeetingRunningResponse]().SendReceive(&SendMeetingRunningRequest{})
	filterTransformToPresentation := pipeline.NewStep[*meeting.MeetingRunningResponse, *document.Presentation]().Filter(&MeetingRunningFilter{}).Transform(&MeetingRunningToPresenation{})
	filterPresentation := pipeline.NewStep[*document.Presentation, *document.Presentation]().Filter(&PresentationFilter{}).Transform(&NoOpTransformer{})

	f1 := pipeline.Add(transformToMeetingRunning.Flow(), sendReceiveMeetingRunning)
	f2 := pipeline.Add(f1, filterTransformToPresentation)
	f3 := pipeline.Add(f2, filterPresentation)

	cfg := config.DefaultConfig()
	processor := document.NewPDFPageProcessor()

	decide := func(msg pipeline.Message[*document.Presentation]) pipeline.Flow[*document.Presentation, *document.Presentation] {
		ext := filepath.Ext(msg.Payload.FilePath)
		if document.IsImageFile(ext) {
			return image.NewImageFlow(document.NewCMDIMageResizerWithConfig(cfg), cfg)
		} else if document.IsOfficeFile(ext) {
			return office.NewOfficeFlow(cfg, processor)
		} else {
			return pdf.NewPDFFlow(cfg, processor)
		}
	}

	return pipeline.Branch(decide, f3)
}
