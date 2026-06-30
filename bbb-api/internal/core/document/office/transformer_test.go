package office

import (
	"context"
	"os"
	"os/exec"
	"strings"
	"testing"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/document"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
)

const (
	successConvertIn  = "test.docx"
	successConvertOut = "test.pdf"
	failConvertIn     = "fail.docx"
	failConvertOut    = "fail.pdf"
	existingFile      = "existend.pdf"
	nonExistentFile   = "nonexistent.pdf"
)

func mockExecCommandContextForTransformation(ctx context.Context, name string, args ...string) *exec.Cmd {
	cs := []string{"-test.run=TestHelperProcessForTransformation", "--", name}
	cs = append(cs, args...)
	cmd := exec.CommandContext(ctx, os.Args[0], cs...)
	cmd.Env = append(cmd.Env, "GO_WANT_HELPER_PROCESS=1")

	if strings.Contains(strings.Join(args, " "), failConvertIn) {
		cmd.Env = append(cmd.Env, "GO_MOCK_FAILURE=1")
	}

	return cmd
}

func mockRemoveFile(path string) error {
	if path == nonExistentFile {
		return os.ErrNotExist
	}
	return nil
}

func TestHelperProcessForTransformation(*testing.T) {
	if os.Getenv("GO_WANT_HELPER_PROCESS") != "1" {
		return
	}
	if os.Getenv("GO_MOCK_FAILURE") == "1" {
		os.Exit(1)
	}
	os.Exit(0)
}

func TestPDFTransformer_Transform(t *testing.T) {
	tests := []struct {
		name        string
		in          string
		expectedOut string
		shouldErr   bool
	}{
		{"Successful conversion", successConvertIn, successConvertOut, false},
		{"Failed conversion", failConvertIn, "", true},
		{"Failed conversion; could not remove file", failConvertIn, nonExistentFile, true},
	}

	transformer := NewPDFTransformer()
	transformer.removeFileFunc = mockRemoveFile
	transformer.exec = mockExecCommandContextForTransformation

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			msg := pipeline.NewMessage(&document.Presentation{FilePath: test.in})
			output, err := transformer.Transform(msg)

			if err != nil {
				if test.shouldErr {
					return
				}
				t.Errorf("received error: %v, expected %s", err, test.expectedOut)
			}

			if output.Payload.FilePath != test.expectedOut {
				t.Errorf("unexpected output: got %s, want %s", output.Payload.FilePath, test.expectedOut)
			}
		})
	}
}
