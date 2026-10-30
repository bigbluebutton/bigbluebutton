package image

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/config"
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/presentation"
)

// DownloadMarkerGenerator handles the creation of download markers
// for a file that is indicated to be downloadable.
type DownloadMarkerGenerator struct{}

// Generate takes an incoming [pipeline.Message] with a payload of type [FileToProcess] and generates a new
// download marker for the provided file if the file is marked as downloadable.
func (g *DownloadMarkerGenerator) Generate(msg pipeline.Message[*presentation.FileToProcess]) (pipeline.Message[*presentation.FileToProcess], error) {
	ftp := &presentation.FileToProcess{
		ID:             msg.Payload.ID,
		File:           msg.Payload.File,
		IsDownloadable: msg.Payload.IsDownloadable,
	}

	if !msg.Payload.IsDownloadable {
		return pipeline.NewMessageWithContext(ftp, msg.Context()), nil
	}

	err := presentation.MakeFileDownloadable(msg.Payload.ID, msg.Payload.File)
	if err != nil {
		return pipeline.Message[*presentation.FileToProcess]{}, err
	}
	return pipeline.NewMessageWithContext(ftp, msg.Context()), nil
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

// Generate will take an incoming [pipeline.Message] with a payload of type [FileWithAuxilliaries] and generate
// a PNG thumbnail for the image file. If thumbnail generation fails then a default blank thumbnail
// will try to be used as the thumbnail.
func (g *ThumbnailGenerator) Generate(msg pipeline.Message[*FileWithAuxilliaries]) (pipeline.Message[*FileWithAuxilliaries], error) {
	timeout := g.cfg.Generation.Thumbnail.Timeout
	thumbnailDir := fmt.Sprintf("%s%cthumbnails", filepath.Dir(msg.Payload.File), os.PathSeparator)
	thumbnail := fmt.Sprintf("%s%cthumb-1.png", thumbnailDir, os.PathSeparator)

	args := []string{
		"-thumbnail",
		"150x150",
		msg.Payload.File,
		thumbnail,
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(timeout)*time.Second)
	defer cancel()

	cmd := g.exec(ctx, fmt.Sprintf("%s%cconvert", g.cfg.Generation.Thumbnail.ImageMagickDir, os.PathSeparator), args...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		slog.Error("Failed to generate thumbnail", "source", msg.Payload.File, "error", err, "output", output)
		_, statErr := os.Stat(thumbnail)
		if os.IsNotExist(statErr) {
			blank := g.cfg.Generation.Blank.Thumbnail
			cpErr := presentation.Copy(blank, thumbnail)
			if cpErr != nil {
				slog.Error("Failed to copy blank thumbnail", "source", blank, "dest", thumbnail, "error", cpErr)
			}
		}
	}

	return pipeline.NewMessageWithContext(&FileWithAuxilliaries{
		ID:       msg.Payload.ID,
		File:     msg.Payload.File,
		Thumnail: thumbnail,
		TextFile: msg.Payload.TextFile,
		SVG:      msg.Payload.SVG,
		PNG:      msg.Payload.PNG,
	}, msg.Context()), nil
}

// TextFileGenerate handles the generation of text files from
// a provided document.
type TextFileGenerator struct{}

// Generate takes an incoming [pipeline.Message] with a payload of type [FileWithAuxilliaries]
// and attempts to creates a text file containing some boilerplate text to associate with the
// uploaded image document.
func (g *TextFileGenerator) Generate(msg pipeline.Message[*FileWithAuxilliaries]) (pipeline.Message[*FileWithAuxilliaries], error) {
	textFileDir := fmt.Sprintf("%s%ctextfiles", msg.Payload.File, os.PathSeparator)
	textFile := fmt.Sprintf("%s%cslide-1.txt", textFileDir, os.PathSeparator)
	err := presentation.Write(textFile, "No text could be retrieved for the slide")
	if err != nil {
		slog.Error("Failed to generate text file", "presentation", msg.Payload.ID, "error", err)
		return pipeline.NewMessageWithContext(&FileWithAuxilliaries{
			ID:       msg.Payload.ID,
			File:     msg.Payload.File,
			Thumnail: msg.Payload.Thumnail,
			TextFile: msg.Payload.TextFile,
			SVG:      msg.Payload.SVG,
			PNG:      msg.Payload.PNG,
		}, msg.Context()), nil
	}
	return pipeline.NewMessageWithContext(&FileWithAuxilliaries{
		ID:       msg.Payload.ID,
		File:     msg.Payload.File,
		Thumnail: msg.Payload.Thumnail,
		TextFile: textFile,
		SVG:      msg.Payload.SVG,
		PNG:      msg.Payload.PNG,
	}, msg.Context()), nil
}
