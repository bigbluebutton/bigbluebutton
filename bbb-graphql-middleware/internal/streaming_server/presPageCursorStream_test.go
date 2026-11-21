package streamingserver

import "testing"

func TestCursorIsHiddenForLockedViewers(t *testing.T) {
	cases := []struct {
		name               string
		eventBody          map[string]interface{}
		cursorIsFromViewer bool
		expected           bool
	}{
		{
			name:               "viewer cursor while hideViewersCursor is on",
			eventBody:          map[string]interface{}{"hiddenForLockedViewers": true},
			cursorIsFromViewer: true,
			expected:           true,
		},
		{
			name:               "viewer cursor while hideViewersCursor is off",
			eventBody:          map[string]interface{}{"hiddenForLockedViewers": false},
			cursorIsFromViewer: true,
			expected:           false,
		},
		{
			name:               "moderator cursor is never hidden",
			eventBody:          map[string]interface{}{"hiddenForLockedViewers": false},
			cursorIsFromViewer: false,
			expected:           false,
		},
		{
			name:               "older akka-apps: viewer cursor hidden by default",
			eventBody:          map[string]interface{}{},
			cursorIsFromViewer: true,
			expected:           true,
		},
		{
			name:               "older akka-apps: moderator cursor still delivered",
			eventBody:          map[string]interface{}{},
			cursorIsFromViewer: false,
			expected:           false,
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := cursorIsHiddenForLockedViewers(tc.eventBody, tc.cursorIsFromViewer); got != tc.expected {
				t.Errorf("expected %v, got %v", tc.expected, got)
			}
		})
	}
}
