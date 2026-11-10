//go:build unix

package steps

import (
	osexec "os/exec"
	"syscall"
)

// killGroupOnCancel makes cancelling cmd kill its whole process group:
// killing only sh would leave its children holding the output pipe open.
func killGroupOnCancel(cmd *osexec.Cmd) {
	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
	cmd.Cancel = func() error { return syscall.Kill(-cmd.Process.Pid, syscall.SIGKILL) }
}
