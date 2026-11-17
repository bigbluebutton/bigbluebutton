package common

import (
	"encoding/json"
	"strings"
	"testing"
)

func subscribeMessage(query string, variables map[string]interface{}) BrowserSubscribeMessage {
	var message BrowserSubscribeMessage
	message.Type = "subscribe"
	message.ID = "1"
	message.Payload.Query = query
	message.Payload.Variables = variables
	return message
}

// The streaming subscriptions of the html5 client that use a cursor (v3.0.x, v4.0.x and v4.1.x
// develop), with their cursor as written in the source and as the client sends it (printed by
// graphql-js, which drops the spaces inside the braces). Four of them (cursor coordinates,
// notifications, chat messages and voice activity) are served by the middleware itself
// (StreamingSubscriptionsManagedByMiddleware) and never reach this code: they are here only as
// shapes of a cursor.
func TestGetStreamCursorPropsFromBrowserMessage(t *testing.T) {
	cases := []struct {
		name      string
		query     string
		variables map[string]interface{}
		field     string
		variable  string
		initial   interface{}
	}{
		{
			name: "whiteboard annotation history (3.0, 4.0, 4.1)",
			query: `subscription annotationHistoryStream($updatedAt: timestamptz, $pageId: String!) {
    pres_annotation_history_curr_stream(
      batch_size: 1000,
      where: {pageId: {_eq: $pageId}},
      cursor: {initial_value: {updatedAt: $updatedAt}, ordering: ASC}
    ) {
      annotationId
      updatedAt
    }
  }`,
			variables: map[string]interface{}{"updatedAt": "2026-11-17T09:00:00", "pageId": "p1"},
			field:     "updatedAt", variable: "updatedAt", initial: "2026-11-17T09:00:00",
		},
		{
			name:      "whiteboard annotation history, as sent",
			query:     "subscription annotationHistoryStream($updatedAt: timestamptz, $pageId: String!) {\n  pres_annotation_history_curr_stream(\n    batch_size: 1000\n    where: {pageId: {_eq: $pageId}}\n    cursor: {initial_value: {updatedAt: $updatedAt}, ordering: ASC}\n  ) {\n    annotationId\n    updatedAt\n  }\n}",
			variables: map[string]interface{}{"updatedAt": "2026-11-17T09:00:00", "pageId": "p1"},
			field:     "updatedAt", variable: "updatedAt", initial: "2026-11-17T09:00:00",
		},
		{
			name: "chat message stream (3.0, 4.0, 4.1), as a shape: served by the middleware",
			query: `subscription getChatMessageStream($createdAt: timestamptz!) {
    chat_message_stream(
      cursor: { initial_value: { createdAt: $createdAt }, ordering: ASC},
      batch_size: 10
    ) {
      chatId
      createdAt
    }
  }`,
			variables: map[string]interface{}{"createdAt": "2026-11-17T09:00:00"},
			field:     "createdAt", variable: "createdAt", initial: "2026-11-17T09:00:00",
		},
		{
			name:      "chat message stream, as sent, as a shape: served by the middleware",
			query:     "subscription getChatMessageStream($createdAt: timestamptz!) {\n  chat_message_stream(cursor: {initial_value: {createdAt: $createdAt}, ordering: ASC}, batch_size: 10) {\n    chatId\n    createdAt\n  }\n}",
			variables: map[string]interface{}{"createdAt": "2026-11-17T09:00:00"},
			field:     "createdAt", variable: "createdAt", initial: "2026-11-17T09:00:00",
		},
		{
			name: "emoji rain (3.0, 4.0, 4.1)",
			query: `subscription getEmojisToRain ($initialCursor: timestamptz) {
  user_reaction_stream(batch_size: 10, cursor: {initial_value: {createdAt: $initialCursor}}) {
    createdAt
    reactionEmoji
  }
}`,
			variables: map[string]interface{}{"initialCursor": "2026-11-17T09:00:00"},
			field:     "createdAt", variable: "initialCursor", initial: "2026-11-17T09:00:00",
		},
		{
			name: "notifications (3.0, 4.0, 4.1), as a shape: served by the middleware",
			query: `subscription getNotificationStream($initialCursor: timestamptz!) {
    notification_stream(
      batch_size: 10,
      cursor: {initial_value: {createdAt: $initialCursor}}
    ) {
      notificationType
      createdAt
    }
  }`,
			variables: map[string]interface{}{"initialCursor": "2026-11-17T09:00:00"},
			field:     "createdAt", variable: "initialCursor", initial: "2026-11-17T09:00:00",
		},
		{
			name: "cursor coordinates (3.0, 4.0, 4.1), as a shape: served by the middleware",
			query: `subscription getCursorCoordinatesStream {
    pres_page_cursor_stream(cursor: {initial_value: {lastUpdatedAt: "2020-01-01"}},
                            where: {isCurrentPage: {_eq: true}},
                            batch_size: 100) {
      xPercent
      yPercent
      userId
    }
  }`,
			field: "lastUpdatedAt", initial: `"2020-01-01"`,
		},
		{
			name: "voice activity (3.0, 4.0, 4.1), as a shape: served by the middleware",
			query: `subscription getUserVoiceStateStream {
    user_voice_activity_stream(
      cursor: { initial_value: { voiceActivityAt: "2020-01-01" } },
      batch_size: 10
    ) {
      userId
      talking
    }
  }`,
			field: "voiceActivityAt", initial: `"2020-01-01"`,
		},
		{
			name: "shared notes diff (3.0)",
			query: `subscription GetPadContentDiffStream($externalId: String!) {
    sharedNotes_diff_stream(
      batch_size: 10,
      cursor: { initial_value: { rev: 0 } },
      where: { sharedNotesExtId: { _eq: $externalId } }
    ) {
      start
      end
      diff
    }
  }`,
			variables: map[string]interface{}{"externalId": "notes"},
			field:     "rev", initial: "0",
		},
		{
			name:      "variable, no ordering",
			query:     `subscription S($c: timestamptz) { x_stream(cursor: {initial_value: {createdAt: $c}}) { createdAt } }`,
			variables: map[string]interface{}{"c": "v"},
			field:     "createdAt", variable: "c", initial: "v",
		},
		{
			name:      "variable, ordering after",
			query:     `subscription S($c: timestamptz) { x_stream(cursor: {initial_value: {createdAt: $c}, ordering: DESC}) { createdAt } }`,
			variables: map[string]interface{}{"c": "v"},
			field:     "createdAt", variable: "c", initial: "v",
		},
		{
			name:      "variable, ordering before",
			query:     `subscription S($c: timestamptz) { x_stream(cursor: {ordering: ASC, initial_value: {createdAt: $c}}) { createdAt } }`,
			variables: map[string]interface{}{"c": "v"},
			field:     "createdAt", variable: "c", initial: "v",
		},
		{
			name:  "literal, no ordering",
			query: `subscription S { x_stream(cursor: {initial_value: {id: 5}}) { id } }`,
			field: "id", initial: "5",
		},
		{
			name:  "literal, ordering after, spaces around the field and the value",
			query: `subscription S { x_stream(cursor : { initial_value : {  lastUpdatedAt  :  "2020-01-01"  } , ordering : ASC }) { id } }`,
			field: "lastUpdatedAt", initial: `"2020-01-01"`,
		},
		{
			name:  "literal, ordering before",
			query: `subscription S { x_stream(cursor: {ordering: ASC, initial_value: {id: 5}}) { id } }`,
			field: "id", initial: "5",
		},
	}

	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			field, variable, initial := GetStreamCursorPropsFromBrowserMessage(subscribeMessage(c.query, c.variables))
			if field != c.field || variable != c.variable || initial != c.initial {
				t.Errorf("got field %q, variable %q, initial value %#v; want %q, %q, %#v", field, variable, initial, c.field, c.variable, c.initial)
			}
		})
	}
}

