package tap

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)

// Client is the runner's side of a tap.
type Client struct {
	base string
	hc   *http.Client
}

// NewClient talks to the tap at base, e.g. http://bbb.example.com:8099.
// A tap that doesn't accept the connection within 5s isn't waited for.
func NewClient(base string) *Client {
	tr := http.DefaultTransport.(*http.Transport).Clone()
	tr.DialContext = (&net.Dialer{Timeout: 5 * time.Second, KeepAlive: 30 * time.Second}).DialContext
	return &Client{base: strings.TrimSuffix(base, "/"), hc: &http.Client{Transport: tr, Timeout: maxWait + 15*time.Second}}
}

// Error is the tap refusing a query, with its HTTP status.
type Error struct {
	Status int
	Msg    string
}

func (e *Error) Error() string { return fmt.Sprintf("tap: %s (HTTP %d)", e.Msg, e.Status) }

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
		return fmt.Errorf("tap: %w", err)
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(io.LimitReader(resp.Body, 256<<20))
	if err != nil {
		return fmt.Errorf("tap: %w", err)
	}
	if resp.StatusCode != http.StatusOK {
		var e struct{ Error string }
		if json.Unmarshal(body, &e) != nil || e.Error == "" {
			e.Error = strings.TrimSpace(string(body))
		}
		return &Error{Status: resp.StatusCode, Msg: e.Error}
	}
	if err := json.Unmarshal(body, v); err != nil {
		return fmt.Errorf("tap: the answer to %s isn't JSON: %w", p, err)
	}
	return nil
}

// Info describes the tap.
func (c *Client) Info(ctx context.Context) (*Info, error) {
	var i Info
	return &i, c.get(ctx, "/info", nil, &i)
}

// Mark returns where a case starts. It waits up to 10s for a tap that is
// still subscribing.
func (c *Client) Mark(ctx context.Context) (Mark, error) {
	deadline := time.Now().Add(10 * time.Second)
	for {
		var m Mark
		err := c.get(ctx, "/mark", nil, &m)
		var te *Error
		if err == nil || !errors.As(err, &te) || te.Status != http.StatusServiceUnavailable || time.Now().After(deadline) {
			return m, err
		}
		select {
		case <-time.After(200 * time.Millisecond):
		case <-ctx.Done():
			return m, ctx.Err()
		}
	}
}

// BusQuery selects bus messages after a mark's Seq.
type BusQuery struct {
	Mark      Mark
	After     int64 // where to continue; the mark's Seq at first
	Name      string
	MeetingID string
	Channel   string
	Wait      time.Duration // how long to wait for a first match
}

// Bus returns the messages matching q after q.After.
func (c *Client) Bus(ctx context.Context, q BusQuery) (*BusResult, error) {
	v := url.Values{"instance": {q.Mark.Instance}, "after": {strconv.FormatInt(q.After, 10)}}
	for k, s := range map[string]string{"name": q.Name, "meetingId": q.MeetingID, "channel": q.Channel} {
		if s != "" {
			v.Set(k, s)
		}
	}
	if q.Wait > 0 {
		v.Set("wait", min(q.Wait, maxWait).String())
	}
	var r BusResult
	return &r, c.get(ctx, "/bus", v, &r)
}

// Redis reads a key.
func (c *Client) Redis(ctx context.Context, key string) (*RedisValue, error) {
	var r RedisValue
	return &r, c.get(ctx, "/redis", url.Values{"key": {key}}, &r)
}

// FS returns the files matching the glob now, and those that appeared
// since the mark.
func (c *Client) FS(ctx context.Context, m Mark, glob string) (*FSResult, error) {
	v := url.Values{"instance": {m.Instance}, "after": {strconv.FormatInt(m.Seq, 10)}, "path": {glob}}
	var r FSResult
	return &r, c.get(ctx, "/fs", v, &r)
}
