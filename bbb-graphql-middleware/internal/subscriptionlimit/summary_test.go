package subscriptionlimit

import (
	"fmt"
	"strings"
	"testing"
	"unicode/utf8"
)

func TestSummarizeByOperation(t *testing.T) {
	tests := []struct {
		name  string
		input []string
		want  string
	}{
		{"empty", nil, ""},
		{"single", []string{"ChatSubscription"}, "ChatSubscription=1"},
		{
			"highest count first, ties by name",
			[]string{"chatMessages", "IsTyping", "chatMessages", "Users", "chatMessages", "IsTyping"},
			"chatMessages=3, IsTyping=2, Users=1",
		},
		{"unnamed operations are grouped", []string{"", "", "Users"}, "(unnamed)=2, Users=1"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := SummarizeByOperation(tt.input); got != tt.want {
				t.Errorf("SummarizeByOperation(%q) = %q, want %q", tt.input, got, tt.want)
			}
		})
	}
}

func TestTruncateName(t *testing.T) {
	short := strings.Repeat("a", MaxNameBytes)
	if got := TruncateName(short); got != short {
		t.Errorf("a name of %d bytes was cut: %q", MaxNameBytes, got)
	}
	if got := TruncateName(short + "b"); got != short+"..." {
		t.Errorf("a name of %d bytes: %q, want its first %d bytes and ...", MaxNameBytes+1, got, MaxNameBytes)
	}
	// A two-byte character across the bound is not split.
	multibyte := strings.Repeat("a", MaxNameBytes-1) + "é" + "tail"
	got := TruncateName(multibyte)
	if got != strings.Repeat("a", MaxNameBytes-1)+"..." || !utf8.ValidString(got) {
		t.Errorf("cut inside a character: %q", got)
	}
}

func TestSummarizeByOperationBoundsTheLine(t *testing.T) {
	long := strings.Repeat("x", 10000)
	var names []string
	// Two long names that share their first MaxNameBytes bytes are counted apart.
	names = append(names, long+"1", long+"1", long+"1", long+"2", long+"2")
	for i := 0; i < 30; i++ {
		names = append(names, fmt.Sprintf("op%02d", i))
	}
	names = append(names, "op00")
	got := SummarizeByOperation(names)

	cut := strings.Repeat("x", MaxNameBytes) + "..."
	if !strings.HasPrefix(got, cut+"=3, op00=2, "+cut+"=2, op01=1, ") {
		t.Errorf("the line does not start with the cut names and their whole counts: %.300q", got)
	}
	if !strings.HasSuffix(got, ", and 12 more names (12 entries)") {
		t.Errorf("the line does not end with what was left out: %.300q", got[max(0, len(got)-80):])
	}
	if len(got) > 2*(MaxNameBytes+10)+MaxNames*20+64 {
		t.Errorf("the line is %d bytes", len(got))
	}
}
