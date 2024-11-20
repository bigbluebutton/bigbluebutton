package pdf

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/config"
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/image"
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/presentation"
)

type DownloadMarkerGenerator struct{}

func (g *DownloadMarkerGenerator) Generate(msg pipeline.Message[*FileToProcess]) (pipeline.Message[*FileToProcess], error) {
	ftp := &FileToProcess{
		ID:             msg.Payload.ID,
		File:           msg.Payload.File,
		IsDownloadable: msg.Payload.IsDownloadable,
	}

	if !msg.Payload.IsDownloadable {
		return pipeline.NewMessageWithContext(ftp, msg.Context()), nil
	}

	err := presentation.MakeFileDownloadable(msg.Payload.ID, msg.Payload.File)
	if err != nil {
		return pipeline.Message[*FileToProcess]{}, err
	}
	return pipeline.NewMessageWithContext(ftp, msg.Context()), nil
}

type PageGenerator struct {
	cfg       config.Config
	processor presentation.PageProcessor
}

func NewPageGenerator() *PageGenerator {
	return NewPageGeneratorWithProcessorAndConfig(presentation.NewPDFPageProcessor(), config.DefaultConfig())
}

func NewPageGeneratorWithProcessorAndConfig(processor presentation.PageProcessor, cfg config.Config) *PageGenerator {
	return &PageGenerator{
		cfg:       cfg,
		processor: processor,
	}
}

func (g *PageGenerator) Generate(msg pipeline.Message[*FileToProcess]) (pipeline.Message[*FileWithPages], error) {
	inFile := msg.Payload.File
	numPages, err := g.processor.CountPages(inFile)
	if err != nil {
		return pipeline.Message[*FileWithPages]{}, fmt.Errorf("failed to extract pages: %w", err)
	}

	fwp := &FileWithPages{
		ID:    msg.Payload.ID,
		File:  inFile,
		Pages: make([]*Page, 0),
	}

	for p := 0; p < numPages; p++ {
		dir := filepath.Dir(inFile)
		outFile := fmt.Sprintf("%s%cpage-%d.pdf", dir, os.PathSeparator, p)
		extFile := fmt.Sprintf("%s%cextracted-%d.pdf", dir, os.PathSeparator, p)

		if extErr := g.processor.ExtractPage(inFile, extFile, p); extErr != nil {
			slog.Error("Failed to extract page", "error", extErr)
			os.Remove(extFile)
			continue
		}

		fileInfo, statErr := os.Stat(extFile)
		if statErr != nil {
			slog.Error("Could not determine the file size", "error", statErr)
			os.Remove(extFile)
			continue
		}

		if fileInfo.Size() > g.cfg.Processing.PDF.Page.MaxSize {
			dsFile := fmt.Sprintf("%s%cdownscaled-%d.pdf", dir, os.PathListSeparator, p)
			if dsErr := g.processor.DownscalePage(extFile, dsFile); dsErr != nil {
				slog.Error("Failed to downscale page", "error", dsErr)
			} else {
				os.Rename(dsFile, outFile)
			}

			os.Remove(extFile)
			os.Remove(dsFile)
		} else {
			os.Rename(extFile, outFile)
		}

		page := &Page{
			ParentFile: inFile,
			File:       outFile,
			Num:        p,
		}

		fwp.Pages = append(fwp.Pages, page)
	}

	return pipeline.NewMessageWithContext(fwp, msg.Context()), nil
}

type ThumbnailGenerator struct {
	cfg  config.Config
	exec func(ctx context.Context, name string, args ...string) *exec.Cmd
}

func NewThumbnailGenerator() *ThumbnailGenerator {
	return NewThumbnailGeneratorWithConfig(config.DefaultConfig())
}

func NewThumbnailGeneratorWithConfig(cfg config.Config) *ThumbnailGenerator {
	return &ThumbnailGenerator{
		cfg:  cfg,
		exec: exec.CommandContext,
	}
}

