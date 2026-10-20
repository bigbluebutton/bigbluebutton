package streamingserver

import (
	"context"
	"encoding/json"
	"io"
	"strings"
	"sync"
	"testing"

	"bbb-graphql-middleware/internal/common"

	"github.com/sirupsen/logrus"
)

// discardLogger stands in for the per-connection logger that ConnectionHandler assigns in
// production. Handlers log through it, so a nil one turns a behavioural assertion into a panic.
func discardLogger() *logrus.Entry {
	logger := logrus.New()
	logger.SetOutput(io.Discard)

	return logrus.NewEntry(logger)
}

// newConn builds a BrowserConnection subscribed to one middleware-managed stream.
// Take the address: the struct embeds a mutex and must not be copied.
func newConn(userId, operationName string, inMeeting bool, sessionVars map[string]string) *common.BrowserConnection {
	if sessionVars == nil {
		sessionVars = map[string]string{}
	}

	return &common.BrowserConnection{
		MeetingId:              testMeetingId,
		UserId:                 userId,
		CurrentlyInMeeting:     inMeeting,
		BBBWebSessionVariables: sessionVars,
		ActiveStreamings:       map[string][]string{operationName: {"q-" + userId}},
		// Buffered so TrySend never drops in the test.
		FromHasuraToBrowserChannel: common.NewSafeChannelByte(10),
		Logger:                     discardLogger(),
		// SendWait (the replay paths) selects on ctx.Done(), so the context must be non-nil for a
		// failure to surface as one.
		Context: context.Background(),
	}
}

// drain returns everything queued for a connection without blocking.
func drain(bc *common.BrowserConnection) []string {
	var out []string
	for {
		select {
		case payload := <-bc.FromHasuraToBrowserChannel.ReceiveChannel():
			out = append(out, string(payload))
		default:
			return out
		}
	}
}

func msgFor(meetingId, userId string, body map[string]interface{}) common.RedisMessage {
	var m common.RedisMessage
	m.Core.Header.MeetingId = meetingId
	m.Core.Header.UserId = userId
	m.Core.Body = body

	return m
}

func chatBody(participants []any) map[string]interface{} {
	return map[string]interface{}{
		"chatId":           "MAIN-PUBLIC-GROUP-CHAT",
		"chatParticipants": participants,
		"msg": map[string]any{
			"message":       "board decision: we are letting Alice go",
			"messageAsHtml": "<p>board decision</p>",
			"id":            "msg-1",
			"metadata":      map[string]any{},
			"messageType":   "default",
			"sender": map[string]any{
				"id": "w_sender", "name": "Secret Victim Name", "role": "VIEWER",
			},
		},
	}
}

func TestChatStreamDeniesNonMembers(t *testing.T) {
	member := newConn("member", "getChatMessageStream", true, nil)
	ejected := newConn("ejected", "getChatMessageStream", false, nil)
	otherMeetingConn := newConn("other", "getChatMessageStream", true, nil)
	otherMeetingConn.MeetingId = otherMeeting

	conns := map[string]*common.BrowserConnection{
		"member": member, "ejected": ejected, "other": otherMeetingConn,
	}

	// Public chat: empty participant list.
	HandleGroupChatMessageBroadcastEvtMsg(msgFor(testMeetingId, "w_sender", chatBody([]any{})), &sync.RWMutex{}, conns)

	if got := drain(member); len(got) != 1 {
		t.Errorf("member got %d public chat messages, want 1", len(got))
	}
	if got := drain(ejected); len(got) != 0 {
		t.Errorf("ejected user got %d public chat messages, want 0: %v", len(got), got)
	}
	if got := drain(otherMeetingConn); len(got) != 0 {
		t.Errorf("connection in another meeting got %d messages, want 0", len(got))
	}
}

