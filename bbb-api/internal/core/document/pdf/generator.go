package pdf

import (
	"context"
	"encoding/base64"
	"fmt"
	"image"
	"log/slog"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/document"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/document/config"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
	"golang.org/x/sync/errgroup"
)

// DownloadMarkerGenerator handles the creation of download markers
// for a file that is indicated to be downloadable.
type DownloadMarkerGenerator struct{}

// Generate takes an incoming [pipeline.Message] with a payload of type [document.Presentation] and generates a new
// download marker for the provided file if the file is marked as downloadable.
func (g *DownloadMarkerGenerator) Generate(msg pipeline.Message[*document.Presentation]) (pipeline.Message[*document.Presentation], error) {
	pres := msg.Payload

	if !pres.Downloadable {
		return pipeline.NewMessageWithContext(pres, msg.Context()), nil
	}

	err := document.MakeDownloadable(msg.Payload.ID, pres.FilePath)
	if err != nil {
		return pipeline.NewMessageWithContext(pres, msg.Context()), fmt.Errorf("failed to generate download marker: %w", err)
	}
	return pipeline.NewMessageWithContext(pres, msg.Context()), nil
}

// PageGenerator handles the creation of individual page documents
// from the provided input document.
type PageGenerator struct {
	cfg       config.Config
	limits    *document.Limits
	processor document.PageProcessor
}

// NewPageGenerator creates a new [PageGenerator] using a default
// [document.PageProcessor] for PDFs, default execution limits,
// and the global default configuration. Customization of the
// [PageGenerator] may be done through functional options.
func NewPageGenerator(opts ...func(*PageGenerator)) *PageGenerator {
	pg := &PageGenerator{
		cfg:       config.DefaultConfig(),
		limits:    document.DefaultLimits(),
		processor: document.NewPDFPageProcessor(),
	}
	for _, opt := range opts {
		opt(pg)
	}
	return pg
}

// WithPageConfig is a functional option for a [PageGenerator]
// that allows the caller to specify the configuration to use.
func WithPageConfig(cfg config.Config) func(*PageGenerator) {
	return func(pg *PageGenerator) {
		pg.cfg = cfg
	}
}

// WithPageLimits is a functional option for a [PageGenerator]
// that allows the caller to specify the execution limits to use.
func WithPageLimits(limits *document.Limits) func(*PageGenerator) {
	return func(pg *PageGenerator) {
		pg.limits = limits
	}
}

// WithPageProcessor is a functional option for a [PageGenerator]
// that allows the caller to specify the [PageProcessor] to use.
func WithPageProcessor(proc document.PageProcessor) func(*PageGenerator) {
	return func(pg *PageGenerator) {
		pg.processor = proc
	}
}

// Generate will create individual single page PDF documents for each of the pages in the PDF document
// provided in the payload of the incoming [pipeline.Message]. If the size of any of the generated pages
// exceeds the maximum size defined in the provided configuration then the page will be downscaled. It is
// possible that the number of page files generated and found in the outgoing [pipeline.Message] with a
// payload of type [document.Presentation] will be less than the number of pages in the input PDF since no file will
// exist for a page if an error occurs anywhere in the generation process.
func (g *PageGenerator) Generate(msg pipeline.Message[*document.Presentation]) (pipeline.Message[*document.Presentation], error) {
	pres := msg.Payload

	inFile := pres.FilePath
	numPages, err := g.processor.CountPages(inFile)
	if err != nil {
		return pipeline.NewMessageWithContext(pres, msg.Context()), fmt.Errorf("failed to count pages: %w", err)
	}

	eg, _ := errgroup.WithContext(msg.Context())
	eg.SetLimit(int(g.limits.PerDocParallelism))

	pages := make([]document.Page, 0)

	for p := 0; p < numPages; p++ {
		eg.Go(func() error {
			dir := filepath.Dir(inFile)
			outFile := fmt.Sprintf("%s%cpage-%d.pdf", dir, os.PathSeparator, p)
			extFile := fmt.Sprintf("%s%cextracted-%d.pdf", dir, os.PathSeparator, p)

			page := document.Page{
				ParentFilePath: inFile,
				FilePath:       outFile,
				Num:            p,
			}

			if extErr := g.processor.ExtractPage(inFile, extFile, p); extErr != nil {
				slog.Error("Failed to extract page", "error", extErr)
				os.Remove(extFile)
				return nil
			}

			fileInfo, statErr := os.Stat(extFile)
			if statErr != nil {
				slog.Error("Could not determine the file size", "error", statErr)
				os.Remove(extFile)
				return nil
			}

			if fileInfo.Size() > g.cfg.Processing.PDF.Page.MaxSize {
				dsFile := fmt.Sprintf("%s%cdownscaled-%d.pdf", dir, os.PathListSeparator, p)
				if dsErr := g.processor.DownscalePage(extFile, dsFile); dsErr != nil {
					slog.Error("Failed to downscale page", "error", dsErr)
					page.UseBlanks = true
				} else {
					os.Rename(dsFile, outFile)
				}

				os.Remove(extFile)
				os.Remove(dsFile)
			} else {
				os.Rename(extFile, outFile)
			}

			pages = append(pres.Pages, page)
			return nil
		})
	}

	pres.Pages = pages
	return pipeline.NewMessageWithContext(pres, msg.Context()), nil
}

