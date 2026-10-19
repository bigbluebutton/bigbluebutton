package diff

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
