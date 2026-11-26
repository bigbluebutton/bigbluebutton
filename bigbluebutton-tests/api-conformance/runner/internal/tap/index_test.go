package tap

import (
	"fmt"
	"testing"
)

func TestIndex(t *testing.T) {
	for raw, want := range map[string]string{
		// A meeting message: the ID is in the header and the routing.
		`{"envelope":{"name":"UserJoinedMeetingEvtMsg","routing":{"meetingId":"m1","userId":"w_1"}},"core":{"header":{"name":"UserJoinedMeetingEvtMsg","meetingId":"m1"},"body":{"intId":"w_1"}}}`: "UserJoinedMeetingEvtMsg [m1]",
		// System messages keep it only in the body.
		`{"envelope":{"name":"MeetingCreatedEvtMsg","routing":{"sender":"bbb-apps-akka"}},"core":{"header":{"name":"MeetingCreatedEvtMsg"},"body":{"props":{"meetingProp":{"intId":"m2","extId":"x"}}}}}`: "MeetingCreatedEvtMsg [m2]",
		`{"envelope":{"name":"MeetingEndedEvtMsg","routing":{"sender":"bbb-apps-akka"}},"core":{"header":{"name":"MeetingEndedEvtMsg"},"body":{"meetingId":"m3"}}}`:                                       "MeetingEndedEvtMsg [m3]",
		`{"envelope":{"name":"MeetingInfoAnalyticsServiceMsg","routing":{}},"core":{"header":{"name":"MeetingInfoAnalyticsServiceMsg"},"body":{"meetingInfo":{"internalId":"m4"}}}}`:                      "MeetingInfoAnalyticsServiceMsg [m4]",
		`{"envelope":{"name":"PublishedRecordingSysMsg","routing":{"sender":"bbb-web"}},"core":{"header":{"name":"PublishedRecordingSysMsg"},"body":{"recordId":"m5"}}}`:                                  "PublishedRecordingSysMsg [m5]",
		// A breakout room's creation is about the parent and the room.
		`{"envelope":{"name":"CreateBreakoutRoomSysCmdMsg","routing":{"sender":"bbb-apps-akka"}},"core":{"header":{"name":"CreateBreakoutRoomSysCmdMsg"},"body":{"meetingId":"p1","room":{"breakoutMeetingId":"b1","parentId":"p1"}}}}`: "CreateBreakoutRoomSysCmdMsg [p1 b1]",
		// The middleware's messages name no meeting, and the header name
		// stands in for a missing envelope name.
		`{"envelope":{"routing":{"sender":"bbb-graphql-middleware"}},"core":{"header":{"name":"UserGraphqlConnectionClosedSysMsg"},"body":{"sessionToken":"t"}}}`: "UserGraphqlConnectionClosedSysMsg []",
		// A field of another type hides nothing else.
		`{"envelope":{"name":"SomeEvtMsg","routing":{"meetingId":"m6"}},"core":{"header":{"name":"SomeEvtMsg","meetingId":7},"body":{"meetingId":"m7","room":"r","props":[1]}}}`: "SomeEvtMsg [m6 m7]",
		`not json`:   " []",
		`["a list"]`: " []",
	} {
		name, ids := index([]byte(raw))
		if got := fmt.Sprintf("%s %v", name, ids); got != want {
			t.Errorf("%.60s: got %q, want %q", raw, got, want)
		}
	}
}
