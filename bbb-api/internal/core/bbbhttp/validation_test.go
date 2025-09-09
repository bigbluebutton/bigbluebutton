package bbbhttp

import "testing"

func TestDefaultURLValidator_ValidateURL(t *testing.T) {
	tests := []struct {
		name      string
		address   string
		shouldErr bool
	}{
		{
			name:      "Valid URL",
			address:   "https://test.com/",
			shouldErr: false,
		},
		{
			name:      "Invalid URL",
			address:   "https://%$^^###",
			shouldErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			v := DefaultURLValidator{}
			err := v.ValidateURL(tt.address)
			if (err != nil) != tt.shouldErr {
				t.Errorf("ValidateURL(%s) - got: %v, want: %v", tt.address, err, tt.shouldErr)
			}
		})
	}
}
