//go:build !unix

package steps

import osexec "os/exec"

// killGroupOnCancel leaves cmd's default: cancelling kills the process
// only. Profile commands run through sh, so they need a Unix-like host;
// WaitDelay still bounds the wait for a child holding the output open.
func killGroupOnCancel(cmd *osexec.Cmd) {}