// Thumbnail generator handles the creation of thumbnails for a
// provided document.
type ThumbnailGenerator struct {
	cfg    config.Config
	limits *document.Limits
	exec   func(ctx context.Context, name string, args ...string) *exec.Cmd
}

// NewThumbnailGenerator creates a new [ThumbnailGenerator] using
// default execution limits, the global default configuration,
// and a default method of process execution. Customization of the
// [ThumbnailGenerator] may be done through functional options.
func NewThumbnailGenerator(opts ...func(*ThumbnailGenerator)) *ThumbnailGenerator {
	tg := &ThumbnailGenerator{
		cfg:    config.DefaultConfig(),
		limits: document.DefaultLimits(),
		exec:   exec.CommandContext,
	}
	for _, opt := range opts {
		opt(tg)
	}
	return tg
}

// WithThumbnailConfig is a functional option for a [ThumbnailGenerator]
// that allows the caller to specify the configuration to use.
func WithThumbnailConfig(cfg config.Config) func(*ThumbnailGenerator) {
	return func(tg *ThumbnailGenerator) {
		tg.cfg = cfg
	}
}

// WithThumbnailLimits is a functional option for a [ThumbnailGenerator]
// that allows the caller to specify the execution limits to use.
func WithThumbnailLimits(limits *document.Limits) func(*ThumbnailGenerator) {
	return func(tg *ThumbnailGenerator) {
		tg.limits = limits
	}
}

// WithThumbnailExec is a functional option for a [ThumbnailGenerator]
// that allows the caller to specify the method of process execution.
func WithThumbnailExec(exec func(ctx context.Context, name string, args ...string) *exec.Cmd) func(*ThumbnailGenerator) {
	return func(tg *ThumbnailGenerator) {
		tg.exec = exec
	}
}

// Generate will take an incoming [pipeline.Message] with a payload of type [document.Presentation] and generate
// a PNG thumbnail for each of the page documents. Only one thumbnail will be generated for each page document.
// Therefore, if a page document happens to have more than one page a thumbnail will only be generated for
// the first page of that document. If thumbnail generation fails for a page then a default blank thumbnail
// will try to be used for that page's thumbnail.
func (g *ThumbnailGenerator) Generate(msg pipeline.Message[*document.Presentation]) (pipeline.Message[*document.Presentation], error) {
	pres := msg.Payload
	pages := make([]document.Page, 0)
	timeout := time.Duration(g.cfg.Generation.Thumbnail.Timeout) * time.Second
	thumbnailDir := fmt.Sprintf("%s%cthumbnails", filepath.Dir(pres.FilePath), os.PathSeparator)

	eg, ctx := errgroup.WithContext(msg.Context())
	eg.SetLimit(int(g.limits.PerDocParallelism))

	for _, page := range pres.Pages {
		eg.Go(func() error {
			thumbnail := fmt.Sprintf("%s%cthumb-%d.png", thumbnailDir, os.PathSeparator, page.Num)
			newPage := page.Copy()
			newPage.ThumbnailPath = thumbnail
			pages = append(pages, newPage)

			pageCtx, cancel := context.WithTimeout(ctx, timeout)
			defer cancel()

			err := g.pdfToThumbnail(pageCtx, page.FilePath, thumbnail)
			if err == nil {
				return nil
			}

			slog.Error("PDF to thumbnail failed", "meeting", pres.MeetingID, "presentation", pres.ID, "page", page.Num, "error", err)

			blank := g.cfg.Generation.Blank.PNG
			err = document.Copy(blank, thumbnail)
			if err != nil {
				slog.Error("Failed copy blank thumbnal", "source", blank, "dest", thumbnail, "error", err)
			}
			return nil
		})
	}

	pres.Pages = pages
	return pipeline.NewMessageWithContext(pres, msg.Context()), nil
}

