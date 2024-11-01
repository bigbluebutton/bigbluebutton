package presentation

import (
	"context"
	"os"
	"os/exec"
	"strings"
	"testing"
)

const (
	failPowerPointValidate = "fail.pptx"
)

func mockExecCommandContextForValidation(ctx context.Context, name string, args ...string) *exec.Cmd {
	cs := []string{"-test.run=TestHelperProcessForConversion", "--", name}
	cs = append(cs, args...)
	cmd := exec.CommandContext(ctx, os.Args[0], cs...)
	cmd.Env = append(cmd.Env, "GO_WANT_HELPER_PROCESS=1")

	if strings.Contains(strings.Join(args, " "), failPowerPointValidate) {
		cmd.Env = append(cmd.Env, "GO_MOCK_FAILURE=1")
	}

	return cmd
}

func TestHelperProcessForValidation(*testing.T) {
	if os.Getenv("GO_WANT_HELPER_PROCESS") != "1" {
		return
	}
	if os.Getenv("GO_MOCK_FAILURE") == "1" {
		os.Exit(1)
	}
	os.Exit(0)
}

func TestPowerPointDocumentValidator_ValidateDocument(t *testing.T) {
	tests := []struct {
		name      string
		in        string
		shouldErr bool
	}{
		{"Successful validation", "input.pptx", false},
		{"Input not PowerPoint file", "input.png", true},
		{"Failed validation", failPowerPointValidate, true},
	}

	validator := NewPowerPointDocumentValidator()
	validator.exec = mockExecCommandContextForValidation

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			err := validator.ValidateDocument(test.in)
			if (err != nil) != test.shouldErr {
				t.Errorf("ValidateDocument(%s) error = %v, want error %v", test.in, err, test.shouldErr)
			}
		})
	}
}
