package fakebbb

import (
	"encoding/json"
	"fmt"
	"net/url"
	"os"
	"path/filepath"
	"sort"
	"time"
)

// Redis is where the fake publishes its bus messages and writes its keys:
// a fakeredis.Server in the runner's tests.
type Redis interface {
	Publish(channel, payload string) int
	HSet(key string, fieldValues ...string)
}

// The channels a real server uses between bbb-web and akka-apps.
const (
	toAkka   = "to-akka-apps-redis-channel"
	fromAkka = "from-akka-apps-redis-channel"
)

type busEnvelope struct {
	Envelope struct {
		Name      string            `json:"name"`
		Routing   map[string]string `json:"routing"`
		Timestamp int64             `json:"timestamp"`
	} `json:"envelope"`
	Core struct {
		Header map[string]string `json:"header"`
		Body   any               `json:"body"`
	} `json:"core"`
}

// publish sends a message as bbb-web or akka-apps would, if the fake has
// a redis. meetingID goes in the header and routing when the real message
// has it there, and is "" for system messages that only carry it in their
// body.
func (s *Server) publish(channel, sender, name, meetingID string, body any) {
	if s.Redis == nil {
		return
	}
	var m busEnvelope
	m.Envelope.Name, m.Envelope.Timestamp = name, s.clock
	m.Envelope.Routing = map[string]string{"sender": sender}
	m.Core.Header = map[string]string{"name": name}
	if meetingID != "" {
		m.Envelope.Routing = map[string]string{"meetingId": meetingID, "sender": sender}
		m.Core.Header["meetingId"] = meetingID
	}
	m.Core.Body = body
	b, _ := json.Marshal(m)
	s.Redis.Publish(channel, string(b))
}

// meetingProps is the fake's MeetingCreatedEvtMsg props: a few of akka-
// apps' DefaultProps, from the create params. As there, keepEvents is the
// meetingKeepEvents param alone, though a recorded meeting keeps its
// events too. The bbb-api fake drops muteOnStart, the kind of difference
// diff's props comparison is for.
func (s *Server) meetingProps(m *meeting, p url.Values) map[string]any {
	created := time.UnixMilli(m.createTime).UTC()
	return map[string]any{
		"meetingProp": map[string]any{"name": m.name, "extId": m.id, "intId": m.intID, "isBreakout": false},
		"durationProps": map[string]any{"duration": 0, "createdTime": m.createTime,
			"createdDate": created.Format("Mon Jan 02 15:04:05 MST 2006")},
		"password":   map[string]any{"moderatorPass": m.moderatorPW, "viewerPass": m.attendeePW},
		"recordProp": map[string]any{"record": p.Get("record") == "true", "keepEvents": m.meetingKeepEvents},
		"voiceProp": map[string]any{"telVoice": m.voiceConf, "voiceConf": m.voiceConf, "dialNumber": "613-555-1234",
			"muteOnStart": p.Get("muteOnStart") == "true" && !s.api},
		"metadataProp": map[string]any{"metadata": m.meta},
	}
}

// created does what a real create does outside its answer: bbb-web asks
// akka-apps to create the meeting, writes meeting:info when the meeting
// stores events, and akka-apps announces it.
func (s *Server) created(m *meeting, p url.Values) {
	props := s.meetingProps(m, p)
	s.publish(toAkka, "bbb-web", "CreateMeetingReqMsg", "", map[string]any{"props": props})
	if s.Redis != nil && m.keepEvents() {
		info := []string{"meetingId", m.id, "meetingName", m.name, "isBreakout", "false"}
		keys := make([]string, 0, len(m.meta))
		for k := range m.meta {
			keys = append(keys, k)
		}
		sort.Strings(keys)
		for _, k := range keys {
			info = append(info, k, m.meta[k])
		}
		s.Redis.HSet("meeting:info:"+m.intID, info...)
	}
	s.publish(fromAkka, "bbb-apps-akka", "MeetingCreatedEvtMsg", "", map[string]any{"props": props})
}

// ended does what a real end does: bbb-web asks akka-apps to end the
// meeting, akka-apps announces it, and bbb-web writes the recording
// markers. With DeleteMarkers, they go away at once, as record-and-
// playback's rap-starter does on a full install.
func (s *Server) ended(m *meeting) {
	s.publish(toAkka, "bbb-web", "EndMeetingSysCmdMsg", m.intID, map[string]any{"meetingId": m.intID, "userId": "not-used"})
	s.publish(fromAkka, "bbb-apps-akka", "MeetingEndedEvtMsg", "", map[string]any{"meetingId": m.intID})
	if s.DataDir == "" {
		return
	}
	var markers []string
	if m.record {
		markers = append(markers, "recording/status/recorded/"+m.intID+".done")
	}
	if m.keepEvents() {
		markers = append(markers, "recording/status/ended/"+m.intID+".done")
	}
	for _, rel := range markers {
		p := filepath.Join(s.DataDir, filepath.FromSlash(rel))
		if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
			continue
		}
		if err := os.WriteFile(p, nil, 0o644); err == nil && s.DeleteMarkers {
			os.Remove(p)
		}
	}
}

func (m *meeting) keepEvents() bool { return m.record || m.meetingKeepEvents }

// voiceBridge makes a meeting's voice bridge from the fake's counter.
func voiceBridge(seq int) string { return fmt.Sprintf("7%04d", seq%10000) }
