package common

import (
	"fmt"
	"strings"
	"testing"
)

func TestHistogramOperationNameBoundsTheLabel(t *testing.T) {
	if got := HistogramOperationName(strings.Repeat("a", 101)); got != "other" {
		t.Fatalf("long name: got %q, want other", got)
	}
	for i := 0; i < maxHistogramOperationNames; i++ {
		name := fmt.Sprintf("Op%d", i)
		if got := HistogramOperationName(name); got != name {
			t.Fatalf("name %d: got %q, want %q", i, got, name)
		}
	}
	if got := HistogramOperationName("OneTooMany"); got != "other" {
		t.Fatalf("past the cap: got %q, want other", got)
	}
	if got := HistogramOperationName("Op0"); got != "Op0" {
		t.Fatalf("known name past the cap: got %q, want Op0", got)
	}
}
