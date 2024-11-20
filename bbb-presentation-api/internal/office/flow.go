package office

import (
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/config"
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/pdf"
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/presentation"
)

func NewOfficeFlow(cfg config.Config, processor presentation.PageProcessor) pipeline.Flow[*FileToConvert, *presentation.ProcessedFile] {
	filterTransformToPDF := pipeline.NewStep[*FileToConvert, *pdf.FileToProcess]().
		Filter(NewConversionFilter()).Transform(NewPDFTransformerWithConfig(cfg))
	pdfFlow := pdf.NewPDFFlow(cfg, processor)
	return pipeline.Merge(filterTransformToPDF.Flow(), pdfFlow)
}