func (g *ThumbnailGenerator) pdfToThumbnail(ctx context.Context, pdfPath, thumbPath string) error {
	releaseImg, err := document.Acquire(ctx, g.limits.PDFToImageSlots, 1)
	if err != nil {
		return err
	}
	defer releaseImg()

	releaseExec, err := document.Acquire(ctx, g.limits.ExecSlots, 1)
	if err != nil {
		return err
	}
	defer releaseExec()

	args := []string{
		"-png",
		"-scale-to",
		"150",
		"-cropbox",
		"-singlefile",
		pdfPath,
		thumbPath,
	}

	cmd := g.exec(ctx, "pdftocairo", args...)
	if out, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("PDF to thumbnail: %w; output: %s", err, string(out))
	}

	return nil
}

// TextFileGenerate handles the generation of text files from
// a provided document.
type TextFileGenerator struct {
	cfg    config.Config
	limits *document.Limits
	exec   func(ctx context.Context, name string, args ...string) *exec.Cmd
}

// NewTextFileGenerator creates a new [TextFileGenerator] using
// default execution limits, the global default configuration,
// and a default method of process execution. Customization of the
// [TextFileGenerator] may be done through functional options.
func NewTextFileGenerator(opts ...func(*TextFileGenerator)) *TextFileGenerator {
	tfg := &TextFileGenerator{
		cfg:    config.DefaultConfig(),
		limits: document.DefaultLimits(),
		exec:   exec.CommandContext,
	}
	for _, opt := range opts {
		opt(tfg)
	}
	return tfg
}

// WithTextFileConfig is a functional option for a [TextFileGenerator]
// that allows the caller to specify the configuration to use.
func WithTextFileConfig(cfg config.Config) func(*TextFileGenerator) {
	return func(tfg *TextFileGenerator) {
		tfg.cfg = cfg
	}
}

// WithTextFileLimits is a functional option for a [TextFileGenerator]
// that allows the caller to specify the execution limits to use.
func WithTextFileLimits(limits *document.Limits) func(*TextFileGenerator) {
	return func(tfg *TextFileGenerator) {
		tfg.limits = limits
	}
}

// WithTextFileExec is a functional option for a [TextFileGenerator]
// that allows the caller to specify the method of process execution
// to use.
func WithTextFileExec(exec func(ctx context.Context, name string, args ...string) *exec.Cmd) func(*TextFileGenerator) {
	return func(tfg *TextFileGenerator) {
		tfg.exec = exec
	}
}

