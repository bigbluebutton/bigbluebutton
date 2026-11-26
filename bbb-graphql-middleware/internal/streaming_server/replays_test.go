package streamingserver

import (
	"context"
	"io"
	"strings"
	"testing"

	"bbb-graphql-middleware/config"
	"bbb-graphql-middleware/internal/common"

	"github.com/sirupsen/logrus"
)

func newReplayTestConnection() (*common.BrowserConnection, *logrus.Logger) {
	logger := logrus.New()
	logger.SetOutput(io.Discard)

	return &common.BrowserConnection{
		MeetingId:                  testMeetingId,
		UserId:                     "user-1",
		Context:                    context.Background(),
		ActiveStreamings:           make(map[string][]string),
		FromHasuraToBrowserChannel: common.NewSafeChannelByte(4),
		Logger:                     logrus.NewEntry(logger),
	}, logger
}

func subscribeMessage(operationName string) []byte {
	return []byte(`{"id":"q1","type":"subscribe","payload":{"operationName":"` + operationName + `"}}`)
}

func replayFrames(bc *common.BrowserConnection) int {
	return len(bc.FromHasuraToBrowserChannel.ReceiveChannel())
}

// runOnDeferral runs fn at the moment a subscription's replay has been recorded as pending. It
// keys on the debug message the reader logs right after recording it, so it depends on that text.
type runOnDeferral struct {
	fn    func()
	fired bool
}

func (h *runOnDeferral) Levels() []logrus.Level { return []logrus.Level{logrus.DebugLevel} }

func (h *runOnDeferral) Fire(entry *logrus.Entry) error {
	if !h.fired && strings.HasPrefix(entry.Message, "Deferred ") {
		h.fired = true
		h.fn()
	}

	return nil
}

func TestReplayStaysPendingUntilMembershipArrives(t *testing.T) {
	bc, _ := newReplayTestConnection()

	_ = ReadNewStreamingSubscription(bc, subscribeMessage(config.OpUserVoiceStateStream))
	if frames := replayFrames(bc); frames != 0 {
		t.Fatalf("a connection that is not in the meeting was sent %d replay frames", frames)
	}

	// What refreshSessionVariablesUntilSettled does once a refresh settles.
	bc.ApplySessionVariables(0, map[string]string{}, true)
	ReplayPendingStreams(bc)

	if frames := replayFrames(bc); frames != 1 {
		t.Fatalf("the deferred replay produced %d frames once membership arrived, want 1", frames)
	}
	if pending := bc.TakePendingStreamReplays(); len(pending) != 0 {
		t.Fatalf("a delivered replay is still recorded as pending: %v", pending)
	}
}

// The client subscribes once, so a replay recorded as pending after the refresh that brought
// membership has already drained the pending replays would otherwise wait for a refresh that may
// never come.
func TestReplayIsDeliveredWhenMembershipSettledBeforeItWasRecorded(t *testing.T) {
	bc, logger := newReplayTestConnection()
	logger.SetLevel(logrus.DebugLevel)

	// The refresh settled, and drained, before the subscription's replay was recorded: by the time
	// the entry exists, the connection is a member and nothing is coming back for it.
	settled := &runOnDeferral{fn: func() {
		bc.ApplySessionVariables(0, map[string]string{}, true)
	}}
	logger.AddHook(settled)

	_ = ReadNewStreamingSubscription(bc, subscribeMessage(config.OpCursorCoordinatesStream))

	if !settled.fired {
		t.Fatal("the replay was never deferred, so this test did not exercise the race")
	}
	if frames := replayFrames(bc); frames != 1 {
		t.Fatalf("the subscriber was sent %d replay frames, want exactly 1 (still pending: %v)",
			frames, bc.TakePendingStreamReplays())
	}
}

// The same moment, with the refresh draining after the replay was recorded: the replay must not
// then be sent a second time.
func TestReplayIsNotSentTwiceWhenTheRefreshDrainsIt(t *testing.T) {
	bc, logger := newReplayTestConnection()
	logger.SetLevel(logrus.DebugLevel)

	settled := &runOnDeferral{fn: func() {
		bc.ApplySessionVariables(0, map[string]string{}, true)
		ReplayPendingStreams(bc)
	}}
	logger.AddHook(settled)

	_ = ReadNewStreamingSubscription(bc, subscribeMessage(config.OpCursorCoordinatesStream))

	if !settled.fired {
		t.Fatal("the replay was never deferred, so this test did not exercise the race")
	}
	if frames := replayFrames(bc); frames != 1 {
		t.Fatalf("the subscriber was sent %d replay frames, want exactly 1", frames)
	}
}
