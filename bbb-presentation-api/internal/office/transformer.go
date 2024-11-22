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

// A PDFTransformer is used to carry out the transformation of an uploaded
// MS Office document to a PDF.
type PDFTransformer struct {
	cfg            config.Config
	removeFileFunc func(name string) error
	exec           func(ctx context.Context, name string, args ...string) *exec.Cmd
}

// NewPDFTransformer creates a new PDFTransformer using the global default
// configuration.
func NewPDFTransformer() *PDFTransformer {
	return NewPDFTransformerWithConfig(config.DefaultConfig())
}

// NewPDFTransformerWithConfig is NewPDFTransformer but allows the caller to specify
// the configuration that should be used.
func NewPDFTransformerWithConfig(cfg config.Config) *PDFTransformer {
	return &PDFTransformer{
		cfg:            cfg,
		removeFileFunc: os.Remove,
		exec:           exec.CommandContext,
	}
}

// Transform will convert an incoming [Message] with a payload of type [FileToConver] into a message with a payload
// of type [pdf.FileToProcess]. An attempt will be made create a new PDF document from the provided MS Office
// document. The creation of the new PDF will be attempted multiple time in case of failure with the exact number of
// attempt being specified in the configuration provided to the [PDFTransformer].
func (t *PDFTransformer) Transform(msg pipeline.Message[*FileToConvert]) (pipeline.Message[*pdf.FileToProcess], error) {
	inFile := msg.Payload.InFile
	outFile := msg.Payload.OutFile

	script := t.cfg.Conversion.Office.Script
	maxAttempts := t.cfg.Conversion.Office.MaxAttempts
	timeout := t.cfg.Conversion.Office.Timeout

	if outFile == "" {
		outFile = presentation.PDFName(inFile)
	}

	for attempt := 1; attempt <= maxAttempts; attempt++ {
		slog.Info("Starting conversion attempt",
			"attempt", attempt, "maxAttempts", maxAttempts, "inputFile", inFile)

		ctx, cancel := context.WithTimeout(context.Background(), time.Duration(timeout)*time.Second)
		defer cancel()

		o := &fileToConvert{
			ctx:     ctx,
			inFile:  inFile,
			outFile: outFile,
			script:  script,
			timeout: timeout,
			exec:    t.exec,
		}

		if err := convertOfficeFileToPDF(o); err == nil {
			slog.Info("Conversion succeeded", "inputFile", inFile)
			return pipeline.NewMessageWithContext(&pdf.FileToProcess{ID: msg.Payload.ID, File: outFile, IsDownloadable: msg.Payload.IsDownloadable}, ctx), nil
		} else {
			slog.Error("Conversion attempt failed",
				"attempt", attempt, "error", err)

			if rmErr := t.removeFile(outFile); rmErr != nil {
				slog.Error("Failed to remove generated PDF", "error", rmErr)
			}
		}
	}
	return pipeline.Message[*pdf.FileToProcess]{}, fmt.Errorf("all conversion attempts failed for file: %s", inFile)
}

type fileToConvert struct {
	ctx     context.Context
	inFile  string
	outFile string
	script  string
	timeout int
	exec    func(ctx context.Context, name string, args ...string) *exec.Cmd
}

func convertOfficeFileToPDF(f *fileToConvert) error {
	args := []string{
		fmt.Sprintf("%ds", f.timeout),
		"/bin/sh", "-c",
		fmt.Sprintf("\"%s\" \"%s\" \"%s\" pdf %d", f.script, f.inFile, f.outFile, f.timeout),
	}

	cmd := f.exec(f.ctx, "timeout", args...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("conversion failed: %w, output: %s", err, string(output))
	}
	return nil
}

func (t *PDFTransformer) removeFile(path string) error {
	if err := t.removeFileFunc(path); err != nil {
		return fmt.Errorf("failed to remove file %s: %w", path, err)
	}
	return nil
}