// Generate takes an incoming [pipeline.Message] with a payload of type [document.Presentation]
// and creates a text file for each of the page documents that contains the content
// from the PDF corresponding to the page.
func (g *TextFileGenerator) Generate(msg pipeline.Message[*document.Presentation]) (pipeline.Message[*document.Presentation], error) {
	pres := msg.Payload
	pages := make([]document.Page, 0)
	timeout := time.Duration(g.cfg.Generation.TextFile.Timeout) * time.Second
	textFileDir := fmt.Sprintf("%s%ctextfiles", pres.FilePath, os.PathSeparator)

	eg, ctx := errgroup.WithContext(msg.Context())
	eg.SetLimit(int(g.limits.PerDocParallelism))

	for _, page := range pages {
		eg.Go(func() error {
			textFile := fmt.Sprintf("%s%cslide-%d.txt", textFileDir, os.PathSeparator, page.Num)

			pageCtx, cancel := context.WithTimeout(ctx, timeout)
			defer cancel()

			if err := g.pdfToText(pageCtx, page.FilePath, textFile, page.Num); err != nil {
				slog.Error("PDF to text failed", "meeting", pres.MeetingID, "presentation", pres.ID, "page", page.Num, "error", err)
			}

			newPage := page.Copy()
			newPage.TextFilePath = textFile
			pages = append(pages, newPage)
			return nil
		})
	}

	pres.Pages = pages
	return pipeline.NewMessageWithContext(pres, msg.Context()), nil
}

func (g *TextFileGenerator) pdfToText(ctx context.Context, pdfPath, textPath string, page int) error {
	release, err := document.Acquire(ctx, g.limits.ExecSlots, 1)
	if err != nil {
		return err
	}
	defer release()

	args := []string{
		"-raw",
		"-nopgbrk",
		"-enc",
		"UTF-8",
		"-f",
		strconv.Itoa(page),
		"-l",
		strconv.Itoa(page),
		pdfPath,
		textPath,
	}

	cmd := g.exec(ctx, "pdftotext", args...)
	if out, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("PDF to text: %w; output: %s", err, string(out))
	}
	return nil
}

// SVGGenerator manages the generation of SVGs for a
// provided document.
type SVGGenerator struct {
	cfg    config.Config
	limits *document.Limits
	exec   func(ctx context.Context, name string, args ...string) *exec.Cmd
}

// NewSVGGenerator creates a new [SVGGenerator] using
// default execution limits, the global default configuration,
// and a default method of process execution. Customization of the
// [SVGGenerator] may be done through functional options.
func NewSVGGenerator(opts ...func(*SVGGenerator)) *SVGGenerator {
	s := &SVGGenerator{
		cfg:    config.DefaultConfig(),
		limits: document.DefaultLimits(),
		exec:   exec.CommandContext,
	}
	for _, opt := range opts {
		opt(s)
	}
	return s
}

// WithSVGConfig is a functional option for a [SVGGenerator]
// that allows the caller to specify the configuration to use.
func WithSVGConfig(cfg config.Config) func(*SVGGenerator) {
	return func(s *SVGGenerator) {
		s.cfg = cfg
	}
}

// WithSVGLimits is a functional option for a [SVGGenerator]
// that allows the caller to specify the execution limits to use.
func WithSVGLimits(limits *document.Limits) func(*SVGGenerator) {
	return func(s *SVGGenerator) {
		s.limits = limits
	}
}

// WithSVGExec is a functional option for a [SVGGenerator]
// that allows the caller to specify the method of process
// execution to use.
func WithSVGExec(exec func(ctx context.Context, name string, args ...string) *exec.Cmd) func(*SVGGenerator) {
	return func(s *SVGGenerator) {
		s.exec = exec
	}
}

