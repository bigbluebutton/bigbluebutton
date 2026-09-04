package plugin

import (
	"reflect"
	"testing"
)

func TestParse(t *testing.T) {
	tests := []struct {
		name    string
		input   string
		want    []PluginManifest
		wantErr bool
	}{
		{
			name:  "Single item full fields",
			input: `[{"url":"https://example.com/plugin.tgz","checksum":"abc123"}]`,
			want: []PluginManifest{
				{URL: "https://example.com/plugin.tgz", Checksum: "abc123"},
			},
		},
		{
			name:  "Multiple items with missing checksum",
			input: `[{"url":"https://a.com/p1.tgz","checksum":"abc123"},{"url":"https://b.com/p2.tgz"}]`,
			want: []PluginManifest{
				{URL: "https://a.com/p1.tgz", Checksum: "abc123"},
				{URL: "https://b.com/p2.tgz", Checksum: ""},
			},
		},
		{
			name:  "Unknown field",
			input: `[{"url":"https://x.com/p.tgz","extra":"ignored"}]`,
			want: []PluginManifest{
				{URL: "https://x.com/p.tgz"},
			},
		},
		{
			name:  "Empty array",
			input: `[]`,
			want:  []PluginManifest{},
		},
		{
			name:  "Null input",
			input: `null`,
			want:  nil,
		},
		{
			name:    "Empty string",
			input:   ``,
			wantErr: true,
			want:    []PluginManifest{},
		},
		{
			name:    "Whitespace only",
			input:   `   `,
			wantErr: true,
			want:    []PluginManifest{},
		},
		{
			name:    "Wrong top-level type (object, not array)",
			input:   `{"url":"https://example.com"}`,
			wantErr: true,
			want:    []PluginManifest{},
		},
		{
			name:    "Wrong field type for url",
			input:   `[{"url":123,"checksum":"x"}]`,
			wantErr: true,
			want:    []PluginManifest{},
		},
		{
			name:    "Malformed JSON",
			input:   `[{"url":"x","checksum":"y"}`,
			wantErr: true,
			want:    []PluginManifest{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := Parse(tt.input)

			if (err != nil) != tt.wantErr {
				t.Fatalf("Parse() error=%v, wantErr=%v", err, tt.wantErr)
			}

			if tt.wantErr && len(got) != 0 {
				t.Fatalf("On error, expected len(result)==0, got len=%d (%v)", len(got), got)
			}

			if !reflect.DeepEqual(got, tt.want) {
				t.Fatalf("Parse() mismatch.\n got: %#v\nwant: %#v", got, tt.want)
			}
		})
	}
}
