package image

import (
	"context"
	"fmt"
	"image"
	"log/slog"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/config"
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/pdf"
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/presentation"
)

// FileWithAuxilliariesTransformer creates a respresentation of an image
// file that is ready for further processing by way of generation of
// auxilliary files based on the uploaded document.
type FileWithAuxilliariesTransformer struct {
	cfg        config.Config
	imgResizer presentation.ImageResizer
}

// NewFileWithAuxilliariesTransformer creates a new FileWithAuxilliariesTransformer using
// a default [presentation.ImageResizer] and the default global configuration.
func NewFileWithAuxilliariesTransformer() *FileWithAuxilliariesTransformer {
	return NewFileWithAuxilliariesTransformerWithResizerAndConfig(presentation.NewCMDIMageResizer(), config.DefaultConfig())
}

// NewFileWithAuxilliariesTransformerWithResizerAndConfig is like NewFileWithAuxilliariesTransformer but
// allows the caller to specify the [presentation.ImageResizer] and configuration that should be used.
func NewFileWithAuxilliariesTransformerWithResizerAndConfig(imgResizer presentation.ImageResizer, cfg config.Config) *FileWithAuxilliariesTransformer {
	return &FileWithAuxilliariesTransformer{
		cfg:        cfg,
		imgResizer: imgResizer,
	}
}

// Transform takes an incoming [pipeline.Message] with a payload of type [presentation.FileToProcess] and
// converts it into a [FileWithAuxilliaries] that is used for further processing. During the transformation
// if it is determined that the dimensions of the image document are too large based on the constraints
// defined in the provided configuration an attempt will be made to resize the image to maximum dimensions
// allowed by the configuration.
func (t *FileWithAuxilliariesTransformer) Transform(msg pipeline.Message[*presentation.FileToProcess]) (pipeline.Message[*FileWithAuxilliaries], error) {
	file, err := os.Open(msg.Payload.File)
	if err != nil {
		return pipeline.Message[*FileWithAuxilliaries]{}, fmt.Errorf("failed to open file: %w", err)
	}
	defer file.Close()

	imgCfg, _, err := image.DecodeConfig(file)
	if err != nil {
		return pipeline.Message[*FileWithAuxilliaries]{}, fmt.Errorf("failed to decode image config: %w", err)
	}

	var (
		maxWidth   int  = t.cfg.Processing.Image.MaxWidth
		maxHeight  int  = t.cfg.Processing.Image.MaxHeight
		imgTooWide bool = imgCfg.Width > maxWidth
		imgTooTall bool = imgCfg.Height > maxHeight
	)

	if imgTooWide || imgTooTall {
		resizeErr := t.imgResizer.Resize(msg.Payload.File, fmt.Sprintf("%dx%d", maxWidth, maxHeight))
		if resizeErr != nil {
			return pipeline.Message[*FileWithAuxilliaries]{}, fmt.Errorf("failed to resize image: %w", resizeErr)
		}
	}

	return pipeline.NewMessageWithContext(&FileWithAuxilliaries{
		ID:   msg.Payload.ID,
		File: msg.Payload.File,
	}, msg.Context()), nil
}

// PDFTransformer carries out the transformation of an image
// document to a PDF.
type PDFTransformer struct {
	cfg  config.Config
	exec func(ctx context.Context, name string, args ...string) *exec.Cmd
}

// NewPDFTransformer creates a new PDFTransformer using the default
// global configuration.
func NewPDFTransformer() *PDFTransformer {
	return NewPDFTransformerWithConfig(config.DefaultConfig())
}

// NewPDFTransformerWithConfig is like NewPDFTransformer but allows the
// caller to specify the configuration that should be used.
func NewPDFTransformerWithConfig(cfg config.Config) *PDFTransformer {
	return &PDFTransformer{
		cfg:  cfg,
		exec: exec.CommandContext,
	}
}

// Transform converts an incoming [pipeline.Message] with a payload of type [FileWithAuxilliaries]
// into an outgoing message with a payload of type [pdf.FileWithPages]. The output payload will use
// the image document as the parent file and have a single page that is the image document converted
// into a PDF.
func (t *PDFTransformer) Transform(msg pipeline.Message[*FileWithAuxilliaries]) (pipeline.Message[*pdf.FileWithPages], error) {
	timeout := t.cfg.Generation.SVG.Timeout
	svgDir := fmt.Sprintf("%s%csvgs", filepath.Dir(msg.Payload.File), os.PathSeparator)
	pdfPath := fmt.Sprintf("%s%cslide-1.pdf", svgDir, os.PathSeparator)

	args := []string{
		fmt.Sprintf("%ds", timeout),
		"convert",
		msg.Payload.File,
		"-auto-orient",
		pdfPath,
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(timeout)*time.Second)
	defer cancel()

	cmd := t.exec(ctx, "timeout", args...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		slog.Error("Failed to convert image to PDF", "source", msg.Payload.File, "error", err, "output", output)
	}

	return pipeline.NewMessageWithContext(&pdf.FileWithPages{
		ID:   msg.Payload.ID,
		File: msg.Payload.File,
		Pages: []*pdf.Page{
			{
				ParentFile: msg.Payload.File,
				File:       pdfPath,
				Num:        1,
				Thumbnail:  msg.Payload.Thumnail,
				TextFile:   msg.Payload.TextFile,
				SVG:        msg.Payload.SVG,
				PNG:        msg.Payload.PNG,
			},
		},
	}, msg.Context()), nil
}
