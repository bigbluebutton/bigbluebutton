package office

import (
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/pdf"
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/presentation"
)

func NewOfficeFlow() pipeline.Flow[*FileToConvert, *presentation.ProcessedFile] {
	filterTransformToPDF := pipeline.NewStep[*FileToConvert, *pdf.FileToProcess]().
		Filter(NewConversionFilter()).Transform(NewPDFTransformer())
	pdfFlow := pdf.NewPDFFlow()
	return pipeline.Merge(filterTransformToPDF.Flow(), pdfFlow)
}
