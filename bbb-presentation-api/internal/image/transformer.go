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

type FileWithAuxilliariesTransformer struct {
	cfg        config.Config
	imgResizer presentation.ImageResizer
}

func NewFileWithAuxilliariesTransformer() *FileWithAuxilliariesTransformer {
	return NewFileWithAuxilliariesTransformerWithResizerAndConfig(presentation.NewCMDIMageResizer(), config.DefaultConfig())
}

func NewFileWithAuxilliariesTransformerWithResizerAndConfig(imgResizer presentation.ImageResizer, cfg config.Config) *FileWithAuxilliariesTransformer {
	return &FileWithAuxilliariesTransformer{
		cfg:        cfg,
		imgResizer: imgResizer,
	}
}

func (t *FileWithAuxilliariesTransformer) Transform(msg pipeline.Message[*presentation.FileToProcess]) (pipeline.Message[*FileWithAuxilliaries], error) {
	file, err := os.Open(msg.Payload.File)
	if err != nil {
		return pipeline.Message[*FileWithAuxilliaries]{}, fmt.Errorf("failed to open file: %w", err)
	}

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

type PDFTransformer struct {
	cfg  config.Config
	exec func(ctx context.Context, name string, args ...string) *exec.Cmd
}

func NewPDFTransformer() *PDFTransformer {
	return NewPDFTransformerWithConfig(config.DefaultConfig())
}

func NewPDFTransformerWithConfig(cfg config.Config) *PDFTransformer {
	return &PDFTransformer{
		cfg:  cfg,
		exec: exec.CommandContext,
	}
}

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