// Drives the whole path a reconnection request takes, from the reason akka-apps sends to whether a
// message is delivered. The two marks are independent: a lock change must not withhold data from a
// member, while a reason that could have ended membership must.
func TestChatStreamMembershipStaleness(t *testing.T) {
	lockChanged := newConn("lockChanged", "getChatMessageStream", true, nil)
	lockChanged.MarkSessionVariablesStale(common.ReconnectionAffectsMembership("lockSettings_changed"))

	ejected := newConn("ejected", "getChatMessageStream", true, nil)
	ejected.MarkSessionVariablesStale(common.ReconnectionAffectsMembership("user_requested_eject_reason"))

	// The eject paths send a human-readable sentence rather than a code, so an unrecognised reason
	// has to be treated the same way.
	freeText := newConn("freeText", "getChatMessageStream", true, nil)
	freeText.MarkSessionVariablesStale(common.ReconnectionAffectsMembership("No permission to eject user from meeting."))

	conns := map[string]*common.BrowserConnection{
		"lockChanged": lockChanged, "ejected": ejected, "freeText": freeText,
	}
	HandleGroupChatMessageBroadcastEvtMsg(msgFor(testMeetingId, "w_sender", chatBody(nil)), &sync.RWMutex{}, conns)

	if got := drain(lockChanged); len(got) != 1 {
		t.Errorf("member whose lock state is being re-read got %d messages, want 1", len(got))
	}
	if got := drain(ejected); len(got) != 0 {
		t.Errorf("member whose membership is unsettled received chat: %v", got)
	}
	if got := drain(freeText); len(got) != 0 {
		t.Errorf("member whose membership is unsettled by an unrecognised reason received chat: %v", got)
	}
}

// A private chat's participant list is not a membership check: an id can remain on it after the
// user is no longer in the meeting, so the membership gate still has to apply here.
func TestChatStreamDeniesEjectedPrivateChatParticipant(t *testing.T) {
	member := newConn("member", "getChatMessageStream", true, nil)
	ejected := newConn("ejected", "getChatMessageStream", false, nil)
	outsider := newConn("outsider", "getChatMessageStream", true, nil)

	conns := map[string]*common.BrowserConnection{
		"member": member, "ejected": ejected, "outsider": outsider,
	}

	// Private chat whose participant list still carries the departed user's id.
	participants := []any{"member", "ejected"}
	HandleGroupChatMessageBroadcastEvtMsg(msgFor(testMeetingId, "w_sender", chatBody(participants)), &sync.RWMutex{}, conns)

	if got := drain(member); len(got) != 1 {
		t.Errorf("remaining participant got %d private messages, want 1", len(got))
	}
	if got := drain(ejected); len(got) != 0 {
		t.Errorf("ejected participant still received private chat (%d msgs): %v", len(got), got)
	}
	if got := drain(outsider); len(got) != 0 {
		t.Errorf("non-participant received private chat (%d msgs)", len(got))
	}
}

func notificationBody(extra map[string]interface{}) map[string]interface{} {
	body := map[string]interface{}{
		"notificationType": "info",
		"icon":             "user",
		"messageId":        "app.notification.userJoinPushAlert",
		"messageValues":    map[string]any{"userName": "Secret Victim Name"},
	}
	for k, v := range extra {
		body[k] = v
	}

	return body
}

func TestNotifyAllDeniesNonMembers(t *testing.T) {
	member := newConn("member", "getNotificationStream", true, nil)
	lobby := newConn("lobby", "getNotificationStream", false, nil)

	conns := map[string]*common.BrowserConnection{"member": member, "lobby": lobby}
	HandleNotifyAllInMeetingEvtMsg(msgFor(testMeetingId, "", notificationBody(nil)), &sync.RWMutex{}, conns)

	if got := drain(member); len(got) != 1 {
		t.Errorf("member got %d notifications, want 1", len(got))
	}
	if got := drain(lobby); len(got) != 0 {
		t.Errorf("lobby guest received a join notification carrying a user name: %v", got)
	}
}

// X-Hasura-ModeratorInMeeting is derived from the RegisteredUser role, independently of current
// meeting membership, so membership must be checked before the role variable is trusted.
func TestNotifyRoleDeniesEjectedModerator(t *testing.T) {
	modVars := map[string]string{"x-hasura-moderatorinmeeting": testMeetingId}

	activeMod := newConn("activeMod", "getNotificationStream", true, modVars)
	ejectedMod := newConn("ejectedMod", "getNotificationStream", false, modVars)
	staleMod := newConn("staleMod", "getNotificationStream", true, modVars)
	staleMod.SessionVariablesStale = true

	conns := map[string]*common.BrowserConnection{
		"activeMod": activeMod, "ejectedMod": ejectedMod, "staleMod": staleMod,
	}
	HandleNotifyRoleInMeetingEvtMsg(
		msgFor(testMeetingId, "", notificationBody(map[string]interface{}{"role": "MODERATOR"})),
		&sync.RWMutex{}, conns)

	if got := drain(activeMod); len(got) != 1 {
		t.Errorf("active moderator got %d role notifications, want 1", len(got))
	}
	if got := drain(ejectedMod); len(got) != 0 {
		t.Errorf("ejected moderator still received a moderator notification: %v", got)
	}
	if got := drain(staleMod); len(got) != 0 {
		t.Errorf("moderator with an in-flight session refresh received a notification: %v", got)
	}
}

