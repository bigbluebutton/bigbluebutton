package diff

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/assert"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/golden"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/spec"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/steps"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/tap"
)

// PropsPart names the meeting props in a report.
const PropsPart = "MeetingCreatedEvtMsg props"

// propsWait is how long to wait for akka-apps to announce a meeting.
var propsWait = 5 * time.Second

// Props collects responses like a golden.Collector, and for each create
// that made a meeting, the props akka-apps announced for it in
// MeetingCreatedEvtMsg, read through the target's tap. Most create params
// only show there, so a param one implementation drops, renames or
// defaults differently shows up even when no case checks it.
//
// The props are read in the background, so a target that never announces
// its meetings doesn't hold up every create, and added to the collector by
// Wait, once the run is over.
type Props struct {
	ctx context.Context
	col *golden.Collector
	tap *tap.Client

	mu   sync.Mutex
	seen map[string]bool // case and internal meeting ID
	got  []fetched
	wg   sync.WaitGroup
}

type fetched struct {
	ev  steps.Observed
	doc []byte
}

// NewProps reads props through t for the run ctx belongs to.
func NewProps(ctx context.Context, col *golden.Collector, t *tap.Client) *Props {
	return &Props{ctx: ctx, col: col, tap: t, seen: map[string]bool{}}
}

// Observe is the runner's Observe hook.
func (p *Props) Observe(ev steps.Observed) ([]assert.Result, error) {
	p.col.Observe(ev)
	if ev.Phase != "steps" || ev.Golden == "off" || ev.Index >= len(ev.Case.Steps) {
		return nil, nil
	}
	s := ev.Case.Steps[ev.Index]
	if s.Kind != spec.KindCall || !s.Call.HasCall || s.Call.Call != "create" {
		return nil, nil
	}
	intID, ok, _ := ev.Obs.Response("internalMeetingID")
	if !ok || intID == "" {
		return nil, nil
	}
	p.mu.Lock()
	defer p.mu.Unlock()
	if p.seen[ev.Case.ID+" "+intID] {
		return nil, nil // a create that found the meeting made nothing new
	}
	p.seen[ev.Case.ID+" "+intID] = true
	p.wg.Add(1)
	go func() {
		defer p.wg.Done()
		doc := meetingProps(p.ctx, p.tap, intID)
		p.mu.Lock()
		p.got = append(p.got, fetched{ev, doc})
		p.mu.Unlock()
	}()
	return nil, nil
}

// Wait waits for the props still being read and adds them all to the
// collector. Call it once the run is over: normalizing them reads what
// the collector learnt of each case.
func (p *Props) Wait() {
	p.wg.Wait()
	for _, f := range p.got {
		p.col.AddProps(f.ev, f.doc)
	}
	p.got = nil
}

// meetingProps reads the props akka-apps announced for a meeting, or says
// why there are none. The internal ID is unique to the meeting, so all
// the tap holds can be searched.
func meetingProps(ctx context.Context, t *tap.Client, intID string) []byte {
	ctx, cancel := context.WithTimeout(ctx, propsWait+5*time.Second)
	defer cancel()
	res, err := t.Bus(ctx, tap.BusQuery{Name: "MeetingCreatedEvtMsg", MeetingID: intID, Wait: propsWait})
	var why string
	switch {
	case err != nil:
		why = err.Error()
	case len(res.Messages) == 0:
		why = fmt.Sprintf("no MeetingCreatedEvtMsg within %s", propsWait)
	default:
		var m struct {
			Core struct {
				Body struct {
					Props json.RawMessage `json:"props"`
				} `json:"body"`
			} `json:"core"`
		}
		if json.Unmarshal(res.Messages[0].Message, &m) == nil && len(m.Core.Body.Props) > 0 {
			return m.Core.Body.Props
		}
		why = "MeetingCreatedEvtMsg has no props"
	}
	b, _ := json.Marshal(map[string]string{"props": why})
	return b
}
