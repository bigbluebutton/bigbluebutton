package presentation

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/config"
)

var removeFileFunc = os.Remove

// Converter is the interface that wraps the basic Convert method. Given the path to
// an input file of one type and the path to an output file of another type Convert will
// convert the input file to the output type. An error will be returned if any problem
// arises during the conversion process.
type Converter interface {
	Convert(in string, out string) error
}

// OfficePDFConverter is an implementation of the Converter interface which converts office
// documents to PDFs.
type OfficePDFConverter struct {
	script      string
	timeout     int
	maxAttempts int
	exec        func(ctx context.Context, name string, args ...string) *exec.Cmd
}

// NewOfficeConverter creates a new OfficePDFConverter using the default configuration that
// is loaded when the application starts.
func NewOfficePDFConverter() *OfficePDFConverter {
	return NewOfficePDFConverterWithConfig(config.DefaultConfig())
}

// NewOfficePDFConverterWithConfig is like NewOfficeConverter, but allows the caller to specify
// the configuration that should be used.
func NewOfficePDFConverterWithConfig(cfg *config.Config) *OfficePDFConverter {
	return &OfficePDFConverter{
		script:      cfg.Conversion.Office.Script,
		timeout:     cfg.Conversion.Office.Timeout,
		maxAttempts: cfg.Conversion.Office.MaxAttempts,
		exec:        exec.CommandContext,
	}
}

// Convert takes the path to an office doucment and converts the document into a new PDF
// at the output path.
func (c *OfficePDFConverter) Convert(in string, out string) error {
	var (
		officefile = IsOfficeFile(ToFileExt(filepath.Ext(in)))
		pdf        = IsPDF(ToFileExt(filepath.Ext(out)))
	)

	if !officefile {
		return fmt.Errorf("input file %s is not an office file", in)
	}

	if !pdf {
		return fmt.Errorf("output file %s is not a PDF", out)
	}

	for attempt := 1; attempt <= c.maxAttempts; attempt++ {
		slog.Info("Starting conversion attempt",
			"attempt", attempt, "maxAttempts", c.maxAttempts, "inputFile", in)

		ctx, cancel := context.WithTimeout(context.Background(), time.Duration(c.timeout)*time.Second)
		defer cancel()

		if err := c.executeConversion(ctx, in, out); err == nil {
			slog.Info("Conversion succeeded", "inputFile", in)
			return nil
		} else {
			slog.Error("Conversion attempt failed",
				"attempt", attempt, "error", err)

			if rmErr := removeFile(PDFName(in)); rmErr != nil {
				slog.Error("Failed to remove generated PDF", "error", rmErr)
			}
		}
	}
	return fmt.Errorf("all conversion attempts failed for file: %s", in)
}

func (c *OfficePDFConverter) executeConversion(ctx context.Context, in, out string) error {
	args := []string{
		fmt.Sprintf("%ds", c.timeout),
		"/bin/sh", "-c",
		fmt.Sprintf("\"%s\" \"%s\" \"%s\" pdf %d", c.script, in, out, c.timeout),
	}

	cmd := c.exec(ctx, "timeout", args...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("conversion failed: %w, output: %s", err, string(output))
	}
	return nil
}

// PDFName takes an input file name or path and generates an output string with the
// file extension changed to '.pdf'.
//
// example.doc becomes example.pdf
//
// a/b/c.odt becomes a/b/c.pdf
func PDFName(in string) string {
	return strings.TrimSuffix(in, filepath.Ext(in)) + ".pdf"
}

func removeFile(path string) error {
	if err := removeFileFunc(path); err != nil {
		return fmt.Errorf("failed to remove file %s: %w", path, err)
	}
	return nil
}
