package presentation

import (
	"fmt"
	"os"
	"path/filepath"
	"testing"
)

func TestMakeFileDownloadable(t *testing.T) {
	tests := []struct {
		name           string
		id             string
		file           string
		setupFiles     []string
		expectedMarker string
		expectError    bool
	}{
		{
			name:           "Create download marker",
			id:             "test123",
			file:           "testdir/file.txt",
			setupFiles:     []string{"testdir/file.txt"},
			expectedMarker: fmt.Sprintf("testdir/test123.txt%s", ExtDownloadable),
			expectError:    false,
		},
		{
			name:           "Marker already exists",
			id:             "test123",
			file:           "testdir/file.txt",
			setupFiles:     []string{"testdir/file.txt", fmt.Sprintf("testdir/test123.txt%s", ExtDownloadable)},
			expectedMarker: fmt.Sprintf("testdir/test123.txt%s", ExtDownloadable),
			expectError:    false,
		},
		{
			name:           "Cleanup previous markers",
			id:             "test123",
			file:           "testdir/file.txt",
			setupFiles:     []string{"testdir/file.txt", fmt.Sprintf("testdir/old123.txt%s", ExtDownloadable)},
			expectedMarker: fmt.Sprintf("testdir/test123.txt%s", ExtDownloadable),
			expectError:    false,
		},
		{
			name:           "Invalid directory",
			id:             "test123",
			file:           "/invalidpath/file.txt",
			setupFiles:     nil,
			expectedMarker: "",
			expectError:    true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			testDir := "testdir"
			os.RemoveAll(testDir)
			os.Mkdir(testDir, 0755)
			for _, setupFile := range tc.setupFiles {
				os.MkdirAll(filepath.Dir(setupFile), 0755)
				os.WriteFile(setupFile, []byte("test content"), 0644)
			}

			err := MakeFileDownloadable(tc.id, tc.file)

			if (err != nil) != tc.expectError {
				t.Errorf("unexpected error state: got %v, want error=%v", err, tc.expectError)
			}

			if !tc.expectError && tc.expectedMarker != "" {
				if _, statErr := os.Stat(tc.expectedMarker); os.IsNotExist(statErr) {
					t.Errorf("expected marker file %s was not created", tc.expectedMarker)
				}
			}

			os.RemoveAll(testDir)
		})
	}
}
