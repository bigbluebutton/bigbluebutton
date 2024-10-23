package presentation

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/config"
)

type Converter interface {
	Convert(in string, out string) error
}

type OfficeConverter struct {
	script      string
	timeout     time.Duration
	maxAttempts int
}

func NewOfficeConverter() *OfficeConverter {
	return NewOfficeConverterWithConfig(config.DefaultConfig())
}

func NewOfficeConverterWithConfig(cfg *config.Config) *OfficeConverter {
	return &OfficeConverter{
		script:      cfg.Conversion.Office.Script,
		timeout:     cfg.Conversion.Office.Timeout,
		maxAttempts: cfg.Conversion.Office.MaxAttempts,
	}
}

func (c *OfficeConverter) Convert(in string, out string) error {
	for i := 1; i <= c.maxAttempts; i++ {
		slog.Info(fmt.Sprintf("Attempt %d/%d: Converting %s to PDF...", i, c.maxAttempts, in))

		ctx, cancel := context.WithTimeout(context.Background(), c.timeout)
		defer cancel()

		err := convertToPDF(ctx, c.script, in, out)
		if err == nil {
			slog.Info("Conversion successful")
			return nil
		}

		slog.Error(fmt.Sprintf("Conversion attempt %d failed: %v", i, err))

		if err := os.Remove(PDFName(in)); err != nil && !errors.Is(err, os.ErrNotExist) {
			slog.Error(fmt.Sprintf("Failed to remove generated PDF: %v", err))
		}
	}

	return errors.New("all conversion attempts failed")
}

func convertToPDF(ctx context.Context, script string, in string, out string) error {
	cmd := exec.CommandContext(ctx, script, in, out)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("conversion failed: %s, output: %s", err.Error(), string(output))
	}
	return nil
}

func PDFName(in string) string {
	return strings.TrimSuffix(in, filepath.Ext(in)) + ".pdf"
}
