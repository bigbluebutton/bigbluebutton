package pdf

import (
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/config"
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/presentation"
)

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
