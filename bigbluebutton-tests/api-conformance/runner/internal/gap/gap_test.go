package gap

import (
	"bytes"
	"strings"
	"testing"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/report"
)

// An issue URL with what would end the link or the table cell still
// links to the issue.
func TestMarkdownIssueLink(t *testing.T) {
	run := &report.Run{Target: "t", Cases: []*report.CaseResult{{ID: "create.a.b", Endpoint: "create", Status: report.XFail,
		Reason: "r", Expected: &report.Expected{Entry: "create.a.b", Reason: "r", Issue: "https://example.test/a (b)|c"}}}}
	var b bytes.Buffer
	if err := Build([]*report.Run{run}).WriteMarkdown(&b); err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(b.String(), "](https://example.test/a%20%28b%29%7Cc) |") {
		t.Errorf("markdown:\n%s", b.String())
	}
}
