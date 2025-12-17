package office

import (
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/document"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/document/config"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/document/pdf"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
)

// NewOfficeFlow creates a [pipeline.Flow] for handling the processing of an uploaded MS Office document. The uploaded document is validated
// and then converted into a PDF. After conversion is completed the office flow is merged into the flow provided by the PDF package for
// further processing.
func NewOfficeFlow(cfg config.Config, processor document.PageProcessor) pipeline.Flow[*document.Presentation, *document.Presentation] {
	filterTransformToPDF := pipeline.NewStep[*document.Presentation, *document.Presentation]().
		Filter(NewConversionFilter()).Transform(NewPDFTransformerWithConfig(cfg))
	pdfFlow := pdf.NewPDFFlow(cfg, processor)
	return pipeline.Merge(filterTransformToPDF.Flow(), pdfFlow)
}