// Generate takes an incoming [pipeline.Message] with a payload of type [document.Presentation]
// and generates an SVG for each of the page documents. SVG generation will only occur
// if SVGs are required as specified in the provided configuration. If a page's PDF
// contains font type 3 or the SVG generated for the PDF is too large the document
// will be rasterized by first converting the PDF into a PNG with a limited resolution
// and then converting that PNG into the final SVG. If SVG generation fails for a page
// then a default blank SVG will try to be used for that page's SVG.
func (g *SVGGenerator) Generate(msg pipeline.Message[*document.Presentation]) (pipeline.Message[*document.Presentation], error) {
	pres := msg.Payload
	if !g.cfg.Generation.SVG.Generate {
		return pipeline.NewMessageWithContext(pres, msg.Context()), nil
	}

	pages := make([]document.Page, 0)
	timeout := time.Duration(g.cfg.Generation.SVG.Timeout) * time.Second
	svgDir := fmt.Sprintf("%s%csvgs", filepath.Dir(pres.FilePath), os.PathSeparator)
	rasterize := g.cfg.Generation.SVG.Rasterize.Force

	ctx := msg.Context()
	eg, ctx := errgroup.WithContext(ctx)
	eg.SetLimit(int(g.limits.PerDocParallelism))

	for _, page := range msg.Payload.Pages {
		eg.Go(func() error {
			pageCtx, cancel := context.WithTimeout(ctx, timeout)
			defer cancel()

			svgPath := filepath.Join(svgDir, fmt.Sprintf("slide-%d", page.Num))
			pngPath := filepath.Join(svgDir, fmt.Sprintf("slide-%d", page.Num))

			if !rasterize {
				detector := document.NewPDFFontTypeDetectorWithConfig(g.cfg)
				rasterize, _ = g.detectFontTypeWithRetry(pageCtx, detector, &page, g.cfg.Generation.SVG.PDF.Font.MaxAttempts)
			}

			if !rasterize {
				if err := g.pdfToSVG(pageCtx, pres.FilePath, svgPath, page.Num); err != nil {
					slog.Error("PDF to SVG failed", "meeting", pres.MeetingID, "presentation", pres.ID, "page", page.Num, "error", err)
				}
			}

			rasterize, err := g.shouldRasterize(svgPath)
			if err != nil {
				slog.Error("Failed to evaluate SVG", "meeting", pres.MeetingID, "presentation", pres.ID, "page", page.Num, "error", err)
			}

			if rasterize {
				os.Remove(svgPath)

				if pngErr := g.pdfToPNG(pageCtx, pres.FilePath, pngPath, page.Num); pngErr != nil {
					slog.Error("PDF to PNG failed", "meeting", pres.MeetingID, "presentation", pres.ID, "page", page.Num, "error", pngErr)
				} else {
					if embedErr := g.embedPNGInSVG(pngPath, svgPath, timeout); err != nil {
						slog.Error("Failed to embed PNG in SVG", "meeting", pres.MeetingID, "presentation", pres.ID, "page", page.Num, "error", embedErr)
					}
				}

				os.Remove(pngPath)
			}

			if info, statErr := os.Stat(svgPath); os.IsNotExist(statErr) || info.Size() > int64(g.cfg.Generation.SVG.MaxSize) {
				blankSvg := g.cfg.Generation.Blank.SVG
				if cpErr := document.Copy(blankSvg, svgPath); cpErr != nil {
					slog.Error("Failed to copy blank SVG", "meeting", pres.MeetingID, "presentation", pres.ID, "page", page.Num, "src", blankSvg, "dest", svgPath, "error", cpErr)
				} else {
					page.SVGPath = svgPath
				}
			} else {
				page.SVGPath = svgPath
			}

			newPage := page.Copy()
			pages = append(pages, newPage)
			return nil
		})
	}

	pres.Pages = pages

	return pipeline.NewMessageWithContext(pres, msg.Context()), nil
}

func (g *SVGGenerator) detectFontTypeWithRetry(
	ctx context.Context,
	detector *document.PDFFontTypeDetector,
	page *document.Page,
	maxAttempts int,
) (bool, error) {
	if maxAttempts < 1 {
		maxAttempts = 1
	}

	var (
		rasterize bool
		err       error
	)

	for attempt := 1; attempt <= maxAttempts; attempt++ {
		rasterize, err = detector.HasFontType3(page.FilePath, page.Num)
		if err == nil {
			return rasterize, err
		}
		select {
		case <-time.After(time.Duration(100*attempt) * time.Millisecond):
		case <-ctx.Done():
			return true, ctx.Err()
		}
	}
	return true, fmt.Errorf("font detection failed after %d attempts: %w", maxAttempts, err)
}

