package presentation

import (
	"fmt"
	"log/slog"
	"os"
	"path/filepath"
)

// MakeFileDownloadable creates a new download marker file for the provided file.
// The name of the download marker file will be of the form {id}.{format}.downloadable
// where {format} is the extension of the provided file, for example ".pdf". Any
// previously created download marker files in the same directory will be deleted.
func MakeFileDownloadable(id, file string) error {
	parentDir := filepath.Dir(file)
	ext := filepath.Ext(file)
	marker := fmt.Sprintf("%s%s%s", id, ext, ExtDownloadable)
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

		isDownloadMarker := ExtDownloadable.Matches(filepath.Ext(entry.Name()))

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
