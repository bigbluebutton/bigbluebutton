package steps

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/assert"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/client"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/observe"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/presence"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/report"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/spec"
)

// presenceTimeout bounds a presence step that sets no timeout.
const presenceTimeout = 30 * time.Second

// presence runs a presence step: a user joins, leaves, drops the
// connection or reconnects. Its document is the user's state.
func (x *exec) presence(ctx context.Context, phase string, index int, s spec.Step, sr *report.StepResult) {
	p := s.Presence
	timeout := p.Timeout
	if timeout <= 0 {
		timeout = presenceTimeout
	}
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()
	u := x.users[p.As]
	var joinReq *client.Prepared
	var err error
	switch {
	case p.Action == "join" && u == nil:
		var status report.Status
		u, joinReq, status, err = x.attach(ctx, p, sr)
		if u == nil {
			sr.Status, sr.Message, sr.Stopped = status, err.Error(), true
			return
		}
		x.users[p.As] = u
		err = u.Join(ctx, false)
	case u == nil:
		sr.Status, sr.Message = report.Error, p.As+" isn't connected: their join failed"
		return
	case p.Action == "join":
		err = u.Join(ctx, true) // a guest who was waiting
	case p.Action == "leave":
		err = u.Leave(ctx)
	case p.Action == "disconnect":
		u.Disconnect()
	case p.Action == "reconnect":
		err = u.Reconnect(ctx)
	}
	var extra []assert.Result
	if err != nil {
		extra = append(extra, assert.Result{What: p.Action, Expected: "done", Actual: err.Error()})
	}
	x.document(phase, index, s, joinReq, u.Snapshot(), extra, sr)
	if err != nil && p.Action == "join" {
		sr.Stopped = true // later steps would act as a user who isn't there
	}
}

// attach starts the user's session, by joining through the API unless
// the step gives a session a call step began, and connects them.
func (x *exec) attach(ctx context.Context, p *spec.PresenceStep, sr *report.StepResult) (*presence.User, *client.Prepared, report.Status, error) {
	var token string
	var req *client.Prepared
	var err error
	if p.SessionToken != "" {
		if token, err = x.expand(p.SessionToken); err != nil {
			return nil, nil, report.Error, err
		}
	} else {
		cs := &spec.CallStep{Method: "GET", Client: p.As}
		if p.JoinURL != "" {
			cs.URL = p.JoinURL
		} else {
			cs.Call, cs.HasCall, cs.Params = "join", true, p.Args
		}
		if req, err = x.prepare(cs); err != nil {
			return nil, nil, report.Error, err
		}
		sr.Request = x.requestInfo(req)
		o, err := x.session.Do(ctx, req, p.As, false, DefaultTimeout)
		if err != nil {
			return nil, req, report.Error, fmt.Errorf("join: %w", err)
		}
		sr.Response = x.responseInfo(o)
		if token = sessionToken(o); token == "" {
			key, _, _ := o.Response("messageKey")
			return nil, req, report.Fail, fmt.Errorf("the join started no session (status %d, messageKey %q)", o.Status, key)
		}
	}
	gql, err := url.Parse(x.r.Target.GraphQLURL)
	if err != nil {
		return nil, req, report.Error, err
	}
	// The jar keeps Secure cookies for https, not wss.
	page := *gql
	page.Scheme = strings.Replace(gql.Scheme, "ws", "http", 1)
	cookies := x.session.Cookies(p.As, &page)
	// The server would turn the connection away for want of the session's
	// cookies, which is the target file's doing, not the server's.
	if base, err := url.Parse(x.r.Target.BaseURL); err == nil && len(cookies) == 0 && len(x.session.Cookies(p.As, base)) > 0 {
		return nil, req, report.Error, fmt.Errorf("the session's cookies for %s wouldn't be sent to %s: give graphqlUrl the base URL's host, and wss:// for https://",
			x.r.Target.BaseURL, x.r.Target.GraphQLURL)
	}
	u, err := presence.Attach(ctx, presence.Options{
		URL: x.r.Target.GraphQLURL, Origin: x.r.Target.BaseURL, TLS: x.r.TLS,
		Cookies: cookies, UserAgent: "bbb-conform/" + x.r.Version, PingEvery: x.r.PingEvery,
	}, token)
	if err != nil {
		var rej *presence.Rejected
		if errors.As(err, &rej) || errors.Is(err, context.DeadlineExceeded) {
			return nil, req, report.Fail, err
		}
		return nil, req, report.Error, err
	}
	return u, req, "", nil
}

// sessionToken is the session a join began: in its redirect, or in its
// redirect=false answer.
func sessionToken(o *observe.Observation) string {
	if o.Location != nil {
		if t := o.Location.Query().Get("sessionToken"); t != "" {
			return t
		}
	}
	t, _, _ := o.Response("session_token")
	return t
}

// document checks and records what a presence or graphql step returned:
// extra, then the step's expect. req is the HTTP join it sent, if any.
func (x *exec) document(phase string, index int, s spec.Step, req *client.Prepared, doc []byte, extra []assert.Result, sr *report.StepResult) {
	x.settle(phase, index, s, req, doc, sr, func(o *observe.Observation) ([]assert.Result, error) {
		results, err := assert.Check(s.Expect, o, assert.Eval(x.expand))
		return append(extra, results...), err
	})
}

// settle records a step's document and checks it: the hook's results
// first, then check's, then the step's captures. The hook sees the
// document even when check can't run.
func (x *exec) settle(phase string, index int, s spec.Step, req *client.Prepared, doc []byte, sr *report.StepResult, check func(*observe.Observation) ([]assert.Result, error)) {
	o := documentObservation(doc)
	sr.Document = x.redact(clip(string(doc), maxResponseBody))
	pre, err := x.observe(phase, index, s, req, o)
	if err != nil {
		sr.Status, sr.Message = report.Error, err.Error()
		return
	}
	results, err := check(o)
	if err != nil {
		sr.Status, sr.Message = report.Error, err.Error()
		return
	}
	results = append(pre, results...)
	sr.Assertions = x.redactResults(results)
	sr.Status = report.Pass
	if !assert.Passed(results) {
		sr.Status, sr.Message = report.Fail, assert.FirstFailure(results)
		if !x.r.ContinueOnFail {
			return
		}
	}
	x.captures(s, o, sr)
}

func documentObservation(doc []byte) *observe.Observation {
	return &observe.Observation{Header: http.Header{"Content-Type": {"application/json"}}, Body: doc}
}

// closeUsers drops every user's connection at the end of a case,
// whatever happened in it.
func (x *exec) closeUsers() {
	var wg sync.WaitGroup
	for _, u := range x.users {
		wg.Add(1)
		go func() {
			defer wg.Done()
			u.Close()
		}()
	}
	wg.Wait()
}
