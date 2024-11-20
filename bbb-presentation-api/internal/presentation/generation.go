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

type GenerationProcess interface {
	Resolution(resolution int) GenerationProcess
	Format(format GenerationProcessFormat) GenerationProcess
	SingleFile() GenerationProcess
	Rasterize(width int) GenerationProcess
	Pages(start, end int) GenerationProcess
	InputOutput(inFile, OutFile string) GenerationProcess
	Analyze(file string) GenerationProcess
	Execute(exec func(ctx context.Context, name string, args ...string) *exec.Cmd, timeout int, ctx context.Context) *exec.Cmd
}

type GenerationProcessImpl string

type GenerationProcessFormat string

type PDFToCairoGenerationProcess struct {
	cmd         string
	analysisCmd string
}

func NewGenerationProcess(impl GenerationProcessImpl) GenerationProcess {
	switch impl {
	case GenerationProcessPDFToCairo:
		return &PDFToCairoGenerationProcess{
			cmd: "pdftocairo",
		}
	default:
		return nil
	}
}

func (p *PDFToCairoGenerationProcess) Resolution(resolution int) GenerationProcess {
	p.cmd = fmt.Sprintf("%s -r %d ", p.cmd, resolution)
	return p
}
func (p *PDFToCairoGenerationProcess) Format(format GenerationProcessFormat) GenerationProcess {
	p.cmd = fmt.Sprintf("%s %s", p.cmd, format)
	return p
}

func (p *PDFToCairoGenerationProcess) SingleFile() GenerationProcess {
	p.cmd = fmt.Sprintf("%s -singefile", p.cmd)
	return p
}

func (p *PDFToCairoGenerationProcess) Rasterize(width int) GenerationProcess {
	p.cmd = fmt.Sprintf("%s -scale-to-x %d -scale-to-y -1", p.cmd, width)
	return p
}
func (p *PDFToCairoGenerationProcess) Pages(start, end int) GenerationProcess {
	p.cmd = fmt.Sprintf("%s -q -f %d -l %d", p.cmd, start, end)
	return p
}

func (p *PDFToCairoGenerationProcess) InputOutput(inFile, outFile string) GenerationProcess {
	p.cmd = fmt.Sprintf("%s %s %s", p.cmd, inFile, outFile)
	return p
}

func (p *PDFToCairoGenerationProcess) Analyze(file string) GenerationProcess {
	p.analysisCmd = fmt.Sprintf("&& cat %s | egrep 'data:image/png;base64|<path' | sed 's/  / /g' | cut -d' ' -f 1 | sort | uniq -cw 2", file)
	return p
}

func (p *PDFToCairoGenerationProcess) Execute(exec func(ctx context.Context, name string, args ...string) *exec.Cmd, timeout int, ctx context.Context) *exec.Cmd {
	finalCmd := fmt.Sprintf("%s %s", p.cmd, p.analysisCmd)
	args := []string{
		fmt.Sprintf("%ds", timeout),
		"/bin/sh",
		"-c",
		finalCmd,
	}
	return exec(ctx, "timeout", args...)
}
