package image

import (
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/config"
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/pdf"
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/presentation"
)

// NewImageFlow creates a [pipeline.Flow] for handling the processing of an uploaded image document. If necessary, a download marker is generated
// for the file. A thumbnail and text file is then generated for the document which is then converted into a PDF for further processing. If required,
// an SVG and PNG will be generated from the PDF.
func NewImageFlow(imgResizer presentation.ImageResizer, cfg config.Config) pipeline.Flow[*presentation.FileToProcess, *presentation.ProcessedFile] {
	generateDownloadMarker := pipeline.NewStep[*presentation.FileToProcess, *presentation.FileToProcess]().Generate(&DownloadMarkerGenerator{})
	trasnformToFileWithAuxilliaries := pipeline.NewStep[*presentation.FileToProcess, *FileWithAuxilliaries]().Transform(NewFileWithAuxilliariesTransformerWithResizerAndConfig(imgResizer, cfg))
	generateThumbnail := pipeline.NewStep[*FileWithAuxilliaries, *FileWithAuxilliaries]().Generate(NewThumbnailGeneratorWithConfig(cfg))
	generateTextFile := pipeline.NewStep[*FileWithAuxilliaries, *FileWithAuxilliaries]().Generate(&TextFileGenerator{})
	transformToPDF := pipeline.NewStep[*FileWithAuxilliaries, *pdf.FileWithPages]().Transform(NewPDFTransformerWithConfig(cfg))
	generateSVG := pipeline.NewStep[*pdf.FileWithPages, *pdf.FileWithPages]().Generate(pdf.NewSVGGeneratorWithConfig(cfg))
	generatePNG := pipeline.NewStep[*pdf.FileWithPages, *pdf.FileWithPages]().Generate(pdf.NewPNGGeneratorWithConfig(cfg))
	transformToProcessed := pipeline.NewStep[*pdf.FileWithPages, *presentation.ProcessedFile]().Transform(&pdf.ProcessedTransformer{})

	f1 := pipeline.Add(generateDownloadMarker.Flow(), trasnformToFileWithAuxilliaries)
	f2 := pipeline.Add(f1, generateThumbnail)
	f3 := pipeline.Add(f2, generateTextFile)
	f4 := pipeline.Add(f3, transformToPDF)
	f5 := pipeline.Add(f4, generateSVG)
	f6 := pipeline.Add(f5, generatePNG)
	f7 := pipeline.Add(f6, transformToProcessed)

	return f7
}