func cursorBody(fromViewer bool) map[string]interface{} {
	return map[string]interface{}{
		"userIsViewer": fromViewer,
		"xPercent":     float64(10),
		"yPercent":     float64(20),
	}
}

func TestCursorStreamMembershipAndLock(t *testing.T) {
	t.Cleanup(func() { RemoveMeetingCursorsCache(testMeetingId) })

	member := newConn("member", "getCursorCoordinatesStream", true, nil)
	// A non-member carries no cursor-lock variable at all, so membership has to be established
	// before the lock comparison is reached.
	nonMember := newConn("nonMember", "getCursorCoordinatesStream", false, nil)
	lockedMember := newConn("lockedMember", "getCursorCoordinatesStream", true,
		map[string]string{"x-hasura-cursorlockeduserid": "lockedMember"})
	// A refresh is in flight, so the lock state is unsettled and cannot be relied on.
	staleMember := newConn("staleMember", "getCursorCoordinatesStream", true, nil)
	staleMember.SessionVariablesStale = true

	conns := map[string]*common.BrowserConnection{
		"member": member, "nonMember": nonMember,
		"lockedMember": lockedMember, "staleMember": staleMember,
	}
	HandleSendCursorPositionEvtMsg(msgFor(testMeetingId, "w_viewer", cursorBody(true)), &sync.RWMutex{}, conns)

	if got := drain(member); len(got) != 1 {
		t.Errorf("member got %d cursor updates, want 1", len(got))
	}
	if got := drain(nonMember); len(got) != 0 {
		t.Errorf("non-member received viewer cursors: %v", got)
	}
	if got := drain(lockedMember); len(got) != 0 {
		t.Errorf("member with viewer cursors locked received them anyway: %v", got)
	}
	if got := drain(staleMember); len(got) != 0 {
		t.Errorf("member with an unsettled lock state received viewer cursors: %v", got)
	}

	// The lock covers viewer cursors only, so a moderator's cursor must still reach a locked
	// member. This keeps the gate from disabling the feature it is there to scope.
	HandleSendCursorPositionEvtMsg(msgFor(testMeetingId, "w_mod", cursorBody(false)), &sync.RWMutex{}, conns)

	if got := drain(lockedMember); len(got) != 1 {
		t.Errorf("locked member got %d moderator cursor updates, want 1", len(got))
	}
}

func TestSendPreviousCursorPositionDeniesNonMembers(t *testing.T) {
	t.Cleanup(func() { RemoveMeetingCursorsCache(testMeetingId) })

	StoreCursorsCache(testMeetingId, "w_viewer", map[string]any{
		"xPercent": float64(1), "yPercent": float64(2), "userId": "w_viewer", "__typename": "pres_page_cursor",
	}, true)

	nonMember := newConn("nonMember", "getCursorCoordinatesStream", false, nil)
	SendPreviousCursorPosition(nonMember, "q1")
	if got := drain(nonMember); len(got) != 0 {
		t.Errorf("non-member was replayed the cursor cache: %v", got)
	}

	member := newConn("member", "getCursorCoordinatesStream", true, nil)
	SendPreviousCursorPosition(member, "q2")
	got := drain(member)
	if len(got) != 1 || !strings.Contains(got[0], "w_viewer") {
		t.Errorf("member did not receive the cursor replay: %v", got)
	}
	if !json.Valid([]byte(got[0])) {
		t.Errorf("replay payload is not valid JSON: %s", got[0])
	}
}

