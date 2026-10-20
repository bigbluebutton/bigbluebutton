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

// PropsObserver collects responses like col.Observe, and for each create
// that made a meeting, the props akka-apps announced for it in
// MeetingCreatedEvtMsg, read through the target's tap. Most create params
// only show there, so a param one implementation drops, renames or
// defaults differently shows up even when no case checks it.
func PropsObserver(col *golden.Collector, t *tap.Client) func(steps.Observed) ([]assert.Result, error) {
	var mu sync.Mutex
	seen := map[string]bool{} // case and internal meeting ID
	return func(ev steps.Observed) ([]assert.Result, error) {
		col.Observe(ev)
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
		mu.Lock()
		dup := seen[ev.Case.ID+" "+intID]
		seen[ev.Case.ID+" "+intID] = true
		mu.Unlock()
		if dup {
			return nil, nil // a create that found the meeting made nothing new
		}
		col.AddProps(ev, meetingProps(t, intID))
		return nil, nil
	}
}

// meetingProps reads the props akka-apps announced for a meeting, or says
// why there are none. The internal ID is unique to the meeting, so all
// the tap holds can be searched.
func meetingProps(t *tap.Client, intID string) []byte {
	ctx, cancel := context.WithTimeout(context.Background(), propsWait+5*time.Second)
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
