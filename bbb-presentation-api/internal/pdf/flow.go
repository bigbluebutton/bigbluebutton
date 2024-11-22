package pdf

import (
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/config"
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/presentation"
)

// NewPDFFlow creates a [pipeline.Flow] for handling the processing of an uploaded PDF. If necessary, a download marker is generated
// for the file followed by the generation of individual single page PDFs from each of the pages in the uploaded PDF. Thumbanails and
// text files are then generated from each of the page files. If required, an SVG and PNG will also be generated for each page as
// well.
func NewPDFFlow(cfg config.Config, processor presentation.PageProcessor) pipeline.Flow[*FileToProcess, *presentation.ProcessedFile] {
	generateDownloadMarker := pipeline.NewStep[*FileToProcess, *FileToProcess]().Generate(&DownloadMarkerGenerator{})
	generatePages := pipeline.NewStep[*FileToProcess, *FileWithPages]().Generate(NewPageGeneratorWithProcessorAndConfig(processor, cfg))
	generateThumbnails := pipeline.NewStep[*FileWithPages, *FileWithPages]().Generate(NewThumbnailGeneratorWithConfig(cfg))
	generateTextFiles := pipeline.NewStep[*FileWithPages, *FileWithPages]().Generate(NewTextFileGeneratorWithConfig(cfg))
	generateSVGs := pipeline.NewStep[*FileWithPages, *FileWithPages]().Generate(NewSVGGeneratorWithConfig(cfg))
	generatePNGs := pipeline.NewStep[*FileWithPages, *FileWithPages]().Generate(NewPNGGeneratorWithConfig(cfg))
	transformToProcessed := pipeline.NewStep[*FileWithPages, *presentation.ProcessedFile]().Transform(&ProcessedTransformer{})

	f1 := pipeline.Add(generateDownloadMarker.Flow(), generatePages)
	f2 := pipeline.Add(f1, generateThumbnails)
	f3 := pipeline.Add(f2, generateTextFiles)
	f4 := pipeline.Add(f3, generateSVGs)
	f5 := pipeline.Add(f4, generatePNGs)
	f6 := pipeline.Add(f5, transformToProcessed)

	return f6
}