// The lock covers other viewers' cursors only. Replaying all-or-nothing would also withhold the
// presenter's, which is the one a joining viewer most needs.
func TestSendPreviousCursorPositionFiltersPerRow(t *testing.T) {
	t.Cleanup(func() { RemoveMeetingCursorsCache(testMeetingId) })

	StoreCursorsCache(testMeetingId, "w_viewer", map[string]any{
		"xPercent": float64(1), "yPercent": float64(2), "userId": "w_viewer", "__typename": "pres_page_cursor",
	}, true)
	StoreCursorsCache(testMeetingId, "w_presenter", map[string]any{
		"xPercent": float64(3), "yPercent": float64(4), "userId": "w_presenter", "__typename": "pres_page_cursor",
	}, false)

	lockedViewer := newConn("lockedViewer", "getCursorCoordinatesStream", true,
		map[string]string{"x-hasura-cursorlockeduserid": "lockedViewer"})
	if !SendPreviousCursorPosition(lockedViewer, "q1") {
		t.Fatal("a member must be replayed")
	}

	got := drain(lockedViewer)
	if len(got) != 1 {
		t.Fatalf("locked viewer got %d replay frames, want 1: %v", len(got), got)
	}
	if strings.Contains(got[0], "w_viewer") {
		t.Errorf("replay included another viewer's cursor: %s", got[0])
	}
	if !strings.Contains(got[0], "w_presenter") {
		t.Errorf("replay dropped the presenter cursor the lock does not cover: %s", got[0])
	}
}

// The cached row is marshalled verbatim, so the flag the replay filters on must live beside it
// rather than inside it.
func TestCursorReplayCarriesOnlySubscriptionFields(t *testing.T) {
	t.Cleanup(func() { RemoveMeetingCursorsCache(testMeetingId) })

	StoreCursorsCache(testMeetingId, "w_viewer", map[string]any{
		"xPercent": float64(1), "yPercent": float64(2), "userId": "w_viewer", "__typename": "pres_page_cursor",
	}, true)

	member := newConn("member", "getCursorCoordinatesStream", true, nil)
	SendPreviousCursorPosition(member, "q1")

	got := drain(member)
	if len(got) != 1 {
		t.Fatalf("member got %d replay frames, want 1", len(got))
	}

	var frame struct {
		Payload struct {
			Data struct {
				Cursors []map[string]any `json:"pres_page_cursor_stream"`
			} `json:"data"`
		} `json:"payload"`
	}
	if err := json.Unmarshal([]byte(got[0]), &frame); err != nil {
		t.Fatalf("replay payload is not valid JSON: %v", err)
	}
	if len(frame.Payload.Data.Cursors) != 1 {
		t.Fatalf("got %d cursors in the replay, want 1", len(frame.Payload.Data.Cursors))
	}
	for key := range frame.Payload.Data.Cursors[0] {
		switch key {
		case "xPercent", "yPercent", "userId", "__typename":
		default:
			t.Errorf("replayed cursor carries %q, which is not one of the subscription's fields", key)
		}
	}
}

func voiceBody() map[string]interface{} {
	return map[string]interface{}{
		"userId": "w_speaker", "voiceUserId": "vu1", "userRole": "VIEWER",
		"userName": "Secret Victim Name", "userColor": "#fff", "userSpeechLocale": "en",
		"talking": true, "muted": false, "leftVoiceConf": false,
	}
}

func TestVoiceStreamDeniesNonMembers(t *testing.T) {
	t.Cleanup(func() { RemoveMeetingUserVoiceStatesCache(testMeetingId) })

	// An in-meeting connection always carries this variable in production - set to the meeting id
	// while the user list is unlocked, cleared when hideUserList is on - so nil would be an
	// unrealistic fixture now that an absent value correctly reads as "locked".
	member := newConn("member", "getUserVoiceStateStream", true, userListUnlocked())
	nonMember := newConn("nonMember", "getUserVoiceStateStream", false, nil)

	conns := map[string]*common.BrowserConnection{"member": member, "nonMember": nonMember}
	HandleUserVoiceStateEvtMsg(msgFor(testMeetingId, "w_speaker", voiceBody()), &sync.RWMutex{}, conns)

	if got := drain(member); len(got) != 1 {
		t.Errorf("member got %d voice rows, want 1", len(got))
	}
	if got := drain(nonMember); len(got) != 0 {
		t.Errorf("non-member received voice state carrying a name: %v", got)
	}

	// The replay path must apply the same rule.
	replayTarget := newConn("replay", "getUserVoiceStateStream", false, nil)
	SendPreviousUserVoiceState(replayTarget, "q1")
	if got := drain(replayTarget); len(got) != 0 {
		t.Errorf("non-member was replayed cached voice state: %v", got)
	}
}

