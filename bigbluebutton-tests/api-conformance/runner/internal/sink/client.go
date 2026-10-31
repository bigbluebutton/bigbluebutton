package sink

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)

// Client is the runner's side of a sink.
type Client struct {
	base string
	hc   *http.Client
}

// NewClient reads the sink at base, e.g. https://localhost:8444, trusting
// what tlsCfg trusts, or the system's roots when it is nil. A sink that
// doesn't accept the connection within 5s isn't waited for.
func NewClient(base string, tlsCfg *tls.Config) *Client {
	tr := http.DefaultTransport.(*http.Transport).Clone()
	tr.DialContext = (&net.Dialer{Timeout: 5 * time.Second, KeepAlive: 30 * time.Second}).DialContext
	if tlsCfg != nil {
		tr.TLSClientConfig = tlsCfg.Clone()
	}
	return &Client{base: strings.TrimSuffix(base, "/"), hc: &http.Client{Transport: tr, Timeout: maxWait + 15*time.Second}}
}

// Error is the sink refusing a query, with its HTTP status.
type Error struct {
	Status int
	Msg    string
}

func (e *Error) Error() string { return fmt.Sprintf("sink: %s (HTTP %d)", e.Msg, e.Status) }

func (c *Client) get(ctx context.Context, p string, q url.Values, v any) error {
	u := c.base + p
	if len(q) > 0 {
		u += "?" + q.Encode()
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u, nil)
	if err != nil {
		return err
	}
	resp, err := c.hc.Do(req)
	if err != nil {
		return fmt.Errorf("sink: %w", err)
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(io.LimitReader(resp.Body, 256<<20))
	if err != nil {
		return fmt.Errorf("sink: %w", err)
	}
	if resp.StatusCode != http.StatusOK {
		var e struct{ Error string }
		if json.Unmarshal(body, &e) != nil || e.Error == "" {
			e.Error = strings.TrimSpace(string(body))
		}
		return &Error{Status: resp.StatusCode, Msg: e.Error}
	}
	if err := json.Unmarshal(body, v); err != nil {
		return fmt.Errorf("sink: the answer to %s isn't JSON: %w", p, err)
	}
	return nil
}

// Info describes the sink.
func (c *Client) Info(ctx context.Context) (*Info, error) {
	var i Info
	return &i, c.get(ctx, "/_info", nil, &i)
}

// Query selects the requests recorded under a key.
type Query struct {
	Key string
	// Instance is the sink an earlier answer came from, "" at first: a
	// sink that restarted since then is an error, not an empty answer.
	Instance string
	After    int64         // where to continue: the last answer's Seq, 0 at first
	Wait     time.Duration // how long to wait for a first request
}

// Received returns the requests recorded under q.Key after q.After.
func (c *Client) Received(ctx context.Context, q Query) (*Received, error) {
	v := url.Values{"key": {q.Key}, "after": {strconv.FormatInt(q.After, 10)}}
	if q.Instance != "" {
		v.Set("instance", q.Instance)
	}
	if q.Wait > 0 {
		v.Set("wait", min(q.Wait, maxWait).String())
	}
	var r Received
	return &r, c.get(ctx, "/_received", v, &r)
}
