package spec

import (
	"reflect"
	"strings"
	"testing"
)

func TestParseOperation(t *testing.T) {
	for _, tt := range []struct {
		doc, text, typ, name string
		vars                 []string
	}{
		{"query Me { user_current { name } }", "query Me { user_current { name } }", "query", "Me", nil},
		{"  # who am I\n\tquery Me { user_current { name } }", "query Me { user_current { name } }", "query", "Me", nil},
		{"subscription Users { user { ...U } }\nfragment U on user { name }", "subscription Users { user { ...U } }\nfragment U on user { name }", "subscription", "Users", nil},
		{`query Q($n: String = "}") { user(where: {name: {_eq: $n}}) { userId } }`, `query Q($n: String = "}") { user(where: {name: {_eq: $n}}) { userId } }`, "query", "Q", nil},
		{"mutation Leave { userLeaveMeeting }", "mutation Leave { userLeaveMeeting }", "mutation", "Leave", nil},
		{"mutation   SetPresenter(\n\t$id:String!\n){\n\tuserSetPresenter(userId:$id) }",
			"mutation SetPresenter($id: String!) { userSetPresenter(userId: $id) }", "mutation", "SetPresenter", []string{"id"}},
		{"mutation G($g: [GuestUserApprovalStatus!]!) { guestUsersSubmitApprovalStatus(guests: $g) }",
			"mutation G($g: [GuestUserApprovalStatus!]!) { guestUsersSubmitApprovalStatus(guests: $g) }", "mutation", "G", []string{"g"}},
		{"mutation L($u: String!, $l: Boolean!) { userSetLocked(userId: $u, locked: $l) }",
			"mutation L($u: String!, $l: Boolean!) { userSetLocked(userId: $u, locked: $l) }", "mutation", "L", []string{"u", "l"}},
	} {
		op, err := ParseOperation(tt.doc)
		if err != nil {
			t.Errorf("%q: %v", tt.doc, err)
			continue
		}
		if op.Text != tt.text || op.Type != tt.typ || op.Name != tt.name || !reflect.DeepEqual(op.Vars, tt.vars) {
			t.Errorf("%q: got %+v", tt.doc, op)
		}
	}
	for doc, want := range map[string]string{
		"":                                "empty",
		"{ user_current { name } }":       "name the operation",
		"query { user_current { name } }": "name the operation",
		"query Patched_Me { user_current { name } }":           "JSON patches",
		"query A { a } query B { b }":                          "one operation",
		"query A { a ":                                         "braces don't close",
		`query A { a(x: "b) }`:                                 "string doesn't end",
		"mutation M { a: userLeaveMeeting }":                   "alias",
		"mutation M { userLeaveMeeting userSendActivitySign }": "one action",
		"mutation M { userLeaveMeeting { ok } }":               "drop its selection",
		`mutation M { userSetPresenter(userId: "w_1") }`:       "pass userId as a variable",
		"mutation M($a: String = \"x\") { f(a: $a) }":          "defaults",
		"mutation M($a: String!) { f(a: $b) }":                 "$b isn't declared",
		"mutation M($a: String!) { f(a: $a) } query Q { q }":   "one operation",
		"mutation M() { f }":                                   "must look like",
		"query A { a } %":                                      "unexpected character",
	} {
		if _, err := ParseOperation(doc); err == nil || !strings.Contains(err.Error(), want) {
			t.Errorf("%q: error %v, want %q", doc, err, want)
		}
	}
}
