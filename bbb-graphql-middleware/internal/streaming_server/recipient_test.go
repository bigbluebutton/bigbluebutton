package streamingserver

import (
	"testing"

	"bbb-graphql-middleware/internal/common"
)

const (
	testMeetingId = "m1"
	otherMeeting  = "m2"
)

func TestInMeeting(t *testing.T) {
	tests := []struct {
		name      string
		recipient streamingRecipient
		meetingId string
		want      bool
	}{
		{
			name:      "member of the meeting",
			recipient: streamingRecipient{MeetingId: testMeetingId, UserId: "u1", CurrentlyInMeeting: true},
			meetingId: testMeetingId,
			want:      true,
		},
		{
			// The ejected / guest-lobby / already-left case: a valid session token and the right
			// meeting id, but no membership.
			name:      "not currently in meeting",
			recipient: streamingRecipient{MeetingId: testMeetingId, UserId: "u1", CurrentlyInMeeting: false},
			meetingId: testMeetingId,
			want:      false,
		},
		{
			name:      "member of a different meeting",
			recipient: streamingRecipient{MeetingId: otherMeeting, UserId: "u1", CurrentlyInMeeting: true},
			meetingId: testMeetingId,
			want:      false,
		},
		{
			// Both sides empty must not compare equal.
			name:      "connection before connection_init completes",
			recipient: streamingRecipient{},
			meetingId: "",
			want:      false,
		},
		{
			// Membership holds and both ids are empty, so the explicit empty-id guard is the only
			// thing that can decide this case. Keep it distinct from the one above, where the zero
			// value of CurrentlyInMeeting would settle it regardless.
			name:      "empty meeting id against a connection that is in a meeting",
			recipient: streamingRecipient{MeetingId: "", UserId: "u1", CurrentlyInMeeting: true},
			meetingId: "",
			want:      false,
		},
		{
			name:      "uninitialised connection against a real meeting",
			recipient: streamingRecipient{},
			meetingId: testMeetingId,
			want:      false,
		},
		{
			// A reconnection whose reason could have moved the user out of the meeting leaves the
			// cached value unsettled; it must not be reused until a refresh publishes the current
			// one.
			name: "membership unsettled",
			recipient: streamingRecipient{
				MeetingId: testMeetingId, UserId: "u1", CurrentlyInMeeting: true, MembershipStale: true,
			},
			meetingId: testMeetingId,
			want:      false,
		},
		{
			// A role or lock change cannot move a user in or out of a meeting. Membership stays
			// settled, so stream data must keep flowing while the lock state is re-read.
			name: "lock state unsettled, membership settled",
			recipient: streamingRecipient{
				MeetingId: testMeetingId, UserId: "u1", CurrentlyInMeeting: true, SessionVarsStale: true,
			},
			meetingId: testMeetingId,
			want:      true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := tt.recipient.inMeeting(tt.meetingId); got != tt.want {
				t.Errorf("inMeeting(%q) = %v, want %v", tt.meetingId, got, tt.want)
			}
		})
	}
}

func TestSessionVarsSettled(t *testing.T) {
	if !(streamingRecipient{}).sessionVarsSettled() {
		t.Error("a settled connection should report its session variables as usable")
	}
	if (streamingRecipient{SessionVarsStale: true}).sessionVarsSettled() {
		t.Error("a refresh in flight must report the session variables as unusable")
	}
}

func TestSnapshotStreamingRecipient(t *testing.T) {
	bc := &common.BrowserConnection{
		MeetingId:          testMeetingId,
		UserId:             "u1",
		CurrentlyInMeeting: true,
		BBBWebSessionVariables: map[string]string{
			"x-hasura-moderatorinmeeting": testMeetingId,
		},
	}

	got := snapshotStreamingRecipient(bc)
	if got.MeetingId != testMeetingId || got.UserId != "u1" || !got.CurrentlyInMeeting || got.SessionVarsStale {
		t.Errorf("snapshot = %+v, want the connection's values", got)
	}
	if got.sessionVar("x-hasura-moderatorinmeeting") != testMeetingId {
		t.Error("session variables did not survive the snapshot")
	}

	// A nil session-variable map must read as absent, not panic.
	bare := snapshotStreamingRecipient(&common.BrowserConnection{MeetingId: testMeetingId})
	if bare.sessionVar("x-hasura-moderatorinmeeting") != "" {
		t.Error("nil session variables should read as empty")
	}
}
