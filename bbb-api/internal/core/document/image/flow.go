package image

import (
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/document"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/document/config"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/document/pdf"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
)

// NewImageFlow creates a [pipeline.Flow] for handling the processing of an uploaded image document. If necessary, a download marker is generated
// for the file. A thumbnail and text file is then generated for the document which is then converted into a PDF for further processing. If required,
// an SVG and PNG will be generated from the PDF.
func NewImageFlow(imgResizer document.ImageResizer, cfg config.Config) pipeline.Flow[*document.Presentation, *document.Presentation] {
	generateDownloadMarker := pipeline.NewStep[*document.Presentation, *document.Presentation]().Generate(&DownloadMarkerGenerator{})
	generateThumbnail := pipeline.NewStep[*document.Presentation, *document.Presentation]().Generate(NewThumbnailGeneratorWithConfig(cfg))
	generateTextFile := pipeline.NewStep[*document.Presentation, *document.Presentation]().Generate(&TextFileGenerator{})
	transformToPDF := pipeline.NewStep[*document.Presentation, *document.Presentation]().Transform(NewPDFTransformerWithConfig(cfg))
	generateSVG := pipeline.NewStep[*document.Presentation, *document.Presentation]().Generate(pdf.NewSVGGenerator(pdf.WithSVGConfig(cfg)))
	generatePNG := pipeline.NewStep[*document.Presentation, *document.Presentation]().Generate(pdf.NewPNGGenerator(pdf.WithPNGConfig(cfg)))

	f1 := pipeline.Add(generateDownloadMarker.Flow(), generateThumbnail)
	f2 := pipeline.Add(f1, generateTextFile)
	f3 := pipeline.Add(f2, transformToPDF)
	f4 := pipeline.Add(f3, generateSVG)
	f5 := pipeline.Add(f4, generateSVG)
	f6 := pipeline.Add(f5, generatePNG)

	return f6
}
