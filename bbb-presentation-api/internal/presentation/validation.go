package presentation

import (
	"context"
	"errors"
	"fmt"
	"os/exec"
	"path/filepath"
	"strconv"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/config"
)

// DocumentValidator is the interface that wraps the basic ValidateDocument method.
// Given the path to a file ValidateDocument will check that the document conforms
// to a pre-define set of standards.
type DocumentValidator interface {
	ValidateDocument(in string) error
}

// PowerPointDocumentValidator is an implementation of the DocumentValidator interface
// that validates PowerPoint documents.
type PowerPointDocumentValidator struct {
	script      string
	timeout     int
	execTimeout int
	exec        func(ctx context.Context, name string, args ...string) *exec.Cmd
}

// NewPowerPointDocumentValidator constructs a new PowerPointDocumentValidator using
// the default configuration that is loaded on application startup.
func NewPowerPointDocumentValidator() *PowerPointDocumentValidator {
	return NewPowerPointDocumentValidatorWithConfig(config.DefaultConfig())
}

// NewPowerPointDocumentValidatorWithConfig constructs a new PointPointDocumentValidator using
// the provided configuration.
func NewPowerPointDocumentValidatorWithConfig(config config.Config) *PowerPointDocumentValidator {
	return &PowerPointDocumentValidator{
		script:      config.Validation.Office.Script,
		timeout:     config.Validation.Office.Timeout,
		execTimeout: config.Validation.Office.ExecTimeout,
		exec:        exec.CommandContext,
	}
}

// ValidateDocument takes the path to a PowerPoint file and determines if the file is valid
// using an external script. Returns an error if the file is not a valid PowerPoint file.
func (v *PowerPointDocumentValidator) ValidateDocument(in string) error {
	if ToFileExt(filepath.Ext(in)) != ExtPptx {
		return errors.New("provided file is not a powerpoint")
	}

	args := []string{
		strconv.Itoa(v.timeout),
		v.script,
		in,
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(v.execTimeout)*time.Second)
	defer cancel()

	cmd := v.exec(ctx, "timeout", args...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("validation failed: %w, output: %s", err, string(output))
	}

	return nil
}
