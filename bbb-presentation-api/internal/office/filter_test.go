package office

import (
	"context"
	"os"
	"os/exec"
	"strings"
	"testing"

	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/config"
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/presentation"
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

func TestOfficeConversionFilter_Filter(t *testing.T) {
	tests := []struct {
		name         string
		in           string
		out          string
		skipPrecheck bool
		shouldErr    bool
	}{
		{"Successful validation", "input.docx", "output.pdf", false, false},
		{"Successful validation with pre-check skip", "input.docx", "output.pdf", true, false},
		{"Input not an Office file", "input.png", "output.pdf", false, true},
		{"Output not a PDF", "input.xls", "output.docx", false, true},
		{"Successful PowerPoint validation", "input.pptx", "output.pdf", false, false},
		{"Failed PowerPoint validation", failPowerPointValidate, "output.pdf", false, true},
	}

	filter := NewOfficeConversionFilter()
	filter.exec = mockExecCommandContextForFilter

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			cfg := config.DefaultConfig()
			cfg.Validation.Office.SkipPrecheck = test.skipPrecheck
			ctx := context.WithValue(context.Background(), presentation.ConfigKey, cfg)
			msg := pipeline.NewMessageWithContext(&OfficeFileToConvert{InFile: test.in, OutFile: test.out}, ctx)
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
