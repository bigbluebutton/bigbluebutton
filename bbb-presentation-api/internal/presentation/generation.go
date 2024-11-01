package presentation

import (
	"context"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/config"
)

type ThumbnailGenerator interface {
	GenerateThumbnail(source string, dest string) error
}

type TextFileGenerator interface {
	GenerateTextFile() error
}

type SVGGenerator interface {
	GenerateSVG() error
}

type PNGGenerator interface {
	GeneratePNG() error
}

type PageGenerator interface {
	ThumbnailGenerator
	TextFileGenerator
	SVGGenerator
	PNGGenerator
}

type ExecThumbnailGenerator struct {
	imageMagickDir  string
	timeout         int
	imageMagickExec func(ctx context.Context, name string, args ...string) *exec.Cmd
	pdfToCairoExec  func(ctx context.Context, name string, args ...string) *exec.Cmd
}

func NewExecThumbnailGenerator() *ExecThumbnailGenerator {
	return NewExecThumbnailGeneratorWithConfig(config.DefaultConfig())
}

func NewExecThumbnailGeneratorWithConfig(config *config.Config) *ExecThumbnailGenerator {
	return &ExecThumbnailGenerator{
		imageMagickDir:  config.Generation.Thumbnail.ImageMagickDir,
		timeout:         config.Generation.Thumbnail.Timeout,
		imageMagickExec: exec.CommandContext,
		pdfToCairoExec:  exec.CommandContext,
	}
}

func (g *ExecThumbnailGenerator) GenerateThumbnail(source string, dest string) error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(g.timeout)*time.Second)
	defer cancel()

	ext := ToFileExt(filepath.Ext(source))

	if IsImageFile(ext) {
		args := []string{
			"-thumbnail",
			"150x150",
			source,
			dest,
		}

		cmd := g.imageMagickExec(ctx, fmt.Sprintf("%s%cconvert", g.imageMagickDir, os.PathSeparator), args...)
		output, err := cmd.CombinedOutput()
		if err != nil {
			return fmt.Errorf("imageMagick error: %v, output: %s", err, string(output))
		}
	} else if IsPDF(ext) {
		args := []string{
			"-png",
			"-scale-to",
			"150",
			"-cropbox",
			source,
			dest,
		}

		cmd := g.pdfToCairoExec(ctx, "pdftocairo", args...)
		output, err := cmd.CombinedOutput()
		if err != nil {
			return fmt.Errorf("imageMagick error: %v, output: %s", err, string(output))
		}
	} else {
		return errors.New("source file must be either an image or a PDF")
	}

	return nil
}
