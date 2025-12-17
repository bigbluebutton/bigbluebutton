package pdf

import (
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/document"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/document/config"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
)

// NewPDFFlow creates a [pipeline.Flow] for handling the processing of an uploaded PDF. If necessary, a download marker is generated
// for the file followed by the generation of individual single page PDFs from each of the pages in the uploaded PDF. Thumbnails and
// text files are then generated from each of the page files. If required, an SVG and PNG will also be generated for each page as
// well.
func NewPDFFlow(cfg config.Config, processor document.PageProcessor) pipeline.Flow[*document.Presentation, *document.Presentation] {
	generateDownloadMarker := pipeline.NewStep[*document.Presentation, *document.Presentation]().Generate(&DownloadMarkerGenerator{})
	generatePages := pipeline.NewStep[*document.Presentation, *document.Presentation]().Generate(NewPageGenerator(WithPageConfig(cfg), WithPageProcessor(processor)))
	generateThumbnails := pipeline.NewStep[*document.Presentation, *document.Presentation]().Generate(NewThumbnailGenerator(WithThumbnailConfig(cfg)))
	generateTextFiles := pipeline.NewStep[*document.Presentation, *document.Presentation]().Generate(NewTextFileGenerator(WithTextFileConfig(cfg)))
	generateSVGs := pipeline.NewStep[*document.Presentation, *document.Presentation]().Generate(NewSVGGenerator(WithSVGConfig(cfg)))
	generatePNGs := pipeline.NewStep[*document.Presentation, *document.Presentation]().Generate(NewPNGGenerator(WithPNGConfig(cfg)))

	f1 := pipeline.Add(generateDownloadMarker.Flow(), generatePages)
	f2 := pipeline.Add(f1, generateThumbnails)
	f3 := pipeline.Add(f2, generateTextFiles)
	f4 := pipeline.Add(f3, generateSVGs)
	f5 := pipeline.Add(f4, generatePNGs)

	return f5
}