func (g *SVGGenerator) pdfToSVG(ctx context.Context, pdfPath, svgPath string, page int) error {
	releaseImg, err := document.Acquire(ctx, g.limits.PDFToImageSlots, 1)
	if err != nil {
		return err
	}
	defer releaseImg()

	releaseExec, err := document.Acquire(ctx, g.limits.ExecSlots, 1)
	if err != nil {
		return err
	}
	defer releaseExec()

	cmd := document.NewGenerationProcess(document.GenerationProcessPDFToCairo).
		Resolution(g.cfg.Generation.SVG.Resolution).
		Format(document.GenerationProcessFormatSVG).
		Pages(page, page).
		InputOutput(pdfPath, svgPath).
		Execute(g.exec, int(g.cfg.Generation.SVG.Timeout), ctx)

	if out, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("PDF to SVG: %w; output: %s", err, string(out))
	}

	return nil
}

func (g *SVGGenerator) pdfToPNG(ctx context.Context, pdfPath, pngPath string, page int) error {
	releaseImg, err := document.Acquire(ctx, g.limits.PDFToImageSlots, 1)
	if err != nil {
		return err
	}
	defer releaseImg()

	releaseExec, err := document.Acquire(ctx, g.limits.ExecSlots, 1)
	if err != nil {
		return err
	}
	defer releaseExec()

	cmd := document.NewGenerationProcess(document.GenerationProcessPDFToCairo).
		Resolution(g.cfg.Generation.SVG.Resolution).
		Format(document.GenerationProcessFormatPNG).
		Rasterize(g.cfg.Generation.SVG.Rasterize.Width).
		Pages(page, page).
		InputOutput(pdfPath, pngPath).
		Execute(g.exec, int(g.cfg.Generation.SVG.Timeout), ctx)

	if out, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("PDF to PNG: %w; output: %s", err, string(out))
	}

	return nil
}

func (g *SVGGenerator) shouldRasterize(svgPath string) (bool, error) {
	var size int64
	if info, err := os.Stat(svgPath); err == nil {
		size = info.Size()
	} else if os.IsNotExist(err) {
		return true, nil
	} else {
		return true, err
	}

	numImg, _ := document.CountImageTags(svgPath)
	numTags, _ := document.CountUseTags(svgPath)
	numUseTags, _ := document.CountUseTags(svgPath)

	return size == 0 ||
		numImg > g.cfg.Generation.SVG.MaxImages ||
		numTags > g.cfg.Generation.SVG.MaxTags ||
		numUseTags > g.cfg.Generation.SVG.MaxUseTags, nil
}

func (g *SVGGenerator) embedPNGInSVG(pngPath, svgPath string, timeout time.Duration) error {
	f, err := os.Open(pngPath)
	if err != nil {
		return err
	}
	defer f.Close()

	imgCfg, _, err := image.DecodeConfig(f)
	if err != nil {
		return err
	}
	data, err := os.ReadFile(pngPath)
	if err != nil {
		return err
	}
	b64 := base64.StdEncoding.EncodeToString(data)

	svgData := fmt.Sprintf(
		`<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d">
			<image href="data:image/png;base64,%s" width="%d" height="%d"/>
		</svg>`,
		imgCfg.Width, imgCfg.Height, b64, imgCfg.Width, imgCfg.Height)

	if writeErr := os.WriteFile(svgPath, []byte(svgData), 0644); writeErr != nil {
		return writeErr
	}

	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	release, err := document.Acquire(ctx, g.limits.ExecSlots, 1)
	if err != nil {
		return err
	}
	defer release()

	args := []string{
		fmt.Sprintf("%ds", int(timeout.Seconds())),
		"/bin/sh",
		"-c",
		fmt.Sprintf("sed -i '4s|>| xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"1.2\">|' %s", svgPath),
	}
	cmd := g.exec(ctx, document.RunInSystemdCommand, args...)
	if out, timeoutErr := cmd.CombinedOutput(); timeoutErr != nil {
		return fmt.Errorf("add svg namespace: %w; out=%s", timeoutErr, string(out))
	}
	return nil
}

// PNGGenerator handles the creation of PNGs
// for a provided file.
type PNGGenerator struct {
	cfg    config.Config
	limits *document.Limits
	exec   func(ctx context.Context, name string, args ...string) *exec.Cmd
}

