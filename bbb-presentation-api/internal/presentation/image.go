package presentation

import (
	"context"
	"encoding/xml"
	"fmt"
	"os"
	"os/exec"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/config"
)

// CountSVGImageTags will attempt to determine the number of
// <image> tags present in the SVG file located at the provided
// path. If a problem occurs, zero will be returned for the number
// of images tags along with an error.
func CountSVGImageTags(path string) (int, error) {
	file, err := os.Open(path)
	if err != nil {
		return 0, fmt.Errorf("failed to open file: %w", err)
	}
	defer file.Close()

	decoder := xml.NewDecoder(file)
	imageCount := 0

	for {
		token, err := decoder.Token()
		if err != nil {
			if err.Error() == "EOF" {
				break
			}
			return 0, fmt.Errorf("error reading XML: %w", err)
		}

		switch element := token.(type) {
		case xml.StartElement:
			if element.Name.Local == "image" {
				imageCount++
			}
		}
	}

	return imageCount, nil
}

// CountSVGTags attempts to determine the number of
// tags that are present in the SVG file located at the
// provided path. If a problem occurs, zero will be retured
// for the number of tags along with an error.
func CountSVGTags(filePath string) (int, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return 0, fmt.Errorf("failed to open file: %w", err)
	}
	defer file.Close()

	decoder := xml.NewDecoder(file)
	tagCount := 0

	for {
		token, err := decoder.Token()
		if err != nil {
			if err.Error() == "EOF" {
				break
			}
			return 0, fmt.Errorf("error reading XML: %w", err)
		}

		switch token.(type) {
		case xml.StartElement:
			tagCount++
		}
	}

	return tagCount, nil
}

// ImageResizer is an interface that wraps the basic Resize
// method. Given the path to an image file and the desired
// image dimensions in the form {width}x{height} ImageResizer
// will attempt to resize the image to specified dimensions.
// An error will be retured if a problem occurs during the
// process of resizing the image.
type ImageResizer interface {
	Resize(path, dimensions string) error
}

// CMDImageResizer is an implementation of the ImageResizer
// interface that resizes images using a command line tool.
type CMDImageResizer struct {
	cfg  config.Config
	exec func(ctx context.Context, name string, args ...string) *exec.Cmd
}

// NewCMDIMageResizer creates a new CMDImageResizer using the
// default global configuration.
func NewCMDIMageResizer() *CMDImageResizer {
	return NewCMDIMageResizerWithConfig(config.DefaultConfig())
}

// NewCMDIMageResizerWithConfig is like NewCMDIMageResizer but allows
// the caller to specify the configuration that should be used.
func NewCMDIMageResizerWithConfig(cfg config.Config) *CMDImageResizer {
	return &CMDImageResizer{
		cfg:  cfg,
		exec: exec.CommandContext,
	}
}

func (r *CMDImageResizer) Resize(path, dimensions string) error {
	args := []string{
		"-resize",
		dimensions,
		path,
		path,
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(r.cfg.Processing.Image.Resize.Timeout)*time.Second)
	defer cancel()

	cmd := r.exec(ctx, "convert", args...)
	_, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("failed to resize image %s to %s: %w", path, dimensions, err)
	}

	return nil
}
