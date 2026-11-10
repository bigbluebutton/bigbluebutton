package fakebbb

import (
	"context"
	"encoding/json"
	"io"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/fakeredis"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/resp"
)

func TestSideEffects(t *testing.T) {
	r, err := fakeredis.Start()
	if err != nil {
		t.Fatal(err)
	}
	defer r.Close()
	sub, err := resp.Dial(context.Background(), resp.Options{Addr: r.Addr()})
	if err != nil {
		t.Fatal(err)
	}
	defer sub.Close()
	if err := sub.Subscribe(toAkka, fromAkka); err != nil {
		t.Fatal(err)
	}
	fake := New(salt)
	fake.Redis, fake.DataDir = r, t.TempDir()
	srv := httptest.NewTLSServer(fake)
	defer srv.Close()
	body := func(name, q string) string {
		resp := call(t, srv, name, q)
		defer resp.Body.Close()
		b, _ := io.ReadAll(resp.Body)
		return string(b)
	}
	created := body("create", "meetingID=m1&name=Meeting&record=true&muteOnStart=true&meta_Color=blue")
	intID := created[strings.Index(created, "<internalMeetingID>")+19 : strings.Index(created, "</internalMeetingID>")]

	var names []string
	var props map[string]any
	for len(names) < 2 {
		sub.SetReadDeadline(time.Now().Add(2 * time.Second))
		m, err := sub.Receive()
		if err != nil {
			t.Fatal(err)
		}
		var msg struct {
			Envelope struct{ Name string }
			Core     struct {
				Body struct{ Props map[string]any }
			}
		}
		json.Unmarshal([]byte(m.Payload), &msg)
		names = append(names, m.Channel+" "+msg.Envelope.Name)
		props = msg.Core.Body.Props
	}
	if strings.Join(names, ", ") != toAkka+" CreateMeetingReqMsg, "+fromAkka+" MeetingCreatedEvtMsg" {
		t.Errorf("published %v", names)
	}
	voice, _ := props["voiceProp"].(map[string]any)
	meetingProp, _ := props["meetingProp"].(map[string]any)
	if voice["muteOnStart"] != true || meetingProp["intId"] != intID {
		t.Errorf("props %v", props)
	}
	info, err := resp.Dial(context.Background(), resp.Options{Addr: r.Addr()})
	if err != nil {
		t.Fatal(err)
	}
	defer info.Close()
	if v, err := info.Do("HGETALL", "meeting:info:"+intID); err != nil || strings.Join(v.Strings(), ",") != "color,blue,isBreakout,false,meetingId,m1,meetingName,Meeting" {
		t.Errorf("meeting:info: %v %v", v.Strings(), err)
	}

	body("end", "meetingID=m1")
	if _, err := os.Stat(filepath.Join(fake.DataDir, "recording/status/recorded", intID+".done")); err != nil {
		t.Errorf("no recorded marker: %v", err)
	}
	if _, err := os.Stat(filepath.Join(fake.DataDir, "recording/status/ended", intID+".done")); err != nil {
		t.Errorf("no ended marker: %v", err)
	}
	plain := body("create", "meetingID=m2&name=Meeting")
	intID2 := plain[strings.Index(plain, "<internalMeetingID>")+19 : strings.Index(plain, "</internalMeetingID>")]
	if v, _ := info.Do("EXISTS", "meeting:info:"+intID2); v.Int != 0 {
		t.Error("a meeting that stores no events got meeting:info")
	}
}
