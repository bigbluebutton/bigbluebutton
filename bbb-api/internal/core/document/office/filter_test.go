package office

import (
	"context"
	"os"
	"os/exec"
	"strings"
	"testing"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/document"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/document/config"
	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/pipeline"
)

const (
	failPowerPointValidate = "fail.pptx"
)

func mockExecCommandContextForFilter(ctx context.Context, name string, args ...string) *exec.Cmd {
	cs := []string{"-test.run=TestHelperProcessForFilter", "--", name}
	cs = append(cs, args...)
	cmd := exec.CommandContext(ctx, os.Args[0], cs...)
	cmd.Env = append(cmd.Env, "GO_WANT_HELPER_PROCESS=1")

	if strings.Contains(strings.Join(args, " "), failPowerPointValidate) {
		cmd.Env = append(cmd.Env, "GO_MOCK_FAILURE=1")
	}

	return cmd
}

func TestHelperProcessForFilter(*testing.T) {
	if os.Getenv("GO_WANT_HELPER_PROCESS") != "1" {
		return
	}
	if os.Getenv("GO_MOCK_FAILURE") == "1" {
		os.Exit(1)
	}
	os.Exit(0)
}

func TestConversionFilter_Filter(t *testing.T) {
	tests := []struct {
		name         string
		in           string
		skipPrecheck bool
		shouldErr    bool
	}{
		{"Successful validation", "input.docx", false, false},
		{"Successful validation with pre-check skip", "input.docx", true, false},
		{"Input not an Office file", "input.png", false, true},
		{"Output not a PDF", "input.xls", false, true},
		{"Successful PowerPoint validation", "input.pptx", false, false},
		{"Failed PowerPoint validation", failPowerPointValidate, false, true},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			cfg := config.DefaultConfig()
			cfg.Validation.Office.SkipPrecheck = test.skipPrecheck
			msg := pipeline.NewMessage(&document.Presentation{FilePath: test.in})

			filter := NewConversionFilterWithConfig(cfg)
			filter.exec = mockExecCommandContextForFilter

			err := filter.Filter(msg)
			if err != nil {
				if test.shouldErr {
					return
				}
				t.Errorf("received error: %v, expected none", err)
			}
		})
	}
}
