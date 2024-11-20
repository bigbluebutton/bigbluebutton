package presentation

import (
	"context"
	"errors"
	"fmt"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/config"
	"github.com/pdfcpu/pdfcpu/pkg/api"
)

// PDFProcessor is an interface that encapsulates the logic for handling PDF documents
// allowing different processor implementations to be swapped in at runtime depending
// on the requirements.
type PDFProcessor interface {
	countPages(path string) (int, error)
	extractPages(inFile, outFile string, pages []string) error
}

// PDFCPU is an implementation of PDFProcessor that uses the pdfcpu library for
// handling PDF documents.
type PDFCPU struct{}

func (p *PDFCPU) countPages(path string) (int, error) {
	return api.PageCountFile(path)
}

func (p *PDFCPU) extractPages(inFile, outFile string, pages []string) error {
	return api.ExtractPagesFile(inFile, outFile, pages, nil)
}

type PDFFontTypeDetector struct {
	timeout int
	exec    func(ctx context.Context, name string, args ...string) *exec.Cmd
}

func NewPDFFontTypeDetector() *PDFFontTypeDetector {
	return NewPDFFontTypeDetectorWithConfig(config.DefaultConfig())
}

func NewPDFFontTypeDetectorWithConfig(cfg config.Config) *PDFFontTypeDetector {
	return &PDFFontTypeDetector{
		timeout: cfg.Generation.SVG.PDF.Font.Timeout,
		exec:    exec.CommandContext,
	}
}

func (d *PDFFontTypeDetector) HasFontType3(file string, page int) (bool, error) {
	ext := ToFileExt(filepath.Ext(file))
	if !IsPDF(ext) {
		return false, errors.New("provided file is not a PDF")
	}

	pdfFontCmd := fmt.Sprintf("pdffonts -f %d -l %d %s | grep -m 1 'Type 3' | wc -l", page, page, file)
	args := []string{
		fmt.Sprintf("%ds", d.timeout),
		"/bin/sh",
		"-c",
		pdfFontCmd,
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(d.timeout)*time.Second)
	defer cancel()

	cmd := d.exec(ctx, "timeout", args...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return false, fmt.Errorf("failed to detect font type for %s: %w", file, err)
	}
	return string(output) == "1", nil
}