func (g *ThumbnailGenerator) Generate(msg pipeline.Message[*FileWithPages]) (pipeline.Message[*FileWithPages], error) {

	timeout := g.cfg.Generation.Thumbnail.Timeout
	thumbnails := make([]string, 0)
	thumbnailDir := fmt.Sprintf("%s%cthumbnails", filepath.Dir(msg.Payload.File), os.PathSeparator)

	for _, page := range msg.Payload.Pages {
		thumbnail := fmt.Sprintf("%s%cthumb-%d.png", thumbnailDir, os.PathSeparator, page.Num)
		args := []string{
			"-png",
			"-scale-to",
			"150",
			"-cropbox",
			"-singlefile",
			page.File,
			thumbnail,
		}

		ctx, cancel := context.WithTimeout(context.Background(), time.Duration(timeout)*time.Second)
		defer cancel()

		cmd := g.exec(ctx, "pdftocairo", args...)
		output, thumbErr := cmd.CombinedOutput()
		if thumbErr != nil {
			slog.Error("Failed to generate thumbnail", "source", page.File, "page", page.Num, "error", thumbErr, "output", output)
			_, statErr := os.Stat(thumbnail)
			if os.IsNotExist(statErr) {
				blank := g.cfg.Generation.Blank.Thumbnail
				cpErr := presentation.Copy(blank, thumbnail)
				if cpErr != nil {
					slog.Error("Failed copy blank thumbnail", "source", blank, "dest", thumbnail, "error", cpErr)
				}
			}
		}
		thumbnails = append(thumbnails, thumbnail)
	}

	return pipeline.NewMessageWithContext(&FileWithPages{
		ID:         msg.Payload.ID,
		File:       msg.Payload.File,
		Pages:      msg.Payload.Pages,
		Thumbnails: thumbnails,
		TextFiles:  msg.Payload.TextFiles,
		Svgs:       msg.Payload.Svgs,
		Pngs:       msg.Payload.Pngs,
	}, msg.Context()), nil
}

type TextFileGenerator struct {
	cfg  config.Config
	exec func(ctx context.Context, name string, args ...string) *exec.Cmd
}

func NewTextFileGenerator() *TextFileGenerator {
	return NewTextFileGeneratorWithConfig(config.DefaultConfig())
}

func NewTextFileGeneratorWithConfig(cfg config.Config) *TextFileGenerator {
	return &TextFileGenerator{
		cfg:  cfg,
		exec: exec.CommandContext,
	}
}

func (g *TextFileGenerator) Generate(msg pipeline.Message[*FileWithPages]) (pipeline.Message[*FileWithPages], error) {
	timeout := g.cfg.Generation.TextFile.Timeout
	textFiles := make([]string, 0)
	textFileDir := fmt.Sprintf("%s%ctextfiles", msg.Payload.File, os.PathSeparator)

	for _, page := range msg.Payload.Pages {
		textFile := fmt.Sprintf("%s%cslide-%d.txt", textFileDir, os.PathSeparator, page.Num)
		args := []string{
			"-raw",
			"-nopgbrk",
			"-enc",
			"UTF-8",
			"-f",
			strconv.Itoa(page.Num),
			"-l",
			strconv.Itoa(page.Num),
			msg.Payload.File,
			textFile,
		}

		ctx, cancel := context.WithTimeout(context.Background(), time.Duration(timeout)*time.Second)
		defer cancel()

		cmd := g.exec(ctx, "pdftotext", args...)
		output, thumbErr := cmd.CombinedOutput()
		if thumbErr != nil {
			slog.Error("Failed to generate text file", "source", msg.Payload.File, "page", page.Num, "error", thumbErr, "output", output)
		}
		textFiles = append(textFiles, textFile)
	}

	return pipeline.NewMessageWithContext(&FileWithPages{
		ID:         msg.Payload.ID,
		File:       msg.Payload.File,
		Pages:      msg.Payload.Pages,
		Thumbnails: msg.Payload.Thumbnails,
		TextFiles:  textFiles,
		Svgs:       msg.Payload.Svgs,
		Pngs:       msg.Payload.Pngs,
	}, msg.Context()), nil
}

type SVGGenerator struct {
	cfg  config.Config
	exec func(ctx context.Context, name string, args ...string) *exec.Cmd
}

func NewSVGGenerator() *SVGGenerator {
	return NewSVGGeneratorWithConfig(config.DefaultConfig())
}

func NewSVGGeneratorWithConfig(cfg config.Config) *SVGGenerator {
	return &SVGGenerator{
		cfg:  cfg,
		exec: exec.CommandContext,
	}
}