// NewPNGGenerator creates a new [PNGGenerator] using
// default execution limits, the global default configuration,
// and a default method of process execution. Customization of the
// [PNGGenerator] may be done through functional options.
func NewPNGGenerator(opts ...func(*PNGGenerator)) *PNGGenerator {
	p := &PNGGenerator{
		cfg:    config.DefaultConfig(),
		limits: document.DefaultLimits(),
		exec:   exec.CommandContext,
	}
	for _, opt := range opts {
		opt(p)
	}
	return p
}

// WithPNGConfig is a functional option for a [PNGGenerator]
// that allows the caller to specify the conifguration to use.
func WithPNGConfig(cfg config.Config) func(*PNGGenerator) {
	return func(p *PNGGenerator) {
		p.cfg = cfg
	}
}

// WithPNGLimits is a functional option for a [PNGGenerator]
// that allows the caller to specify the execution limits to use.
func WithPNGLimits(limits *document.Limits) func(*PNGGenerator) {
	return func(p *PNGGenerator) {
		p.limits = limits
	}
}

// WithPNGExec is a functional option for a [PNGGenerator]
// that allows the caller to specify the method of process
// execution to use.
func WithPNGExec(exec func(ctx context.Context, name string, args ...string) *exec.Cmd) func(*PNGGenerator) {
	return func(p *PNGGenerator) {
		p.exec = exec
	}
}

// Generate takes an incoming [pipeline.Message] with a payload of type [document.Presentation]
// and generates a PNG for the each of the page files. PNG generation will only occur
// if PNGs are required as specified by the provided configuration. If PNG generation
// fails for a page then a default blank PNG will try to be used for that page's PNG.
func (g *PNGGenerator) Generate(msg pipeline.Message[*document.Presentation]) (pipeline.Message[*document.Presentation], error) {
	pres := msg.Payload
	if !g.cfg.Generation.PNG.Generate {
		return pipeline.NewMessageWithContext(pres, msg.Context()), nil
	}

	pages := make([]document.Page, 0)
	timeout := time.Duration(g.cfg.Generation.PNG.Timeout) * time.Second
	pngDir := fmt.Sprintf("%s%cpngs", pres.FilePath, os.PathSeparator)

	ctx := msg.Context()
	eg, ctx := errgroup.WithContext(ctx)
	eg.SetLimit(int(g.limits.PerDocParallelism))

	for _, page := range msg.Payload.Pages {
		eg.Go(func() error {
			pageCtx, cancel := context.WithTimeout(ctx, timeout)
			defer cancel()

			png := fmt.Sprintf("%s%cslide-%d.png", pngDir, os.PathSeparator, page.Num)
			newPage := page.Copy()
			newPage.PNGPath = png
			pages = append(pages, newPage)

			err := g.pdfToPNG(pageCtx, page.FilePath, png, page.Num)
			if err == nil {
				return nil
			}

			slog.Error("PDF to PNG failed", "meeting", pres.MeetingID, "presentation", pres.ID, "page", page.Num, "error", err)

			blank := g.cfg.Generation.Blank.PNG
			err = document.Copy(blank, png)
			if err != nil {
				slog.Error("Failed copy blank PNG", "source", blank, "dest", png, "error", err)
			}
			return nil
		})
	}

	pres.Pages = pages
	return pipeline.NewMessageWithContext(pres, msg.Context()), nil
}

func (g *PNGGenerator) pdfToPNG(ctx context.Context, pdfPath, pngPath string, page int) error {
	releaseImg, err := document.Acquire(ctx, g.limits.PDFToImageSlots, 1)
	if err != nil {
		return err
	}
	defer releaseImg()

	releaseExec, err := document.Acquire(ctx, g.limits.ExecSlots, 1)
	if err != nil {
		return err
	}
	defer releaseExec()

	cmd := document.NewGenerationProcess(document.GenerationProcessPDFToCairo).
		Resolution(g.cfg.Generation.SVG.Resolution).
		Format(document.GenerationProcessFormatPNG).
		Pages(page, page).
		InputOutput(pdfPath, pngPath).
		Execute(g.exec, int(g.cfg.Generation.PNG.Timeout), ctx)

	if out, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("PDF to PNG: %w; output: %s", err, string(out))
	}

	return nil
}
