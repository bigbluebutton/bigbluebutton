package tap

import "encoding/json"

// envelope is the part of a BigBlueButton bus message the tap reads:
// {"envelope":{"name","routing"},"core":{"header":{"name","meetingId"},"body"}}.
type envelope struct {
	Envelope struct {
		Name    string         `json:"name"`
		Routing map[string]any `json:"routing"`
	} `json:"envelope"`
	Core struct {
		Header struct {
			Name      string `json:"name"`
			MeetingID string `json:"meetingId"`
		} `json:"header"`
		Body struct {
			MeetingID string `json:"meetingId"`
			Props     struct {
				MeetingProp struct {
					IntID string `json:"intId"`
				} `json:"meetingProp"`
			} `json:"props"`
			MeetingInfo struct {
				InternalID string `json:"internalId"`
			} `json:"meetingInfo"`
			RecordID string `json:"recordId"`
			Room     struct {
				BreakoutMeetingID string `json:"breakoutMeetingId"`
			} `json:"room"`
		} `json:"body"`
	} `json:"core"`
}

// index reads a message's name and the meeting IDs it is about. Where a
// message keeps its meeting ID depends on the message: in the header for
// most, only in the body for system messages such as MeetingCreatedEvtMsg
// (props.meetingProp.intId) or MeetingEndedEvtMsg (meetingId). A breakout
// room's creation is about both the parent and the room. A payload that
// isn't such a message gets no name and no IDs.
func index(raw []byte) (name string, ids []string) {
	var m envelope
	if json.Unmarshal(raw, &m) != nil {
		return "", nil
	}
	name = m.Envelope.Name
	if name == "" {
		name = m.Core.Header.Name
	}
	routing, _ := m.Envelope.Routing["meetingId"].(string)
	b := m.Core.Body
	for _, id := range []string{m.Core.Header.MeetingID, routing, b.MeetingID, b.Props.MeetingProp.IntID,
		b.MeetingInfo.InternalID, b.RecordID, b.Room.BreakoutMeetingID} {
		if id != "" && !contains(ids, id) {
			ids = append(ids, id)
		}
	}
	return name, ids
}

func contains(list []string, s string) bool {
	for _, x := range list {
		if x == s {
			return true
		}
	}
	return false
}