func (g SVGGenerator) Generate(msg pipeline.Message[*FileWithPages]) (pipeline.Message[*FileWithPages], error) {
	if !g.cfg.Generation.SVG.Generate {
		return pipeline.NewMessageWithContext(&FileWithPages{
			ID:         msg.Payload.ID,
			File:       msg.Payload.File,
			Pages:      msg.Payload.Pages,
			Thumbnails: msg.Payload.Thumbnails,
			TextFiles:  msg.Payload.TextFiles,
			Svgs:       msg.Payload.Svgs,
			Pngs:       msg.Payload.Pngs,
		}, msg.Context()), nil
	}

	timeout := g.cfg.Generation.SVG.Timeout
	svgs := make([]string, 0)
	svgDir := fmt.Sprintf("%s%csvgs", filepath.Dir(msg.Payload.File), os.PathSeparator)

	for _, page := range msg.Payload.Pages {
		svg := fmt.Sprintf("%s%cslide-%d.svg", svgDir, os.PathSeparator, page.Num)

		detector := presentation.NewPDFFontTypeDetectorWithConfig(g.cfg)
		attempt := 1
		var rasterize, failed bool

		for {
			var fontErr error
			if rasterize, fontErr = detector.HasFontType3(page.File, page.Num); fontErr != nil {
				if attempt > g.cfg.Generation.SVG.PDF.Font.MaxAttempts {
					slog.Error("failed to generate SVG", "file", msg.Payload.File, "page", page.Num,
						"error", fmt.Errorf("could not determine font type of provided file"))
					failed = true
					break
				}
				attempt++
			} else {
				break
			}
		}

		if failed {
			continue
		}

		if !rasterize {
			ctx, cancel := context.WithTimeout(context.Background(), time.Duration(timeout)*time.Second)
			defer cancel()
			cmd := presentation.NewGenerationProcess(presentation.GenerationProcessPDFToCairo).Resolution(g.cfg.Generation.SVG.Resolution).
				Format(presentation.GenerationProcessFormatSVG).Pages(page.Num, page.Num).InputOutput(msg.Payload.File, svg).
				Execute(g.exec, timeout, ctx)
			output, genErr := cmd.CombinedOutput()
			if genErr != nil {
				slog.Error("failed to generate SVG", "file", msg.Payload.File, "page", page.Num, "error", genErr, "output", output)
			}
		}

		var svgSize int64
		if fileInfo, statErr := os.Stat(svg); statErr == nil {
			svgSize = fileInfo.Size()
		}

		numImgTags, _ := image.CountSVGImageTags(svg)
		numTags, _ := image.CountSVGTags(svg)

		var (
			fileEmpty = svgSize == 0
			maxImages = numImgTags > g.cfg.Generation.SVG.MaxImages
			maxTags   = numTags > g.cfg.Generation.SVG.MaxTags
		)

		if fileEmpty || maxImages || maxTags || rasterize {
			os.Remove(svg)
			png := fmt.Sprintf("%s%cslide-%d.png", svgDir, os.PathSeparator, page.Num)

			ctx, cancel := context.WithTimeout(context.Background(), time.Duration(timeout)*time.Second)
			defer cancel()
			cmd := presentation.NewGenerationProcess(presentation.GenerationProcessPDFToCairo).Resolution(g.cfg.Generation.SVG.Resolution).
				Format(presentation.GenerationProcessFormatPNG).Rasterize(g.cfg.Generation.SVG.Rasterize.Width).Pages(page.Num, page.Num).
				InputOutput(msg.Payload.File, png).Execute(g.exec, timeout, ctx)
			output, genErr := cmd.CombinedOutput()
			if genErr != nil {
				slog.Error("failed to generate PNG", "file", msg.Payload.File, "page", page.Num, "error", genErr, "output", output)
			}

			var pngSize int64
			if fileInfo, statErr := os.Stat(png); statErr == nil {
				pngSize = fileInfo.Size()
			}

			if pngSize > 0 {
				args := []string{
					fmt.Sprintf("%ds", timeout),
					"convert",
					png,
					svg,
				}

				ctx, cancel := context.WithTimeout(context.Background(), time.Duration(timeout)*time.Second)
				defer cancel()

				cmd := g.exec(ctx, "timeout", args...)
				output, timeoutErr := cmd.CombinedOutput()
				if timeoutErr != nil {
					slog.Error("failed to generate SVG", "file", png, "error", timeoutErr, "output", output)
				}

				var svgSize int64
				if fileInfo, statErr := os.Stat(svg); statErr == nil {
					svgSize = fileInfo.Size()
				}

				if svgSize > 0 {
					args := []string{
						fmt.Sprintf("%ds", timeout),
						"/bin/sh",
						"-c",
						fmt.Sprintf("sed -i '4s|>| xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"1.2\">|' %s", svg),
					}

					ctx, cancel := context.WithTimeout(context.Background(), time.Duration(timeout)*time.Second)
					defer cancel()

					cmd := g.exec(ctx, "timeout", args...)
					output, timeoutErr := cmd.CombinedOutput()
					if timeoutErr != nil {
						slog.Error("failed to add SVG namespace", "file", svg, "error", timeoutErr, "output", output)
					}
				}
			}

			os.Remove(png)
		}

		_, statErr := os.Stat(svg)
		if os.IsNotExist(statErr) {
			blank := g.cfg.Generation.Blank.SVG
			cpErr := presentation.Copy(blank, svg)
			if cpErr != nil {
				slog.Error("Failed copy blank thumbnail", "source", blank, "dest", svg, "error", cpErr)
			}
		}

		svgs = append(svgs, svg)
	}

	return pipeline.NewMessageWithContext(&FileWithPages{
		ID:         msg.Payload.ID,
		File:       msg.Payload.File,
		Pages:      msg.Payload.Pages,
		Thumbnails: msg.Payload.Thumbnails,
		TextFiles:  msg.Payload.TextFiles,
		Svgs:       svgs,
		Pngs:       msg.Payload.Pngs,
	}, msg.Context()), nil
}

