package document

import (
	"fmt"
	"os"
	"path/filepath"
	"testing"
)

func TestCopy(t *testing.T) {
	tests := []struct {
		name         string
		content      string
		sourceExists bool
		dest         string
		expectError  bool
	}{
		{
			name:         "Successful copy",
			content:      "Hello, World!",
			sourceExists: true,
			dest:         "dest.txt",
			expectError:  false,
		},
		{
			name:         "Source file does not exist",
			content:      "",
			sourceExists: false,
			dest:         "dest.txt",
			expectError:  true,
		},
		{
			name:         "destination file cannot be created",
			content:      "Hello, World!",
			sourceExists: true,
			dest:         "invalid/dest.txt",
			expectError:  true,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			src := "source.txt"
			if test.sourceExists {
				err := os.WriteFile(src, []byte(test.content), 0644)
				if err != nil {
					t.Fatalf("failed to create source file: %v", err)
				}
				defer os.Remove(src)
			}

			err := Copy(src, test.dest)

			if test.expectError {
				if err == nil {
					t.Error("expected error but got none")
				}
			} else {
				destContent, err := os.ReadFile(test.dest)
				if err != nil {
					t.Errorf("failed to read destination file: %v", err)
				}
				if string(destContent) != test.content {
					t.Errorf("destination content mismatch: got %q, want %q", string(destContent), test.content)
				}
			}

			if _, err := os.Stat(test.dest); err == nil {
				os.Remove(test.dest)
			}
		})
	}
}

func TestWrite(t *testing.T) {
	tests := []struct {
		name        string
		dest        string
		text        string
		expectError bool
		checkFile   bool
	}{
		{
			name:        "Valid write to file",
			dest:        "dest.txt",
			text:        "Hello, World!",
			expectError: false,
			checkFile:   true,
		},
		{
			name:        "Invalid destination",
			dest:        "/invald/dest.txt",
			text:        "",
			expectError: true,
			checkFile:   false,
		},
		{
			name:        "Empty text",
			dest:        "dest.txt",
			text:        "",
			expectError: false,
			checkFile:   true,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			err := Write(test.dest, test.text)

			if err != nil {
				if !test.expectError {
					t.Errorf("unexpected error : %v", err)
				}
			} else {
				if test.expectError {
					t.Error("exepcted error but got none")
				}

				if test.checkFile {
					data, readErr := os.ReadFile(test.dest)
					if readErr != nil {
						t.Errorf("failed to read file %s: %v", test.dest, readErr)
					} else if string(data) != test.text {
						t.Errorf("file content mismatch: got %q, want %q", string(data), test.text)
					}
				}

				os.Remove(test.dest)
			}
		})
	}
}

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
			expectedMarker: fmt.Sprintf("testdir/test123.txt%s", FileExtDownloadable),
			expectError:    false,
		},
		{
			name:           "Marker already exists",
			id:             "test123",
			file:           "testdir/file.txt",
			setupFiles:     []string{"testdir/file.txt", fmt.Sprintf("testdir/test123.txt%s", FileExtDownloadable)},
			expectedMarker: fmt.Sprintf("testdir/test123.txt%s", FileExtDownloadable),
			expectError:    false,
		},
		{
			name:           "Cleanup previous markers",
			id:             "test123",
			file:           "testdir/file.txt",
			setupFiles:     []string{"testdir/file.txt", fmt.Sprintf("testdir/old123.txt%s", FileExtDownloadable)},
			expectedMarker: fmt.Sprintf("testdir/test123.txt%s", FileExtDownloadable),
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

			err := MakeDownloadable(tc.id, tc.file)

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
