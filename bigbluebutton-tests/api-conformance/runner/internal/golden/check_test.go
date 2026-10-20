package golden

import (
	"fmt"
	"reflect"
	"testing"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/assert"
)

func TestMismatches(t *testing.T) {
	want := []string{"status 200", "header Content-Type text/xml", "body xml", `/response/returncode "SUCCESS"`,
		`/response/list/item "a"`, `/response/list/item "b"`, "/response/messageKey", `/response/gone "x"`}
	got := []string{"status 202", "header Content-Type application/xml", "body xml", `/response/returnCode "SUCCESS"`,
		`/response/list/item "a"`, `/response/list/item "c"`, `/response/messageKey "duplicateWarning"`, `/response/new "y"`}
	r := func(what, exp, act string) assert.Result {
		return assert.Result{What: "recording " + what, Expected: exp, Actual: act}
	}
	wantRes := []assert.Result{
		r("status", "200", "202"),
		r("header Content-Type", "text/xml", "application/xml"),
		r("/response/returncode", `"SUCCESS"`, "nothing"),
		r("/response/list/item", `"b"`, `"c"`),
		r("/response/messageKey", "(empty)", `"duplicateWarning"`),
		r("/response/gone", `"x"`, "nothing"),
		r("/response/returnCode", "nothing", `"SUCCESS"`),
		r("/response/new", "nothing", `"y"`),
	}
	if res := Mismatches(want, got); !reflect.DeepEqual(res, wantRes) {
		t.Errorf("got:\n%+v\nwant:\n%+v", res, wantRes)
	}
	if res := Mismatches(want, want); len(res) != 1 || !res[0].OK {
		t.Errorf("the same answer: %+v", res)
	}

	var many, other []string
	for i := 0; i < 30; i++ {
		many = append(many, fmt.Sprintf(`/response/f%02d "a"`, i))
		other = append(other, fmt.Sprintf(`/response/f%02d "b"`, i))
	}
	res := Mismatches(many, other)
	if len(res) != maxMismatches+1 || res[maxMismatches].Actual != "10 more difference(s)" {
		t.Errorf("got %d results, last %+v", len(res), res[len(res)-1])
	}
}
