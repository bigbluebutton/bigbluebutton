package office

import (
	"context"
	"fmt"
	"os/exec"
	"path/filepath"
	"strconv"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/config"
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/pipeline"
	"github.com/bigbluebutton/bigbluebutton/bbb-presentation-api/internal/presentation"
)

type PowerPointFilter struct {
	exec func(ctx context.Context, name string, args ...string) *exec.Cmd
}

func NewPowerPointFilter() *PowerPointFilter {
	return &PowerPointFilter{
		exec: exec.CommandContext,
	}
}

func (f *PowerPointFilter) Filter(msg pipeline.Message[string]) error {
	file := msg.Payload

	isPpt := presentation.ToFileExt(filepath.Ext(file)) == presentation.ExtPptx
	if !isPpt {
		return nil
	}

	cfg, err := pipeline.ContextValue[*config.Config](msg.Context(), presentation.ConfigKey)
	if err != nil {
		return fmt.Errorf("could not load the required configuration: %w", err)
	}

	script := cfg.Validation.Office.Script
	timeout := cfg.Validation.Office.Timeout
	execTimeout := cfg.Validation.Office.ExecTimeout

	args := []string{
		strconv.Itoa(timeout),
		script,
		file,
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(execTimeout)*time.Second)
	defer cancel()

	cmd := f.exec(ctx, "timeout", args...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("validation failed: %w, output: %s", err, string(output))
	}

	return nil
}