func userListUnlocked() map[string]string {
	return map[string]string{"x-hasura-userlistnotlockedinmeeting": testMeetingId}
}

// hideUserList is on: the lock variable is present but cleared.
func userListLocked() map[string]string {
	return map[string]string{"x-hasura-userlistnotlockedinmeeting": ""}
}

func moderatorVoiceBody() map[string]interface{} {
	body := voiceBody()
	body["userRole"] = "MODERATOR"

	return body
}

// The talking indicator carries the speaker's name, so it is subject to hideUserList: a locked
// viewer must not learn who is in the meeting from it.
func TestVoiceStreamRespectsHideUserList(t *testing.T) {
	t.Cleanup(func() { RemoveMeetingUserVoiceStatesCache(testMeetingId) })

	lockedViewer := newConn("lockedViewer", "getUserVoiceStateStream", true, userListLocked())
	unlockedViewer := newConn("unlockedViewer", "getUserVoiceStateStream", true, userListUnlocked())
	// Locked, but is the speaker: must still receive their own mute/talking state.
	speakerSelf := newConn("w_speaker", "getUserVoiceStateStream", true, userListLocked())
	// Locked, and a refresh is in flight, so the lock state cannot be trusted.
	staleViewer := newConn("staleViewer", "getUserVoiceStateStream", true, userListUnlocked())
	staleViewer.SessionVariablesStale = true

	conns := map[string]*common.BrowserConnection{
		"lockedViewer": lockedViewer, "unlockedViewer": unlockedViewer,
		"w_speaker": speakerSelf, "staleViewer": staleViewer,
	}

	// A VIEWER speaks.
	HandleUserVoiceStateEvtMsg(msgFor(testMeetingId, "w_speaker", voiceBody()), &sync.RWMutex{}, conns)

	if got := drain(lockedViewer); len(got) != 0 {
		t.Errorf("locked viewer received a hidden speaker's voice state: %v", got)
	}
	if got := drain(unlockedViewer); len(got) != 1 {
		t.Errorf("unlocked viewer got %d voice rows, want 1", len(got))
	}
	if got := drain(speakerSelf); len(got) != 1 {
		t.Errorf("speaker got %d rows for their own voice state, want 1", len(got))
	}
	if got := drain(staleViewer); len(got) != 0 {
		t.Errorf("viewer with an in-flight refresh received voice state: %v", got)
	}
}

// Moderators are exempt from hideUserList, so a locked viewer must still see them talking -
// otherwise the gate would break the indicator instead of securing it.
func TestVoiceStreamAllowsModeratorSpeakerToLockedViewer(t *testing.T) {
	t.Cleanup(func() { RemoveMeetingUserVoiceStatesCache(testMeetingId) })

	lockedViewer := newConn("lockedViewer", "getUserVoiceStateStream", true, userListLocked())
	conns := map[string]*common.BrowserConnection{"lockedViewer": lockedViewer}

	HandleUserVoiceStateEvtMsg(msgFor(testMeetingId, "w_speaker", moderatorVoiceBody()), &sync.RWMutex{}, conns)

	if got := drain(lockedViewer); len(got) != 1 {
		t.Errorf("locked viewer got %d rows for a moderator speaker, want 1", len(got))
	}
}

