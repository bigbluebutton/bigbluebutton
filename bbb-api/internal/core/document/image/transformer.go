package image

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/document"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/document/config"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
)

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

// Transform converts an incoming [pipeline.Message] with a payload of type [document.Presentation]
// into an outgoing message with a payload of type [document.Presentation]. The output payload will use
// the image document as the parent file and have a single page that is the image document converted
// into a PDF.
func (t *PDFTransformer) Transform(msg pipeline.Message[*document.Presentation]) (pipeline.Message[*document.Presentation], error) {
	pres := msg.Payload
	timeout := t.cfg.Generation.SVG.Timeout
	svgDir := fmt.Sprintf("%s%csvgs", filepath.Dir(pres.FilePath), os.PathSeparator)
	pdfPath := fmt.Sprintf("%s%cslide-1.pdf", svgDir, os.PathSeparator)

	args := []string{
		fmt.Sprintf("%ds", timeout),
		"convert",
		pres.FilePath,
		"-auto-orient",
		pdfPath,
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(timeout)*time.Second)
	defer cancel()

	cmd := t.exec(ctx, document.RunInSystemdCommand, args...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		slog.Error("Failed to convert image to PDF", "source", pres.FilePath, "error", err, "output", output)
	}

	thumbnail, _ := pipeline.ContextValue[string](msg.Context(), ThumbnailPathKey)
	textFile, _ := pipeline.ContextValue[string](msg.Context(), TextFilePathKey)

	pages := []document.Page{
		{
			ParentFilePath: pres.FilePath,
			FilePath:       pdfPath,
			Num:            1,
			ThumbnailPath:  thumbnail,
			TextFilePath:   textFile,
		},
	}

	pres.Pages = pages

	return pipeline.NewMessageWithContext(pres, msg.Context()), nil
}
