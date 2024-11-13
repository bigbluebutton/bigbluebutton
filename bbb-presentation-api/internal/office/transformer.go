package office

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"os/exec"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/config"
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/pdf"
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/presentation"
)

type officePDFTransformer struct {
	removeFileFunc func(name string) error
	exec           func(ctx context.Context, name string, args ...string) *exec.Cmd
}

func NewOfficePDFTransformer() *officePDFTransformer {
	return &officePDFTransformer{
		removeFileFunc: os.Remove,
		exec:           exec.CommandContext,
	}
}

func (t *officePDFTransformer) Transform(msg pipeline.Message[*OfficeFileToConvert]) (pipeline.Message[*pdf.PDFToProcess], error) {
	inFile := msg.Payload.InFile
	outFile := msg.Payload.OutFile

	cfg, err := pipeline.ContextValue[*config.Config](msg.Context(), presentation.ConfigKey)
	if err != nil {
		return pipeline.Message[*pdf.PDFToProcess]{}, fmt.Errorf("could not load the required configuration: %w", err)
	}

	script := cfg.Conversion.Office.Script
	maxAttempts := cfg.Conversion.Office.MaxAttempts
	timeout := cfg.Conversion.Office.Timeout

	if outFile == "" {
		outFile = presentation.PDFName(inFile)
	}

	for attempt := 1; attempt <= maxAttempts; attempt++ {
		slog.Info("Starting conversion attempt",
			"attempt", attempt, "maxAttempts", maxAttempts, "inputFile", inFile)

		ctx, cancel := context.WithTimeout(context.Background(), time.Duration(timeout)*time.Second)
		defer cancel()

		o := &officeFileToConvert{
			ctx:     ctx,
			inFile:  inFile,
			outFile: outFile,
			script:  script,
			timeout: timeout,
			exec:    t.exec,
		}

		if err := convertOfficeFileToPDF(o); err == nil {
			slog.Info("Conversion succeeded", "inputFile", inFile)
			return pipeline.NewMessageWithContext(&pdf.PDFToProcess{File: outFile}, ctx), nil
		} else {
			slog.Error("Conversion attempt failed",
				"attempt", attempt, "error", err)

			if rmErr := t.removeFile(outFile); rmErr != nil {
				slog.Error("Failed to remove generated PDF", "error", rmErr)
			}
		}
	}
	return pipeline.Message[*pdf.PDFToProcess]{}, fmt.Errorf("all conversion attempts failed for file: %s", inFile)
}

type officeFileToConvert struct {
	ctx     context.Context
	inFile  string
	outFile string
	script  string
	timeout int
	exec    func(ctx context.Context, name string, args ...string) *exec.Cmd
}

func convertOfficeFileToPDF(o *officeFileToConvert) error {
	args := []string{
		fmt.Sprintf("%ds", o.timeout),
		"/bin/sh", "-c",
		fmt.Sprintf("\"%s\" \"%s\" \"%s\" pdf %d", o.script, o.inFile, o.outFile, o.timeout),
	}

	cmd := o.exec(o.ctx, "timeout", args...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("conversion failed: %w, output: %s", err, string(output))
	}
	return nil
}

func (t *officePDFTransformer) removeFile(path string) error {
	if err := t.removeFileFunc(path); err != nil {
		return fmt.Errorf("failed to remove file %s: %w", path, err)
	}
	return nil
}