// A streaming subscription as the writer records it, after it received a message from Hasura.
func receivedStreamSubscription(t *testing.T, meetingId string, query string, variables map[string]interface{}, received string) GraphQlSubscription {
	t.Helper()
	browserMessage := subscribeMessage(query, variables)
	field, variable, initial := GetStreamCursorPropsFromBrowserMessage(browserMessage)
	message, err := json.Marshal(browserMessage)
	if err != nil {
		t.Fatal(err)
	}
	subscription := GraphQlSubscription{
		Id:                       "1",
		Message:                  message,
		Type:                     Streaming,
		StreamCursorField:        field,
		StreamCursorVariableName: variable,
		StreamCursorCurrValue:    initial,
	}
	// As handleStreamingMessage in the reader does
	if lastCursor := GetLastStreamCursorValueFromReceivedMessage([]byte(received), field, meetingId); lastCursor != nil {
		subscription.StreamCursorCurrValue = lastCursor
	}
	return subscription
}

func TestRetransmissionCarriesTheLastReceivedCursor(t *testing.T) {
	t.Run("whiteboard annotation history: the variable", func(t *testing.T) {
		subscription := receivedStreamSubscription(t, "cursor-test-whiteboard",
			"subscription annotationHistoryStream($updatedAt: timestamptz, $pageId: String!) {\n  pres_annotation_history_curr_stream(batch_size: 1000, where: {pageId: {_eq: $pageId}}, cursor: {initial_value: {updatedAt: $updatedAt}, ordering: ASC}) {\n    annotationId\n    updatedAt\n  }\n}",
			map[string]interface{}{"updatedAt": "2026-11-17T09:00:00", "pageId": "p1"},
			`{"type":"next","id":"1","payload":{"data":{"pres_annotation_history_curr_stream":[{"annotationId":"a1","updatedAt":"2026-11-17T09:00:05"},{"annotationId":"a2","updatedAt":"2026-11-17T09:00:07"}]}}}`)

		var retransmitted BrowserSubscribeMessage
		if err := json.Unmarshal(PatchQuerySettingLastCursorValue(subscription), &retransmitted); err != nil {
			t.Fatal(err)
		}
		if got := retransmitted.Payload.Variables["updatedAt"]; got != "2026-11-17T09:00:07" {
			t.Errorf("retransmitted updatedAt = %#v, want the last received cursor 2026-11-17T09:00:07", got)
		}
		if got := retransmitted.Payload.Variables["pageId"]; got != "p1" {
			t.Errorf("retransmitted pageId = %#v, want it unchanged", got)
		}
	})

	// The shape of the chat message stream's cursor: the middleware serves that stream itself, so
	// it is not retransmitted through here.
	t.Run("a variable cursor with spaces around it, in the shape of the chat message stream", func(t *testing.T) {
		subscription := receivedStreamSubscription(t, "cursor-test-chat",
			"subscription getChatMessageStream($createdAt: timestamptz!) {\n    chat_message_stream(\n      cursor: { initial_value: { createdAt: $createdAt }, ordering: ASC},\n      batch_size: 10\n    ) {\n      chatId\n      createdAt\n    }\n  }",
			map[string]interface{}{"createdAt": "2026-11-17T09:00:00"},
			`{"type":"next","id":"1","payload":{"data":{"chat_message_stream":[{"chatId":"MAIN-PUBLIC-GROUP-CHAT","createdAt":"2026-11-17T09:00:03"}]}}}`)

		var retransmitted BrowserSubscribeMessage
		if err := json.Unmarshal(PatchQuerySettingLastCursorValue(subscription), &retransmitted); err != nil {
			t.Fatal(err)
		}
		if got := retransmitted.Payload.Variables["createdAt"]; got != "2026-11-17T09:00:03" {
			t.Errorf("retransmitted createdAt = %#v, want the last received cursor 2026-11-17T09:00:03", got)
		}
	})

	t.Run("inline value with ordering: the query, keeping the ordering", func(t *testing.T) {
		subscription := receivedStreamSubscription(t, "cursor-test-inline",
			`subscription S { x_stream(batch_size: 10, cursor: {initial_value: {lastUpdatedAt: "2020-01-01"}, ordering: ASC}) { userId } }`,
			nil,
			`{"type":"next","id":"1","payload":{"data":{"x_stream":[{"userId":"u1","lastUpdatedAt":"2026-11-17T09:00:09"}]}}}`)

		var retransmitted BrowserSubscribeMessage
		if err := json.Unmarshal(PatchQuerySettingLastCursorValue(subscription), &retransmitted); err != nil {
			t.Fatal(err)
		}
		want := `cursor: {initial_value: {lastUpdatedAt: "2026-11-17T09:00:09"}, ordering: ASC}`
		if !strings.Contains(retransmitted.Payload.Query, want) {
			t.Errorf("retransmitted query = %q, want it to contain %q", retransmitted.Payload.Query, want)
		}
	})
}
