package tap

import "encoding/json"

// index reads a message's name and the meeting IDs it is about, from
// {"envelope":{"name","routing"},"core":{"header":{"name","meetingId"},"body"}}.
// Where a message keeps its meeting ID depends on the message: in the
// header for most, only in the body for system messages such as
// MeetingCreatedEvtMsg (props.meetingProp.intId) or MeetingEndedEvtMsg
// (meetingId). A breakout room's creation is about both the parent and
// the room. Each field is read on its own, so one of another type doesn't
// hide the rest, and only the objects on the way to them are parsed; a
// payload that isn't a JSON object gets no name and no IDs.
func index(raw []byte) (name string, ids []string) {
	top := object(raw)
	if top == nil {
		return "", nil
	}
	env, core := object(top["envelope"]), object(top["core"])
	header, body := object(core["header"]), object(core["body"])
	name = str(env["name"])
	if name == "" {
		name = str(header["name"])
	}
	for _, id := range []string{
		str(header["meetingId"]),
		str(object(env["routing"])["meetingId"]),
		str(body["meetingId"]),
		str(object(object(body["props"])["meetingProp"])["intId"]),
		str(object(body["meetingInfo"])["internalId"]),
		str(body["recordId"]),
		str(object(body["room"])["breakoutMeetingId"]),
	} {
		if id != "" && !contains(ids, id) {
			ids = append(ids, id)
		}
	}
	return name, ids
}

// object is a JSON object's members, unparsed, or nil when raw isn't one.
func object(raw []byte) map[string]json.RawMessage {
	var o map[string]json.RawMessage
	if len(raw) == 0 || json.Unmarshal(raw, &o) != nil {
		return nil
	}
	return o
}

// str is a JSON string's value, or "" when raw isn't one.
func str(raw []byte) string {
	var s string
	if len(raw) == 0 || json.Unmarshal(raw, &s) != nil {
		return ""
	}
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