// The replay path filters per row, so a locked viewer subscribing mid-meeting gets the moderator
// rows already cached but not the viewer ones.
func TestSendPreviousUserVoiceStateFiltersHiddenSpeakers(t *testing.T) {
	t.Cleanup(func() { RemoveMeetingUserVoiceStatesCache(testMeetingId) })

	all := map[string]*common.BrowserConnection{}
	HandleUserVoiceStateEvtMsg(msgFor(testMeetingId, "w_speaker", voiceBody()), &sync.RWMutex{}, all)

	modBody := moderatorVoiceBody()
	modBody["userId"] = "w_mod"
	modBody["userName"] = "Visible Moderator"
	HandleUserVoiceStateEvtMsg(msgFor(testMeetingId, "w_mod", modBody), &sync.RWMutex{}, all)

	lockedViewer := newConn("lockedViewer", "getUserVoiceStateStream", true, userListLocked())
	SendPreviousUserVoiceState(lockedViewer, "q1")

	got := drain(lockedViewer)
	if len(got) != 1 {
		t.Fatalf("locked viewer got %d replay payloads, want 1: %v", len(got), got)
	}
	if strings.Contains(got[0], "Secret Victim Name") {
		t.Errorf("replay leaked a hidden viewer name: %s", got[0])
	}
	if !strings.Contains(got[0], "Visible Moderator") {
		t.Errorf("replay dropped the moderator row it should have kept: %s", got[0])
	}

	// The same replay to a connection whose lock state is unsettled rather than locked: the
	// lock-governed row is withheld on that basis alone, while the moderator row stays exempt.
	staleViewer := newConn("staleViewer", "getUserVoiceStateStream", true, userListUnlocked())
	staleViewer.SessionVariablesStale = true
	SendPreviousUserVoiceState(staleViewer, "q2")

	gotStale := drain(staleViewer)
	if len(gotStale) != 1 {
		t.Fatalf("viewer with an unsettled lock state got %d replay payloads, want 1: %v", len(gotStale), gotStale)
	}
	if strings.Contains(gotStale[0], "Secret Victim Name") {
		t.Errorf("replay to an unsettled connection included a lock-governed row: %s", gotStale[0])
	}
}

// A row carrying no speaker id must be settled by the lock check rather than matching the
// recipient's own id.
func TestVoiceStreamAnonymousSpeakerIsSubjectToHideUserList(t *testing.T) {
	t.Cleanup(func() { RemoveMeetingUserVoiceStatesCache(testMeetingId) })

	// A connection whose own user id is not yet populated, with the user list locked.
	unidentified := newConn("", "getUserVoiceStateStream", true, userListLocked())
	conns := map[string]*common.BrowserConnection{"unidentified": unidentified}

	body := voiceBody()
	body["userId"] = ""
	HandleUserVoiceStateEvtMsg(msgFor(testMeetingId, "w_speaker", body), &sync.RWMutex{}, conns)

	if got := drain(unidentified); len(got) != 0 {
		t.Errorf("connection with no user id received a lock-governed speaker's voice state: %v", got)
	}
}

// A MODERATOR speaker short-circuits the hideUserList check, leaving membership as the only
// condition this path depends on, so this case is what pins it. The other voice tests would be
// satisfied by the lock check alone.
func TestVoiceStreamDeniesNonMembersForModeratorSpeaker(t *testing.T) {
	t.Cleanup(func() { RemoveMeetingUserVoiceStatesCache(testMeetingId) })

	member := newConn("member", "getUserVoiceStateStream", true, userListUnlocked())
	nonMember := newConn("nonMember", "getUserVoiceStateStream", false, userListUnlocked())
	conns := map[string]*common.BrowserConnection{"member": member, "nonMember": nonMember}

	HandleUserVoiceStateEvtMsg(msgFor(testMeetingId, "w_mod", moderatorVoiceBody()), &sync.RWMutex{}, conns)

	if got := drain(member); len(got) != 1 {
		t.Errorf("member got %d voice rows for a moderator speaker, want 1", len(got))
	}
	if got := drain(nonMember); len(got) != 0 {
		t.Errorf("non-member received a moderator speaker's voice state: %v", got)
	}

	// The replay path carries the same asymmetry: the moderator row just cached above is withheld
	// from a non-member only by inMeeting.
	replayTarget := newConn("replay", "getUserVoiceStateStream", false, userListUnlocked())
	SendPreviousUserVoiceState(replayTarget, "q1")
	if got := drain(replayTarget); len(got) != 0 {
		t.Errorf("non-member was replayed a moderator speaker's cached voice state: %v", got)
	}
}

// The client clears its loading state on the first frame and suppresses the talking indicator
// until then, so a permitted recipient whose rows all filter out still needs a frame.
func TestSendPreviousUserVoiceStateSendsEmptyFrameWhenAllFiltered(t *testing.T) {
	t.Cleanup(func() { RemoveMeetingUserVoiceStatesCache(testMeetingId) })

	HandleUserVoiceStateEvtMsg(msgFor(testMeetingId, "w_speaker", voiceBody()),
		&sync.RWMutex{}, map[string]*common.BrowserConnection{})

	lockedViewer := newConn("lockedViewer", "getUserVoiceStateStream", true, userListLocked())
	if !SendPreviousUserVoiceState(lockedViewer, "q1") {
		t.Fatal("a member must be replayed")
	}

	got := drain(lockedViewer)
	if len(got) != 1 {
		t.Fatalf("locked viewer got %d replay frames, want 1: %v", len(got), got)
	}
	if strings.Contains(got[0], "Secret Victim Name") {
		t.Errorf("replay leaked a hidden speaker: %s", got[0])
	}
	if !strings.Contains(got[0], `"user_voice_activity_stream":[]`) {
		t.Errorf("want an empty stream array rather than no frame, got: %s", got[0])
	}
}

