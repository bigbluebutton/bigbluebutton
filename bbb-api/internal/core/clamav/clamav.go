// Package clamav provides functionality for interacting
// with a local ClamAV installation for the purpose of
// file scanning for malware detection.
package clamav

import (
	"fmt"
	"strings"
)

// A ClamdScanner is used to scan files
// for the purpose of detecting any potential
// malware contained in the files.
type ClamdScanner struct {
	client ClamdClient
}

// NewClamdScannerOverTCP creates a new ClamdScanner that
// uses a TCP client for communication with the system's
// ClamAV daemon.
func NewClamdScannerOverTCP(addr string) *ClamdScanner {
	return &ClamdScanner{
		client: NewDefaultTCPClamdClient(addr),
	}
}

// NewClamdScannerOverUnix creates a new ClamdScanner that
// uses a Unix domain socket client for communication with
// the system's ClamAV daemon.
func NewClamdScannerOverUnix(addr string) *ClamdScanner {
	return &ClamdScanner{
		client: NewDefaultUnixClamdClient(addr),
	}
}

// Scan takes the file located at the provided path and
// uses ClamAV to attempt to detect any malware contained
// within the file. Returns the response from ClamAV and
// possibly an error if the scan fails, any unexpected
// response if returned from ClamAV, or malware is
// detected within the file.
func (s *ClamdScanner) Scan(path string) (string, error) {
	resp, err := s.client.ScanFile(path)
	if err != nil {
		return resp, fmt.Errorf("failed to scan file: %w", err)
	}

	resp = strings.TrimSpace(resp)
	parts := strings.SplitN(resp, " ", 2)
	if len(parts) < 2 {
		return resp, fmt.Errorf("unexpected response from ClamAV: %s", resp)
	}

	if parts[1] == "OK" {
		return resp, nil
	} else if strings.HasSuffix(parts[1], "FOUND") {
		return resp, fmt.Errorf("virus detected in file")
	} else {
		return resp, fmt.Errorf("unknown response from ClamAV: %s", resp)
	}
}
