package golden

import (
	"reflect"
	"testing"
)

func TestLines(t *testing.T) {
	tests := []struct {
		a, b []string
		want []string
	}{
		{[]string{"x", "y"}, []string{"x", "y"}, nil},
		{[]string{"a", "b", "c"}, []string{"a", "B", "c"}, []string{"- b", "+ B"}},
		{[]string{"a", "b"}, []string{"b", "a"}, []string{"- a", "+ a"}},
		{nil, []string{"n"}, []string{"+ n"}},
		{[]string{"o"}, nil, []string{"- o"}},
		{[]string{"s", "1", "2", "e"}, []string{"s", "e"}, []string{"- 1", "- 2"}},
	}
	for _, tt := range tests {
		if got := Lines(tt.a, tt.b); !reflect.DeepEqual(got, tt.want) {
			t.Errorf("Lines(%q, %q) = %q, want %q", tt.a, tt.b, got, tt.want)
		}
	}
}

func TestSelectLines(t *testing.T) {
	doc := []string{
		`$.core.body.props.meetingProp.name "Props"`,
		`$.core.body.props.usersProp.maxUsers 0`,
		`$.core.body.props.usersProp.guestPolicy "ALWAYS_ACCEPT"`,
		`$.core.body.props.usersPropX.other 1`,
		`$.core.body.props.groups[].groupId "g1"`,
		`$.core.body.props.metadataProp.metadata {}`,
		`$.core.header.name "MeetingCreatedEvtMsg"`,
	}
	tests := []struct {
		name  string
		paths []string
		want  []string
	}{
		{"a subtree, not a sibling with the same prefix", []string{"$.core.body.props.usersProp"}, []string{
			`$.core.body.props.usersProp.maxUsers 0`,
			`$.core.body.props.usersProp.guestPolicy "ALWAYS_ACCEPT"`,
		}},
		{"a leaf", []string{"$.core.body.props.usersProp.maxUsers"}, []string{`$.core.body.props.usersProp.maxUsers 0`}},
		{"a list", []string{"$.core.body.props.groups"}, []string{`$.core.body.props.groups[].groupId "g1"`}},
		{"an empty object", []string{"$.core.body.props.metadataProp.metadata"}, []string{`$.core.body.props.metadataProp.metadata {}`}},
		{"several, in document order, once each", []string{"$.core.header", "$.core.body.props.meetingProp", "$.core.body.props.meetingProp.name"}, []string{
			`$.core.body.props.meetingProp.name "Props"`,
			`$.core.header.name "MeetingCreatedEvtMsg"`,
		}},
		{"absent", []string{"$.core.body.props.usersProp.maxUsers", "$.core.body.props.nope"}, []string{
			`$.core.body.props.usersProp.maxUsers 0`,
			`$.core.body.props.nope (absent)`,
		}},
	}
	for _, tt := range tests {
		if got := selectLines(doc, tt.paths); !reflect.DeepEqual(got, tt.want) {
			t.Errorf("%s: selectLines(%q) = %q, want %q", tt.name, tt.paths, got, tt.want)
		}
	}
}
