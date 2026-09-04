package image

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/document"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/document/config"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
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
		return pipeline.NewMessageWithContext(pres, msg.Context()), err
	}
	return pipeline.NewMessageWithContext(pres, msg.Context()), nil
}

// Thumbnail generator handles the creation of thumbnails for a
// provided document.
type ThumbnailGenerator struct {
	cfg  config.Config
	exec func(ctx context.Context, name string, args ...string) *exec.Cmd
}

// NewThumbnailGenerator creates a new ThumbnailGenerator using the default
// global configuration.
func NewThumbnailGenerator() *ThumbnailGenerator {
	return NewThumbnailGeneratorWithConfig(config.DefaultConfig())
}

// NewThumbnailGeneratorWithConfig is like NewThumbnailGenerator but allows the
// caller to specify the configuration that should be used.
func NewThumbnailGeneratorWithConfig(cfg config.Config) *ThumbnailGenerator {
	return &ThumbnailGenerator{
		cfg:  cfg,
		exec: exec.CommandContext,
	}
}

// Generate will take an incoming [pipeline.Message] with a payload of type [document.Presentation] and generate
// a PNG thumbnail for the image file. If thumbnail generation fails then a default blank thumbnail
// will try to be used as the thumbnail.
func (g *ThumbnailGenerator) Generate(msg pipeline.Message[*document.Presentation]) (pipeline.Message[*document.Presentation], error) {
	pres := msg.Payload
	timeout := g.cfg.Generation.Thumbnail.Timeout
	thumbnailDir := fmt.Sprintf("%s%cthumbnails", filepath.Dir(pres.FilePath), os.PathSeparator)
	thumbnail := fmt.Sprintf("%s%cthumb-1.png", thumbnailDir, os.PathSeparator)

	args := []string{
		"-thumbnail",
		"150x150",
		pres.FilePath,
		thumbnail,
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(timeout)*time.Second)
	defer cancel()

	cmd := g.exec(ctx, fmt.Sprintf("%s%cconvert", g.cfg.Generation.Thumbnail.ImageMagickDir, os.PathSeparator), args...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		slog.Error("Failed to generate thumbnail", "source", pres.FilePath, "error", err, "output", output)
		_, statErr := os.Stat(thumbnail)
		if os.IsNotExist(statErr) {
			blank := g.cfg.Generation.Blank.Thumbnail
			cpErr := document.Copy(blank, thumbnail)
			if cpErr != nil {
				slog.Error("Failed to copy blank thumbnail", "source", blank, "dest", thumbnail, "error", cpErr)
			}
		}
	}

	newCtx := context.WithValue(msg.Context(), ThumbnailPathKey, thumbnail)

	return pipeline.NewMessageWithContext(pres, newCtx), nil
}

// TextFileGenerator handles the generation of text files from
// a provided document.
type TextFileGenerator struct{}

// Generate takes an incoming [pipeline.Message] with a payload of type [document.Presentation]
// and attempts to creates a text file containing some boilerplate text to associate with the
// uploaded image document.
func (g *TextFileGenerator) Generate(msg pipeline.Message[*document.Presentation]) (pipeline.Message[*document.Presentation], error) {
	pres := msg.Payload
	textFileDir := fmt.Sprintf("%s%ctextfiles", pres.FilePath, os.PathSeparator)
	textFile := fmt.Sprintf("%s%cslide-1.txt", textFileDir, os.PathSeparator)

	err := document.Write(textFile, "No text could be retrieved for the slide")
	if err != nil {
		slog.Error("Failed to generate text file", "presentation", msg.Payload.ID, "error", err)
		return pipeline.NewMessageWithContext(pres, msg.Context()), nil
	}

	ctx := context.WithValue(msg.Context(), TextFilePathKey, textFile)

	return pipeline.NewMessageWithContext(pres, ctx), nil
}
