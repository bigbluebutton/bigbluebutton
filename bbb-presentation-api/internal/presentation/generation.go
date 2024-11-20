package presentation

import (
	"context"
	"fmt"
	"os/exec"
)

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
