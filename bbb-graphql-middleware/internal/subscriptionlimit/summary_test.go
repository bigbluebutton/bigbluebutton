package subscriptionlimit

import "testing"

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
