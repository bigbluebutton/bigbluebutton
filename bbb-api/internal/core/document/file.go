package document

import (
	"fmt"
	"io"
	"log/slog"
	"os"
	"path/filepath"
	"strings"
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

// Write attempts to create a new file located at the destination path and
// then write the provided text to that file.
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

// MakeDownloadable creates a new download marker file for the provided file.
// The name of the download marker file will be of the form {id}.{format}.downloadable
// where {format} is the extension of the provided file, for example ".pdf". Any
// previously created download marker files in the same directory will be deleted.
func MakeDownloadable(id, file string) error {
	parentDir := filepath.Dir(file)
	ext := filepath.Ext(file)
	marker := fmt.Sprintf("%s%s%s", id, ext, FileExtDownloadable)
	dlFile := fmt.Sprintf("%s%c%s", parentDir, os.PathSeparator, marker)

	_, err := os.Stat(dlFile)
	if !os.IsNotExist(err) {
		return nil
	}

	entries, err := os.ReadDir(parentDir)
	if err != nil {
		return fmt.Errorf("failed to remove previous download markers: %w", err)
	}

	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}

		isDownloadMarker := FileExtDownloadable == (filepath.Ext(entry.Name()))

		if isDownloadMarker {
			path := filepath.Join(parentDir, entry.Name())
			if rmErr := os.Remove(path); rmErr != nil {
				slog.Error("Failed to delete download marker", "error", rmErr)
				continue
			}
			slog.Info("Deleted download marker", "file", path)
		}
	}

	_, err = os.Create(dlFile)
	return err
}

// PDFName takes an input file name or path and generates an output string with the
// file extension changed to '.pdf'.
//
// example.doc becomes example.pdf
//
// a/b/c.odt becomes a/b/c.pdf
func PDFName(in string) string {
	return strings.TrimSuffix(in, filepath.Ext(in)) + ".pdf"
}