type PNGGenerator struct {
	cfg  config.Config
	exec func(ctx context.Context, name string, args ...string) *exec.Cmd
}

func NewPNGGenerator() *PNGGenerator {
	return NewPNGGeneratorWithConfig(config.DefaultConfig())
}

func NewPNGGeneratorWithConfig(cfg config.Config) *PNGGenerator {
	return &PNGGenerator{
		cfg:  cfg,
		exec: exec.CommandContext,
	}
}

func (g *PNGGenerator) Generate(msg pipeline.Message[*FileWithPages]) (pipeline.Message[*FileWithPages], error) {
	if !g.cfg.Generation.PNG.Generate {
		return pipeline.NewMessageWithContext(&FileWithPages{
			ID:         msg.Payload.ID,
			File:       msg.Payload.File,
			Pages:      msg.Payload.Pages,
			Thumbnails: msg.Payload.Thumbnails,
			TextFiles:  msg.Payload.TextFiles,
			Svgs:       msg.Payload.Svgs,
			Pngs:       msg.Payload.Pngs,
		}, msg.Context()), nil
	}

	timeout := g.cfg.Generation.PNG.Timeout
	pngs := make([]string, 0)
	pngDir := fmt.Sprintf("%s%cpngs", msg.Payload.File, os.PathSeparator)

	for _, page := range msg.Payload.Pages {
		png := fmt.Sprintf("%s%cslide-%d.txt", pngDir, os.PathSeparator, page.Num)

		args := []string{
			"-png",
			"-scale-to",
			strconv.Itoa(g.cfg.Generation.PNG.SlideWidth),
			"-cropbox",
			"-singlefile",
			page.File,
			png,
		}

		ctx, cancel := context.WithTimeout(context.Background(), time.Duration(timeout)*time.Second)
		defer cancel()

		cmd := g.exec(ctx, "pdftocairo", args...)
		output, pngErr := cmd.CombinedOutput()
		if pngErr != nil {
			slog.Error("Failed to generate PNG", "source", page.File, "page", page.Num, "error", pngErr, "output", output)
			_, statErr := os.Stat(png)
			if os.IsNotExist(statErr) {
				blank := g.cfg.Generation.Blank.PNG
				cpErr := presentation.Copy(blank, png)
				if cpErr != nil {
					slog.Error("Failed copy blank PNG", "source", blank, "dest", png, "error", cpErr)
				}
			}
		}
		pngs = append(pngs, png)
	}

	return pipeline.NewMessageWithContext(&FileWithPages{
		ID:         msg.Payload.ID,
		File:       msg.Payload.File,
		Pages:      msg.Payload.Pages,
		Thumbnails: msg.Payload.Thumbnails,
		TextFiles:  msg.Payload.TextFiles,
		Svgs:       msg.Payload.Svgs,
		Pngs:       pngs,
	}, msg.Context()), nil
}
