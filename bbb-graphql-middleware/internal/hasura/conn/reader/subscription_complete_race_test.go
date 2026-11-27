package reader

import (
	"bytes"
	"context"
	"hash/crc32"
	"testing"

	_ "bbb-graphql-middleware/config/testconfig"
	"bbb-graphql-middleware/internal/common"
	"github.com/sirupsen/logrus"
)

func newTestHasuraConnection(t *testing.T) *common.HasuraConnection {
	t.Helper()

	ctx, cancel := context.WithCancel(context.Background())
	t.Cleanup(cancel)
	browserConnection := &common.BrowserConnection{
		Id:                         "browser-1",
		MeetingId:                  "meeting-1",
		CurrentlyInMeeting:         true,
		Context:                    ctx,
		ContextCancelFunc:          cancel,
		ActiveSubscriptions:        make(map[string]common.GraphQlSubscription),
		FromBrowserToHasuraChannel: common.NewSafeChannelByte(1),
		FromHasuraToBrowserChannel: common.NewSafeChannelByte(1),
		Logger:                     logrus.NewEntry(logrus.New()),
	}

	return &common.HasuraConnection{
		Id:                "hasura-1",
		BrowserConn:       browserConnection,
		Context:           ctx,
		ContextCancelFunc: cancel,
	}
}

func completeSubscription(hc *common.HasuraConnection, id string) {
	// This is the same critical section used for a client `complete` in writer.go.
	hc.BrowserConn.ActiveSubscriptionsMutex.Lock()
	delete(hc.BrowserConn.ActiveSubscriptions, id)
	hc.BrowserConn.ActiveSubscriptionsMutex.Unlock()
}

func TestClientCompleteWhileReaderProcessesSubscriptionDoesNotRestoreIt(t *testing.T) {
	testCases := []struct {
		name         string
		subscription common.GraphQlSubscription
		message      []byte
	}{
		{
			name: "subscription update",
			subscription: common.GraphQlSubscription{
				Id: "11111111-1111-1111-1111-111111111111", Type: common.Subscription, OperationName: "Users",
			},
			message: []byte(`{"type":"next","id":"11111111-1111-1111-1111-111111111111","payload":{"data":{"user":[{"name":"Ada"}]}}}`),
		},
		{
			name: "stream cursor update",
			subscription: common.GraphQlSubscription{
				Id: "22222222-2222-2222-2222-222222222222", Type: common.Streaming, OperationName: "Chat", StreamCursorField: "createdAt",
			},
			message: []byte(`{"type":"next","id":"22222222-2222-2222-2222-222222222222","payload":{"data":{"chat_message_stream":[{"createdAt":"2026-01-01T00:00:01Z"}]}}}`),
		},
	}

	for _, testCase := range testCases {
		t.Run(testCase.name, func(t *testing.T) {
			hc := newTestHasuraConnection(t)
			hc.BrowserConn.ActiveSubscriptions[testCase.subscription.Id] = testCase.subscription

			staleCopy := hc.BrowserConn.ActiveSubscriptions[testCase.subscription.Id]
			completeSubscription(hc, testCase.subscription.Id)

			message := bytes.Replace(testCase.message, []byte(testCase.subscription.Id), QueryIdPlaceholderInBytes, 1)
			if testCase.subscription.Type == common.Subscription {
				if handleSubscriptionMessage(hc, &message, staleCopy, testCase.subscription.Id) {
					t.Error("completed subscription message was accepted for forwarding")
				}
			} else {
				handleStreamingMessage(hc, message, staleCopy, testCase.subscription.Id)
			}

			hc.BrowserConn.ActiveSubscriptionsMutex.RLock()
			_, restored := hc.BrowserConn.ActiveSubscriptions[testCase.subscription.Id]
			hc.BrowserConn.ActiveSubscriptionsMutex.RUnlock()
			if restored {
				t.Errorf("subscription %s was restored in ActiveSubscriptions after the client completed it", testCase.subscription.Id)
			}
		})
	}
}

func TestReaderUpdatesCurrentReplacementWithoutOverwritingWriterFields(t *testing.T) {
	testCases := []struct {
		name         string
		subscription common.GraphQlSubscription
		message      []byte
	}{
		{
			name: "subscription update",
			subscription: common.GraphQlSubscription{
				Id: "33333333-3333-3333-3333-333333333333", Type: common.Subscription, OperationName: "Users",
			},
			message: []byte(`{"type":"next","id":"33333333-3333-3333-3333-333333333333","payload":{"data":{"user":[{"name":"Ada"}]}}}`),
		},
		{
			name: "stream cursor update",
			subscription: common.GraphQlSubscription{
				Id: "44444444-4444-4444-4444-444444444444", Type: common.Streaming, OperationName: "Chat", StreamCursorField: "createdAt",
			},
			message: []byte(`{"type":"next","id":"44444444-4444-4444-4444-444444444444","payload":{"data":{"chat_message_stream":[{"createdAt":"2026-01-01T00:00:01Z"}]}}}`),
		},
	}

	for _, testCase := range testCases {
		t.Run(testCase.name, func(t *testing.T) {
			hc := newTestHasuraConnection(t)
			hc.BrowserConn.ActiveSubscriptions[testCase.subscription.Id] = testCase.subscription

			staleCopy := hc.BrowserConn.ActiveSubscriptions[testCase.subscription.Id]
			replacement := testCase.subscription
			replacement.Message = []byte("replacement message")
			replacement.LastSeenOnHasuraConnection = "hasura-2"
			replacement.OperationName = "ReplacementOperation"
			hc.BrowserConn.ActiveSubscriptionsMutex.Lock()
			hc.BrowserConn.ActiveSubscriptions[testCase.subscription.Id] = replacement
			hc.BrowserConn.ActiveSubscriptionsMutex.Unlock()

			message := bytes.Replace(testCase.message, []byte(testCase.subscription.Id), QueryIdPlaceholderInBytes, 1)
			if testCase.subscription.Type == common.Subscription {
				if !handleSubscriptionMessage(hc, &message, staleCopy, testCase.subscription.Id) {
					t.Error("active replacement was not updated")
				}
			} else {
				handleStreamingMessage(hc, message, staleCopy, testCase.subscription.Id)
			}

			hc.BrowserConn.ActiveSubscriptionsMutex.RLock()
			updated := hc.BrowserConn.ActiveSubscriptions[testCase.subscription.Id]
			hc.BrowserConn.ActiveSubscriptionsMutex.RUnlock()

			if !bytes.Equal(updated.Message, replacement.Message) ||
				updated.LastSeenOnHasuraConnection != replacement.LastSeenOnHasuraConnection ||
				updated.OperationName != replacement.OperationName {
				t.Fatalf("reader overwrote writer replacement fields: got %+v", updated)
			}

			if testCase.subscription.Type == common.Subscription {
				if updated.LastReceivedDataChecksum != crc32.ChecksumIEEE(message) {
					t.Errorf("LastReceivedDataChecksum was not updated: got %d", updated.LastReceivedDataChecksum)
				}
				if got := string(updated.LastReceivedData.Payload.Data["user"]); got != `[{"name":"Ada"}]` {
					t.Errorf("LastReceivedData was not updated: got %s", got)
				}
			} else if updated.StreamCursorCurrValue == nil {
				t.Error("StreamCursorCurrValue was not updated")
			}
		})
	}
}
