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

type ImageResizer interface {
	Resize(path, ratio string) error
}

type CMDImageResizer struct {
	cfg  config.Config
	exec func(ctx context.Context, name string, args ...string) *exec.Cmd
}

func NewCMDIMageResizer() *CMDImageResizer {
	return NewCMDIMageResizerWithConfig(config.DefaultConfig())
}

func NewCMDIMageResizerWithConfig(cfg config.Config) *CMDImageResizer {
	return &CMDImageResizer{
		cfg:  cfg,
		exec: exec.CommandContext,
	}
}

func (r CMDImageResizer) Resize(path, ratio string) error {
	args := []string{
		"-resize",
		ratio,
		path,
		path,
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(r.cfg.Processing.Image.Resize.Timeout)*time.Second)
	defer cancel()

	cmd := r.exec(ctx, "convert", args...)
	_, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("failed to resize image %s to %s: %w", path, ratio, err)
	}

	return nil
}
