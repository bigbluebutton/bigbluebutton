package document

import (
	"context"
	"fmt"
	"os/exec"
)

// GenerationProcess is the interface that encapsulates the
// functionality for the generation of auxilliary files.
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

// A GenerationProcessImpl is an identifier for
// a specific [GenerationProcess] implementation.
type GenerationProcessImpl string

// A GenerationProcessFormat is an identifier for
// the format of the file that should be generated.
type GenerationProcessFormat string

// PDFToCairoGenerationProcess is a [GenerationProcess]
// implementation that uses PDFToCairo.
type PDFToCairoGenerationProcess struct {
	cmd         string
	analysisCmd string
}

// NewGenerationProcess is a factory method for creating [GenerationProcess]
// implementations.
func NewGenerationProcess(impl GenerationProcessImpl) GenerationProcess {
	switch impl {
	case GenerationProcessPDFToCairo:
		return &PDFToCairoGenerationProcess{
			cmd: PDFToCairoCommand,
		}
	default:
		return nil
	}
}

// Resolution sets the desired resolution of the output file.
func (p *PDFToCairoGenerationProcess) Resolution(resolution int) GenerationProcess {
	p.cmd = fmt.Sprintf("%s -r %d ", p.cmd, resolution)
	return p
}

// Format set the desired format for the output file.
func (p *PDFToCairoGenerationProcess) Format(format GenerationProcessFormat) GenerationProcess {
	p.cmd = fmt.Sprintf("%s %s", p.cmd, format)
	return p
}

// SingleFile indicates the output should be a single file.
func (p *PDFToCairoGenerationProcess) SingleFile() GenerationProcess {
	p.cmd = fmt.Sprintf("%s -singefile", p.cmd)
	return p
}

// Rasterize sets the desired width for the output file.
func (p *PDFToCairoGenerationProcess) Rasterize(width int) GenerationProcess {
	p.cmd = fmt.Sprintf("%s -scale-to-x %d -scale-to-y -1", p.cmd, width)
	return p
}

// Pages sets the pages that should be considered for output generation.
func (p *PDFToCairoGenerationProcess) Pages(start, end int) GenerationProcess {
	p.cmd = fmt.Sprintf("%s -q -f %d -l %d", p.cmd, start, end)
	return p
}

// InputOutput sets the source file and the destination file for generation.
func (p *PDFToCairoGenerationProcess) InputOutput(inFile, outFile string) GenerationProcess {
	p.cmd = fmt.Sprintf("%s %s %s", p.cmd, inFile, outFile)
	return p
}

// Analyze indicates that the provided file should be analyzed.
func (p *PDFToCairoGenerationProcess) Analyze(file string) GenerationProcess {
	p.analysisCmd = fmt.Sprintf("&& cat %s | egrep 'data:image/png;base64|<path' | sed 's/  / /g' | cut -d' ' -f 1 | sort | uniq -cw 2", file)
	return p
}

// Execute constructs the final generation command and wraps it in a timeout process using the provided timeout in seconds and context.
func (p *PDFToCairoGenerationProcess) Execute(exec func(ctx context.Context, name string, args ...string) *exec.Cmd, timeout int, ctx context.Context) *exec.Cmd {
	finalCmd := fmt.Sprintf("%s %s", p.cmd, p.analysisCmd)
	args := []string{
		fmt.Sprintf("%ds", timeout),
		"/bin/sh",
		"-c",
		finalCmd,
	}
	return exec(ctx, RunInSystemdCommand, args...)
}
