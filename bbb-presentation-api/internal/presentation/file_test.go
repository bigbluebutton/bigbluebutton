package presentation

import (
	"os"
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
