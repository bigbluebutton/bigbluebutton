package tap

import "encoding/json"

// idPaths are where a message keeps the meeting IDs it is about, most
// specific first.
var idPaths = [][]string{
	{"core", "header", "meetingId"},
	{"envelope", "routing", "meetingId"},
	{"core", "body", "meetingId"},
	{"core", "body", "props", "meetingProp", "intId"},
	{"core", "body", "meetingInfo", "internalId"},
	{"core", "body", "recordId"},
	{"core", "body", "room", "breakoutMeetingId"},
}

// index reads a message's name and the meeting IDs it is about, from
// {"envelope":{"name","routing"},"core":{"header":{"name","meetingId"},"body"}}.
// Where a message keeps its meeting ID depends on the message: in the
// header for most, only in the body for system messages such as
// MeetingCreatedEvtMsg (props.meetingProp.intId) or MeetingEndedEvtMsg
// (meetingId). A breakout room's creation is about both the parent and
// the room. Each field is read on its own, so one of another type doesn't
// hide the rest; a payload that isn't a JSON object gets no name and no
// IDs.
func index(raw []byte) (name string, ids []string) {
	var m map[string]any
	if json.Unmarshal(raw, &m) != nil {
		return "", nil
	}
	name = field(m, "envelope", "name")
	if name == "" {
		name = field(m, "core", "header", "name")
	}
	for _, p := range idPaths {
		if id := field(m, p...); id != "" && !contains(ids, id) {
			ids = append(ids, id)
		}
	}
	return name, ids
}

// field is the string at path in v, or "" when there is none.
func field(v any, path ...string) string {
	for _, k := range path {
		o, ok := v.(map[string]any)
		if !ok {
			return ""
		}
		v = o[k]
	}
	s, _ := v.(string)
	return s
}

func contains(list []string, s string) bool {
	for _, x := range list {
		if x == s {
			return true
		}
	}
	return false
}
