package image

import (
	"encoding/xml"
	"fmt"
	"os"
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
