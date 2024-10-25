package presentation

import (
	"context"
	"os"
	"os/exec"
	"strings"
	"testing"
)

const (
	successConvertIn  = "test.docx"
	successConvertOut = "test.pdf"
	failConvertIn     = "fail.docx"
	failConvertOut    = "fail.pdf"
	existingFile      = "existend.pdf"
	nonExistentFile   = "nonexistent.pdf"
)

func mockExecCommandContext(ctx context.Context, name string, args ...string) *exec.Cmd {
	cs := []string{"-test.run=TestHelperProcess", "--", name}
	cs = append(cs, args...)
	cmd := exec.CommandContext(ctx, os.Args[0], cs...)
	cmd.Env = append(cmd.Env, "GO_WANT_HELPER_PROCESS=1")

	if strings.Contains(strings.Join(args, " "), failConvertIn) {
		cmd.Env = append(cmd.Env, "GO_MOCK_FAILURE=1")
	}

	return cmd
}

func mockRemoveFile(path string) error {
	if path == nonExistentFile || path == failConvertOut {
		return os.ErrNotExist
	}
	return nil
}

func TestHelperProcess(*testing.T) {
	if os.Getenv("GO_WANT_HELPER_PROCESS") != "1" {
		return
	}
	if os.Getenv("GO_MOCK_FAILURE") == "1" {
		os.Exit(1)
	}
	os.Exit(0)
}

func TestOfficePDFConverter_Convert(t *testing.T) {
	tests := []struct {
		name      string
		in        string
		out       string
		shouldErr bool
	}{
		{"Successful conversion", successConvertIn, successConvertOut, false},
		{"Input not MS Office file", "input.png", "output.pdf", true},
		{"Output not PDF", "input.doc", "output.docx", true},
		{"Failed conversion", failConvertIn, failConvertOut, true},
	}

	execCommandContext = mockExecCommandContext
	removeFileFunc = mockRemoveFile

	converter := NewOfficePDFConverter()

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			err := converter.Convert(test.in, test.out)
			if (err != nil) != test.shouldErr {
				t.Errorf("Convert(%s, %s) error = %v, want error %v", test.in, test.out, err, test.shouldErr)
			}
		})
	}
}

func TestPDFName(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"test.docx", "test.pdf"},
		{"a/b/c.odt", "a/b/c.pdf"},
		{"example.pptx", "example.pdf"},
	}

	for _, test := range tests {
		result := PDFName(test.input)
		if result != test.expected {
			t.Errorf("PDFName(%q) = %q; expected %q", test.input, result, test.expected)
		}
	}
}

func TestRemoveFile(t *testing.T) {
	tests := []struct {
		name      string
		path      string
		shouldErr bool
	}{
		{"Exists", existingFile, false},
		{"Does not exist", nonExistentFile, true},
	}

	removeFileFunc = mockRemoveFile

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			err := removeFile(test.path)
			if (err != nil) != test.shouldErr {
				t.Errorf("removeFile(%s) error = %v, want error %v", test.path, err, test.shouldErr)
			}
		})
	}
}
