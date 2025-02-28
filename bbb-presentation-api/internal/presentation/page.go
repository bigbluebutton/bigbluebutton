package presentation

import (
	"context"
	"fmt"
	"os/exec"
	"strconv"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/config"
)

// PageCounter is the interface that wraps the basic PageCount method. Given the path
// to a file PageCounter will attempt to determine the number of pages in the file.
// An error will be returned any problems occur while trying to determine the number
// of pages in the file.
type PageCounter interface {
	CountPages(path string) (int, error)
}

// PageExtractor is the interface that wraps the basic ExtractPage method. Given the
// path to an input file, an output path, and a page number ExtractPage will attempt
// to extract the specified page from the input file into a separate file located at
// the specified output path.
type PageExtractor interface {
	ExtractPage(inFile string, outFile string, page int) error
}

// PageDownscaler is the interface that wraps the basic DownscalePage method. Given
// the path to an input file and an output path DownscalePage will attempt
// to downscale the input file for the purpose of reducting file size. The downsclaed
// file will be located at the output path.
type PageDownscaler interface {
	DownscalePage(inFile string, outFile string) error
}

// PageProcessor is the interface that encapsulates all of the page processing
// functionality.
type PageProcessor interface {
	PageCounter
	PageExtractor
	PageDownscaler
}

// PDFPageCounter is an implementation of the PageCounter interface that counts the
// number of pages in PDFs.
type PDFPageCounter struct {
	pdfProcessor PDFProcessor
}

// NewPDFPageCounter constructs a new PDFPageCounter using PDFCPU as its
// PDF processor.
func NewPDFPageCounter() *PDFPageCounter {
	return NewPDFPageCounterWithProcessor(&PDFCPU{})
}

// NewPDFPageCounterWithProcessor constructs a new PDFPageCounter using the provided
// PDFProcessor for handling PDF documents.
func NewPDFPageCounterWithProcessor(pdfProcessor PDFProcessor) *PDFPageCounter {
	return &PDFPageCounter{
		pdfProcessor: pdfProcessor,
	}
}

// CountPages attempts to determine the number of pages that are in the given PDF.
// The number of pages will be zero and an error will be returned if the any problems
// arise while attempting to determine the number of pages.
func (c *PDFPageCounter) CountPages(path string) (int, error) {
	pageCount, err := c.pdfProcessor.countPages(path)
	if err != nil {
		return 0, fmt.Errorf("failed to determine page count for %s: %w", path, err)
	}
	return pageCount, nil
}

// PDFPageExtractor is an implementation of the PageExtractor interface that extracts
// pages from PDFs.
type PDFPageExtractor struct {
	pdfProcessor PDFProcessor
}

// NewPDFPageExtractor constructs a new PDFPageCounter using PDFCPU as its
// PDF processor.
func NewPDFPageExtractor() *PDFPageExtractor {
	return NewPDFPageExtractorWithProcessor(&PDFCPU{})
}

// NewPDFPageExtractorWithProcessor constructs a new PDFPageCounter using the provided
// PDFProcessor for handling PDF documents.
func NewPDFPageExtractorWithProcessor(pdfProcessor PDFProcessor) *PDFPageExtractor {
	return &PDFPageExtractor{
		pdfProcessor: pdfProcessor,
	}
}

// ExtractPage takes as input the path to a PDF, the path to an output directory, and a
// page number and attempts to extract the specified page into its own file. The
// extracted page will be stored in a generated single page PDF located in the output
// directory. An error will be returned if the page number is invalid or if an error occurs
// during the extraction process.
func (e *PDFPageExtractor) ExtractPage(inFile, outFile string, page int) error {
	pageCount, err := e.pdfProcessor.countPages(inFile)
	if err != nil {
		return fmt.Errorf("failed to get page count: %w", err)
	}

	if page < 1 || page > pageCount {
		return fmt.Errorf("invalid page number %d: must be between 1 and %d", page, pageCount)
	}

	pages := []string{strconv.Itoa(page)}
	return e.pdfProcessor.extractPages(inFile, outFile, pages)
}

// PDfPageDownscaler is an implementation of the PageDownscaler interface that downscales
// PDF pages.
type PDFPageDownscaler struct {
	script  string
	timeout int
	exec    func(ctx context.Context, name string, args ...string) *exec.Cmd
}

// NewPDFPageDownscaler creates a new PDFPageDownscaler using the default configuration that
// is loaded when the application starts.
func NewPDFPageDownscaler() *PDFPageDownscaler {
	return NewPDFPageDownscalerWithConfig(config.DefaultConfig())
}

// NewPDFPageDownscalerWithConfg is like NewPDFPageDownscaler, but allows the caller to specify
// the configuration that should be used.
func NewPDFPageDownscalerWithConfig(config config.Config) *PDFPageDownscaler {
	return &PDFPageDownscaler{
		script:  config.Processing.PDF.Page.Downscale.Script,
		timeout: config.Processing.PDF.Page.Downscale.Timeout,
		exec:    exec.CommandContext,
	}
}

// DownscalePage takes as input the path to an input PDF and the path to an output PDF.
// An attempt is made to downscale the input PDF and save the downscaled version of the
// PDF to the output PDF. Returns an error if any problems occur during the downscaling
// process.
func (d *PDFPageDownscaler) DownscalePage(inFile, outFile string) error {
	args := []string{
		"-sDEVICE=pdfwrite",
		"-dNOPAUSE",
		"-dQUIET",
		"-dBATCH",
		"-dFirstPage=1",
		"-dLastPage=1",
		fmt.Sprintf("-sOutputFile=%s", outFile),
		d.script,
		inFile,
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(d.timeout)*time.Second)
	defer cancel()

	cmd := d.exec(ctx, "gs", args...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("ghostscript error: %v, output: %s", err, string(output))
	}

	return nil
}

// A PDFPageProcessor is a [PageProcessor] that specifically
// handles PDF documents.
type PDFPageProcessor struct {
	PDFPageCounter
	PDFPageExtractor
	PDFPageDownscaler
}

// NewPDFPageProcessor creates a new [PageProcessor] for
// the processing of PDF document pages using a default
// [PDFProcessor].
func NewPDFPageProcessor() PageProcessor {
	return &PDFPageProcessor{
		*NewPDFPageCounter(),
		*NewPDFPageExtractor(),
		*NewPDFPageDownscaler(),
	}
}

// NewCustomPDFPageProcessor is like NewPDFPageProcessor but
// allows the caller to specify the [PDFProcessor] and the
// configuration that should be used.
func NewCustomPDFPageProcessor(processor PDFProcessor, cfg config.Config) PageProcessor {
	return &PDFPageProcessor{
		*NewPDFPageCounterWithProcessor(processor),
		*NewPDFPageExtractorWithProcessor(processor),
		*NewPDFPageDownscalerWithConfig(cfg),
	}
}
