package presentation

import (
	"fmt"
	"io"
	"os"
)

// Copy writes the contents of the file located at the source path to a new file
// located at the destination path.
func Copy(source, destination string) error {
	src, err := os.Open(source)
	if err != nil {
		return fmt.Errorf("failed to open source file: %w", err)
	}
	defer src.Close()

	dest, err := os.Create(destination)
	if err != nil {
		return fmt.Errorf("failed to create destination file: %w", err)
	}
	defer dest.Close()

	_, err = io.Copy(dest, src)
	if err != nil {
		return fmt.Errorf("failed to copy file content: %w", err)
	}

	err = dest.Sync()
	if err != nil {
		return fmt.Errorf("failed to sync destination file: %w", err)
	}

	return nil
}

func Write(destination, text string) error {
	dest, err := os.Create(destination)
	if err != nil {
		return fmt.Errorf("failed to create text file %s: %w", destination, err)
	}
	defer dest.Close()

	_, err = dest.WriteString(text)
	if err != nil {
		return fmt.Errorf("failed to write to %s: %w", destination, err)
	}

	err = dest.Sync()
	if err != nil {
		return fmt.Errorf("failed to sync %s: %w", destination, err)
	}

	return nil
}
