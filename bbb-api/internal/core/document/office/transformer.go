package office

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"os/exec"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/document"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/document/config"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
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

// NewPDFTransformerWithConfig is like NewPDFTransformer but allows the caller to specify
// the configuration that should be used.
func NewPDFTransformerWithConfig(cfg config.Config) *PDFTransformer {
	return &PDFTransformer{
		cfg:            cfg,
		removeFileFunc: os.Remove,
		exec:           exec.CommandContext,
	}
}

// Transform will convert an incoming [Message] with a payload of type [document.Presentation] into a message with a payload
// of type [document.Presentation]. An attempt will be made create a new PDF document from the provided MS Office
// document. The creation of the new PDF will be attempted multiple times in case of failure with the exact number of
// attempts being specified in the configuration provided to the [PDFTransformer].
func (t *PDFTransformer) Transform(msg pipeline.Message[*document.Presentation]) (pipeline.Message[*document.Presentation], error) {
	pres := msg.Payload
	inFile := pres.FilePath
	outFile := document.PDFName(inFile)

	script := t.cfg.Conversion.Office.Script
	maxAttempts := t.cfg.Conversion.Office.MaxAttempts
	timeout := t.cfg.Conversion.Office.Timeout

	for attempt := 1; attempt <= maxAttempts; attempt++ {
		slog.Info("Starting conversion attempt",
			"attempt", attempt, "maxAttempts", maxAttempts, "inputFile", inFile)

		ctx, cancel := context.WithTimeout(context.Background(), time.Duration(timeout)*time.Second)
		defer cancel()

		f := &fileToConvert{
			ctx:     ctx,
			inFile:  inFile,
			outFile: outFile,
			script:  script,
			timeout: timeout,
			exec:    t.exec,
		}

		if err := convertOfficeFileToPDF(f); err == nil {
			slog.Info("Conversion succeeded", "inputFile", inFile)
			pres.FilePath = outFile
			return pipeline.NewMessageWithContext(pres, msg.Context()), nil
		} else {
			slog.Error("Conversion attempt failed",
				"attempt", attempt, "error", err)

			if rmErr := t.removeFile(outFile); rmErr != nil {
				slog.Error("Failed to remove generated PDF", "error", rmErr)
			}
		}
	}

	return pipeline.NewMessageWithContext(pres, msg.Context()), fmt.Errorf("all conversion attempts failed for file: %s", inFile)
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