// The client opens its GraphQL connection before joining, so a subscribe routinely lands while the
// connection is settled and not yet a member. The replay has to arrive when membership does.
func TestWithheldReplayIsDeliveredOnceMembershipArrives(t *testing.T) {
	t.Cleanup(func() { RemoveMeetingCursorsCache(testMeetingId) })

	StoreCursorsCache(testMeetingId, "w_presenter", map[string]any{
		"xPercent": float64(3), "yPercent": float64(4), "userId": "w_presenter", "__typename": "pres_page_cursor",
	}, false)

	joining := newConn("joining", "getCursorCoordinatesStream", false, nil)
	if sendStreamReplay(joining, "getCursorCoordinatesStream", "q-joining") {
		t.Fatal("a connection that is not in the meeting must not be replayed")
	}
	joining.MarkStreamReplayPending("getCursorCoordinatesStream", "q-joining")
	if got := drain(joining); len(got) != 0 {
		t.Fatalf("a non-member received a replay: %v", got)
	}

	// The join lands: membership goes unsettled, then a refresh publishes it.
	joining.MarkSessionVariablesStale(common.ReconnectionAffectsMembership("user_joined"))
	generation, _, _, _ := joining.SessionVariablesRefreshTarget()
	joining.ApplySessionVariables(generation, map[string]string{"x-hasura-role": "bbb_client"}, true)

	ReplayPendingStreams(joining)

	got := drain(joining)
	if len(got) != 1 {
		t.Fatalf("got %d replay frames after joining, want 1: %v", len(got), got)
	}
	if !strings.Contains(got[0], "w_presenter") {
		t.Errorf("the replay delivered after joining did not carry the cached cursor: %s", got[0])
	}
}

func TestPendingReplayIsKeptWhileStillNotAMember(t *testing.T) {
	t.Cleanup(func() { RemoveMeetingCursorsCache(testMeetingId) })

	StoreCursorsCache(testMeetingId, "w_presenter", map[string]any{
		"xPercent": float64(3), "yPercent": float64(4), "userId": "w_presenter", "__typename": "pres_page_cursor",
	}, false)

	outsider := newConn("outsider", "getCursorCoordinatesStream", false, nil)
	outsider.MarkStreamReplayPending("getCursorCoordinatesStream", "q-outsider")

	ReplayPendingStreams(outsider)

	if got := drain(outsider); len(got) != 0 {
		t.Fatalf("a connection that is still not a member was replayed: %v", got)
	}
	if pending := outsider.TakePendingStreamReplays(); len(pending["getCursorCoordinatesStream"]) != 1 {
		t.Error("a replay that is still undeliverable must stay pending rather than be dropped")
	}
}

// HandleNotifyUserInMeetingEvtMsg was the one handler in notificationStream.go with no coverage.
func TestNotifyUserDeniesNonMembers(t *testing.T) {
	member := newConn("target", "getNotificationStream", true, nil)
	ejected := newConn("ejectedTarget", "getNotificationStream", false, nil)

	HandleNotifyUserInMeetingEvtMsg(
		msgFor(testMeetingId, "w_sender", notificationBody(map[string]interface{}{"userId": "target"})),
		&sync.RWMutex{}, map[string]*common.BrowserConnection{"target": member})
	if got := drain(member); len(got) != 1 {
		t.Errorf("targeted member got %d notifications, want 1", len(got))
	}

	HandleNotifyUserInMeetingEvtMsg(
		msgFor(testMeetingId, "w_sender", notificationBody(map[string]interface{}{"userId": "ejectedTarget"})),
		&sync.RWMutex{}, map[string]*common.BrowserConnection{"ejectedTarget": ejected})
	if got := drain(ejected); len(got) != 0 {
		t.Errorf("ejected user received a user-targeted notification: %v", got)
	}
}
