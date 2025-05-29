package clamav

import (
	"fmt"
	"strings"
)

type ClamdScanner struct {
	client ClamdClient
}

func NewClamdScannerOverTCP(addr string) *ClamdScanner {
	return &ClamdScanner{
		client: NewDefaultTCPClamdClient(addr),
	}
}

func NewClamdScannerOverUnix(addr string) *ClamdScanner {
	return &ClamdScanner{
		client: NewDefaultUnixClamdClient(addr),
	}
}

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
