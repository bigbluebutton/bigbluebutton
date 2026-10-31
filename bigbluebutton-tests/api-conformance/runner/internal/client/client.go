// Package client sends prepared requests. Each case gets a Session with its
// own cookie jars, one per named client.
package client

import (
	"bytes"
	"context"
	"crypto/tls"
	"crypto/x509"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/http/cookiejar"
	"net/url"
	"os"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/observe"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/target"
)

// MaxBody is the most of a response body the runner reads.
const MaxBody = 32 << 20

// TLSConfig returns the TLS settings for talking to the target: the system
// roots plus the target's CA file, if it has one.
func TLSConfig(t target.TLS) (*tls.Config, error) {
	cfg := &tls.Config{InsecureSkipVerify: t.InsecureSkipVerify} //nolint:gosec // opt-in, for test servers
	if t.CAFile != "" {
		pem, err := os.ReadFile(t.CAFile)
		if err != nil {
			return nil, fmt.Errorf("tls.caFile: %w", err)
		}
		pool, err := x509.SystemCertPool()
		if err != nil || pool == nil {
			pool = x509.NewCertPool()
		}
		if !pool.AppendCertsFromPEM(pem) {
			return nil, fmt.Errorf("tls.caFile %s holds no PEM certificate", t.CAFile)
		}
		cfg.RootCAs = pool
	}
	return cfg, nil
}

// NewTransport returns the transport every case shares. It speaks
// HTTP/1.1 only and never asks for compression, so what reaches the server,
// and the headers that come back, don't depend on negotiation.
func NewTransport(t target.TLS) (*http.Transport, error) {
	cfg, err := TLSConfig(t)
	if err != nil {
		return nil, err
	}
	return &http.Transport{
		Proxy:               http.ProxyFromEnvironment,
		DialContext:         (&net.Dialer{Timeout: 10 * time.Second}).DialContext,
		TLSClientConfig:     cfg,
		TLSHandshakeTimeout: 10 * time.Second,
		ForceAttemptHTTP2:   false,
		TLSNextProto:        map[string]func(string, *tls.Conn) http.RoundTripper{},
		DisableCompression:  true,
		MaxIdleConnsPerHost: 16,
		IdleConnTimeout:     30 * time.Second,
	}, nil
}

// Prepared is a request ready to send, with every template expanded.
type Prepared struct {
	Method  string
	URL     string
	Header  http.Header
	Body    []byte
	HasBody bool
	Chunked bool // send without Content-Length
}

// Session holds one case's cookie jars.
type Session struct {
	rt   http.RoundTripper
	jars map[string]*cookiejar.Jar
}

// NewSession starts a case.
func NewSession(rt http.RoundTripper) *Session {
	return &Session{rt: rt, jars: map[string]*cookiejar.Jar{}}
}

func (s *Session) jar(name string) *cookiejar.Jar {
	j := s.jars[name]
	if j == nil {
		j, _ = cookiejar.New(nil) // only fails with options
		s.jars[name] = j
	}
	return j
}

// Cookies returns the cookies client name would send to u. Like the rest
// of a Session, it is for the case's own goroutine.
func (s *Session) Cookies(name string, u *url.URL) []*http.Cookie {
	return s.jar(name).Cookies(u)
}

// Do sends p as client name. Redirects are returned, not followed, unless
// follow is set.
func (s *Session) Do(ctx context.Context, p *Prepared, name string, follow bool, timeout time.Duration) (*observe.Observation, error) {
	hc := &http.Client{
		Transport: s.rt,
		Jar:       s.jar(name),
		CheckRedirect: func(_ *http.Request, via []*http.Request) error {
			if !follow {
				return http.ErrUseLastResponse
			}
			if len(via) >= 10 {
				return errors.New("stopped after 10 redirects")
			}
			return nil
		},
	}
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()
	var body io.Reader
	if p.HasBody {
		body = bytes.NewReader(p.Body)
	}
	req, err := http.NewRequestWithContext(ctx, p.Method, p.URL, body)
	if err != nil {
		return nil, err
	}
	if p.HasBody && p.Chunked {
		// Hide the reader's length so the transport sends Transfer-Encoding: chunked.
		req.Body = io.NopCloser(bytes.NewReader(p.Body))
		req.ContentLength = -1
		req.GetBody = nil
	}
	for k, vs := range p.Header {
		if http.CanonicalHeaderKey(k) == "Host" {
			if len(vs) > 0 {
				req.Host = vs[0]
			}
			continue
		}
		req.Header[k] = vs
	}
	start := time.Now()
	resp, err := hc.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	data, err := io.ReadAll(io.LimitReader(resp.Body, MaxBody+1))
	if err != nil {
		return nil, fmt.Errorf("reading the response: %w", err)
	}
	if len(data) > MaxBody {
		return nil, fmt.Errorf("the response body is over %d bytes", MaxBody)
	}
	return observe.New(resp, data, time.Since(start)), nil
}
