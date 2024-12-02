package office

import (
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/config"
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/pdf"
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/presentation"
)

// NewOfficeFlow creates a [pipeline.Flow] for handling the processing of an uploaded MS Office document. The uploaded document is validated
// and then converted into a PDF. After conversion is completed the office flow is merged into the flow provided by the PDF package for
// further processing.
func NewOfficeFlow(cfg config.Config, processor presentation.PageProcessor) pipeline.Flow[*FileToConvert, *presentation.ProcessedFile] {
	filterTransformToPDF := pipeline.NewStep[*FileToConvert, *presentation.FileToProcess]().
		Filter(NewConversionFilter()).Transform(NewPDFTransformerWithConfig(cfg))
	pdfFlow := pdf.NewPDFFlow(cfg, processor)
	return pipeline.Merge(filterTransformToPDF.Flow(), pdfFlow)
}
