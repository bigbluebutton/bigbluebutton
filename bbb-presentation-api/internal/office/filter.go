package office

import (
	"context"
	"fmt"
	"log/slog"
	"os/exec"
	"path/filepath"
	"strconv"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/config"
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/presentation"
)

type ConversionFilter struct {
	cfg  config.Config
	exec func(ctx context.Context, name string, args ...string) *exec.Cmd
}

func NewConversionFilter() *ConversionFilter {
	return NewConversionFilterWithConfig(config.DefaultConfig())
}

func NewConversionFilterWithConfig(cfg config.Config) *ConversionFilter {
	return &ConversionFilter{
		cfg:  cfg,
		exec: exec.CommandContext,
	}
}

func (f *ConversionFilter) Filter(msg pipeline.Message[*FileToConvert]) error {
	inFile := msg.Payload.InFile
	outFile := msg.Payload.OutFile

	var (
		officefile = presentation.IsOfficeFile(presentation.ToFileExt(filepath.Ext(inFile)))
		pdf        = presentation.IsPDF(presentation.ToFileExt(filepath.Ext(outFile)))
	)

	if !officefile {
		return fmt.Errorf("input file %s is not an office file", inFile)
	}

	if !pdf {
		return fmt.Errorf("output file %s is not a PDF", outFile)
	}

	if f.cfg.Validation.Office.SkipPrecheck {
		return nil
	}

	script := f.cfg.Validation.Office.Script
	timeout := f.cfg.Validation.Office.Timeout
	execTimeout := f.cfg.Validation.Office.ExecTimeout

	p := &powerPointToValidate{
		file:        inFile,
		script:      script,
		timeout:     timeout,
		execTimeout: execTimeout,
		exec:        f.exec,
	}

	err := validatePowerPoint(p)
	if err != nil {
		slog.Error("PowerPoint validation failed", "error", err)
		return fmt.Errorf("powerpoint file is not valid")
	}

	return nil
}

type powerPointToValidate struct {
	file        string
	script      string
	timeout     int
	execTimeout int
	exec        func(ctx context.Context, name string, args ...string) *exec.Cmd
}

func validatePowerPoint(p *powerPointToValidate) error {
	isPpt := presentation.ToFileExt(filepath.Ext(p.file)) == presentation.ExtPptx
	if !isPpt {
		return nil
	}

	args := []string{
		strconv.Itoa(p.timeout),
		p.script,
		p.file,
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(p.execTimeout)*time.Second)
	defer cancel()

	cmd := p.exec(ctx, "timeout", args...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("validation failed: %w, output: %s", err, string(output))
	}

	return nil
}
