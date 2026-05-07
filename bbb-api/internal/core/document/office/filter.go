package office

import (
	"context"
	"fmt"
	"log/slog"
	"os/exec"
	"path/filepath"
	"strconv"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/document"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/document/config"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
)

// ConversionFilter handles the validation of incoming documents to ensure they
// are appropriate for conversion to PDF.
type ConversionFilter struct {
	cfg  config.Config
	exec func(ctx context.Context, name string, args ...string) *exec.Cmd
}

// NewConversionFilter creates a new [ConversionFilter] using the global default
// configuration.
func NewConversionFilter() *ConversionFilter {
	return NewConversionFilterWithConfig(config.DefaultConfig())
}

// NewConversionFilter is like NewConversionFilter but allows the caller to specify the
// configuration that should be used.
func NewConversionFilterWithConfig(cfg config.Config) *ConversionFilter {
	return &ConversionFilter{
		cfg:  cfg,
		exec: exec.CommandContext,
	}
}

// Filter will validate an incoming [pipeline.Message] with a payload of type [document.Presentation]
// to verify that the conversion process can proceed. These checks include verifying that the
// input file is a MS Office document and additional validation logic
// if the input document is a PowerPoint.
func (f *ConversionFilter) Filter(msg pipeline.Message[*document.Presentation]) error {
	inFile := msg.Payload.FilePath

	if !document.IsOfficeFile(filepath.Ext(inFile)) {
		return fmt.Errorf("input file %s is not an office file", inFile)
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
	isPpt := filepath.Ext(p.file) == document.FileExtPPTX
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
