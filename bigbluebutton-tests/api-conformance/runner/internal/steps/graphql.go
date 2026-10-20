package steps

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/assert"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/presence"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/report"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/spec"
)

// graphqlTimeout bounds one GraphQL operation that sets no timeout.
const graphqlTimeout = 30 * time.Second

// graphql runs a graphql step. Its document is GraphQL's result, data and
// errors. When the operation gets no result, because the server closed the
// connection or never answered, the document holds that as an error, so
// cases can expect it.
func (x *exec) graphql(ctx context.Context, phase string, index int, s spec.Step, sr *report.StepResult) {
	g := s.GraphQL
	u := x.users[g.As]
	if u == nil {
		sr.Status, sr.Message = report.Error, g.As+" isn't connected: their join failed"
		return
	}
	var vars bytes.Buffer
	if g.Variables != nil {
		if err := x.writeJSON(&vars, g.Variables); err != nil {
			sr.Status, sr.Message = report.Error, err.Error()
			return
		}
	}
	req := presence.Request{Query: g.Op.Text, Variables: vars.Bytes(), OperationName: g.Op.Name}
	payload, _ := json.Marshal(req)
	sr.Request = &report.Request{Method: "GRAPHQL", URL: x.redact(x.r.Target.GraphQLURL), Body: x.redact(clip(string(payload), maxRequestBody))}
	timeout := g.Timeout
	if timeout <= 0 {
		timeout = graphqlTimeout
	}
	run := func(timeout time.Duration) ([]byte, []string, error) {
		qctx, cancel := context.WithTimeout(ctx, timeout)
		defer cancel()
		res, err := u.Query(qctx, req, g.Op.Type)
		switch {
		case errors.Is(err, presence.ErrNotJoined):
			return nil, nil, err
		case err != nil:
			msg := err.Error()
			if errors.Is(err, context.DeadlineExceeded) {
				msg = "no answer within " + timeout.String()
			}
			doc, _ := json.Marshal(map[string]any{"errors": []any{map[string]string{"message": msg}}})
			return doc, []string{msg}, nil
		}
		doc, _ := json.Marshal(res)
		return doc, res.Messages(), nil
	}
	eval := assert.Eval(x.expand)

	var doc []byte
	var msgs []string
	var err error
	if ev := g.Eventually; ev != nil {
		deadline := time.Now().Add(ev.Within)
		for attempt := 1; ; attempt++ {
			sr.Attempts = attempt
			// As for a call step, an attempt may run past the deadline by
			// at most minAttempt.
			t := timeout
			if rem := time.Until(deadline); rem < t {
				t = max(rem, minAttempt)
			}
			doc, msgs, err = run(t)
			if err != nil {
				sr.Status, sr.Message = report.Error, err.Error()
				return
			}
			var until []assert.Result
			until, err = assert.Check(ev.Until, documentObservation(doc), eval)
			if err == nil {
				var errs []assert.Result
				errs, err = errorChecks(ev.Until, msgs, eval)
				until = append(errs, until...)
			}
			if err != nil {
				sr.Status, sr.Message = report.Error, err.Error()
				return
			}
			if assert.Passed(until) {
				break
			}
			if time.Now().Add(ev.Every).After(deadline) {
				x.document(phase, index, s, nil, doc, until, sr)
				if sr.Status != report.Error { // a broken check stays an error
					sr.Status = report.Fail
					sr.Message = fmt.Sprintf("eventually: not within %s (%d attempts): %s", ev.Within, attempt, assert.FirstFailure(until))
				}
				return
			}
			select {
			case <-time.After(ev.Every):
			case <-ctx.Done():
				sr.Status, sr.Message = report.Error, ctx.Err().Error()
				return
			}
		}
	} else if doc, msgs, err = run(timeout); err != nil {
		sr.Status, sr.Message = report.Error, err.Error()
		return
	}
	errs, err := errorChecks(s.Expect, msgs, eval)
	if err != nil {
		sr.Status, sr.Message = report.Error, err.Error()
		return
	}
	x.document(phase, index, s, nil, doc, errs, sr)
}

// errorChecks checks GraphQL's error messages: against e.Errors when the
// step expects errors, otherwise that there are none.
func errorChecks(e *spec.Expect, msgs []string, eval assert.Eval) ([]assert.Result, error) {
	if e != nil && e.Errors != nil {
		r, err := assert.Match("errors", *e.Errors, msgs, eval)
		if err != nil {
			return nil, err
		}
		return []assert.Result{r}, nil
	}
	if len(msgs) == 0 {
		return nil, nil
	}
	quoted := make([]string, len(msgs))
	for i, m := range msgs {
		quoted[i] = strconv.Quote(m)
	}
	return []assert.Result{{What: "errors", Expected: "none", Actual: strings.Join(quoted, ", ")}}, nil
}
