package clamav

import (
	"bufio"
	"encoding/binary"
	"fmt"
	"io"
	"net"
	"os"
	"time"
)

const (
	chunkSize = 1024 * 64
)

// A ClamdClient provides functionality for interacting
// with a system's ClamAV daemon.
type ClamdClient interface {
	Dial() (net.Conn, error)
	Ping() (string, error)
	Version() (string, error)
	InStream(r io.Reader) (string, error)
	ScanFile(path string) (string, error)
}

// A DefaultClamdClient is a basic ClamdClient implementation
// that can communicate with a ClamAV daemon over TCP or Unix
// domain socket.
type DefaultClamdClient struct {
	Network string
	Address string
	Timeout time.Duration
}

// NewDefaultTCPClamdClient creates a new DefaultClamdClient
// that communicates with the system's ClamAV daemon over TCP.
func NewDefaultTCPClamdClient(addr string) *DefaultClamdClient {
	return &DefaultClamdClient{
		Network: "tcp",
		Address: addr,
		Timeout: 30 * time.Second,
	}
}

// NewDefaultUnixClamdClient creates a new DefaulyClamdClient
// that communicates with the system's ClamAV daemon over a
// Unix domain socket.
func NewDefaultUnixClamdClient(addr string) *DefaultClamdClient {
	return &DefaultClamdClient{
		Network: "unix",
		Address: addr,
		Timeout: 30 * time.Second,
	}
}

// Dial attemps to open a connection to the ClamAV daemon.
// Returns the connection and possibly an error.
func (c *DefaultClamdClient) Dial() (net.Conn, error) {
	dialer := net.Dialer{Timeout: c.Timeout}
	return dialer.Dial(c.Network, c.Address)
}

// Ping attempts to check the status of the ClamAV daemon.
// Returns any response from ClamAV or an error.
func (c *DefaultClamdClient) Ping() (string, error) {
	conn, err := c.Dial()
	if err != nil {
		return "", fmt.Errorf("%s: %w", FailedToDial, err)
	}
	defer conn.Close()

	if _, err := fmt.Fprintf(conn, "PING\n"); err != nil {
		return "", fmt.Errorf("failed to write PING to ClamAV daemon: %w", err)
	}

	reply, err := bufio.NewReader(conn).ReadString('\n')
	if err != nil {
		return "", fmt.Errorf("failed to read PING response from ClamAV daemon: %w", err)
	}
	return reply, err
}

// Version attempts to obtain the version of the running
// ClamAV daemon. Returns any response from ClamAV or
// an error.
func (c *DefaultClamdClient) Version() (string, error) {
	conn, err := c.Dial()
	if err != nil {
		return "", fmt.Errorf("%s: %w", FailedToDial, err)
	}
	defer conn.Close()

	if _, err := fmt.Fprint(conn, "VERSION\n"); err != nil {
		return "", fmt.Errorf("failed to write VERSION to ClamAV daemon: %w", err)
	}
	reply, err := bufio.NewReader(conn).ReadString('\n')
	if err != nil {
		return "", fmt.Errorf("failed to read VERSION response from ClamAV daemon: %w", err)
	}
	return reply, nil
}

// InStream attempts to send a stream of data to the ClamAV daemon
// for scanning and malware detection. Returns any response from
// ClamAV or an error.
func (c *DefaultClamdClient) InStream(r io.Reader) (string, error) {
	conn, err := c.Dial()
	if err != nil {
		return "", fmt.Errorf("%s: %w", FailedToDial, err)
	}
	defer conn.Close()

	if _, err := fmt.Fprint(conn, "INSTREAM\n"); err != nil {
		return "", fmt.Errorf("failed to write INSTREAM to ClamAV daemon: %w", err)
	}

	buf := make([]byte, chunkSize)
	for {
		n, err := r.Read(buf)
		if err != nil && err != io.EOF {
			return "", fmt.Errorf("failed to read from buffer: %w", err)
		}
		if n == 0 {
			if err := writeChunk(conn, nil); err != nil {
				return "", fmt.Errorf("failed to write nil chunk to ClamAV daemon: %w", err)
			}
			break
		}
		if err := writeChunk(conn, buf[:n]); err != nil {
			return "", fmt.Errorf("failed to write chunk to ClamAV daemon: %w", err)
		}
		if err == io.EOF {
			break
		}
	}

	reply, err := bufio.NewReader(conn).ReadString('\n')
	if err != nil {
		return "", fmt.Errorf("failed to read response from ClamAV daemon: %w", err)
	}
	return reply, nil
}

// ScanFile uses the ClamAV daemon to scan the file located
// at the provided path. Returns an error if the file cannot
// opened. Otherwise, returns any response from ClamAV and
// possibly an error.
func (c *DefaultClamdClient) ScanFile(path string) (string, error) {
	f, err := os.Open(path)
	if err != nil {
		return "", err
	}
	defer f.Close()
	return c.InStream(f)
}

func writeChunk(w io.Writer, data []byte) error {
	length := uint32(len(data))
	if err := binary.Write(w, binary.BigEndian, length); err != nil {
		return fmt.Errorf("failed to write binary representation of data; %w", err)
	}

	if length > 0 {
		if _, err := w.Write(data); err != nil {
			return fmt.Errorf("failed to write data: %w", err)
		}
	}
	return nil
}
