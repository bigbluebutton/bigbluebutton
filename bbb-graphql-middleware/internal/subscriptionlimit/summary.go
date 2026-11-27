// Package subscriptionlimit summarises a connection's active subscriptions for the log line
// written when it reaches max_connection_concurrent_subscriptions.
package subscriptionlimit

import (
	"fmt"
	"sort"
	"strings"
	"unicode/utf8"
)

// The bounds of what the summary shows. A client chooses the operation names, so the line would
// otherwise grow with them.
const (
	// MaxNameBytes is the most bytes of a name shown, the bound of an operation name label.
	MaxNameBytes = 128
	// MaxNames is the most distinct names listed.
	MaxNames = 20
)

// SummarizeByOperation counts operation names and formats them as "name=count" pairs, highest
// count first (ties by name), so the operation holding the most subscriptions leads the line.
// Names are counted whole and shown cut by TruncateName; past MaxNames distinct names, the line
// ends with how many more names and entries there are.
func SummarizeByOperation(operationNames []string) string {
	counts := make(map[string]int, len(operationNames))
	for _, name := range operationNames {
		if name == "" {
			name = "(unnamed)"
		}
		counts[name]++
	}

	names := make([]string, 0, len(counts))
	for name := range counts {
		names = append(names, name)
	}
	sort.Slice(names, func(i, j int) bool {
		if counts[names[i]] != counts[names[j]] {
			return counts[names[i]] > counts[names[j]]
		}
		return names[i] < names[j]
	})

	shown := names[:min(len(names), MaxNames)]
	pairs := make([]string, 0, len(shown)+1)
	for _, name := range shown {
		pairs = append(pairs, fmt.Sprintf("%s=%d", TruncateName(name), counts[name]))
	}
	if hidden := names[len(shown):]; len(hidden) > 0 {
		entries := 0
		for _, name := range hidden {
			entries += counts[name]
		}
		pairs = append(pairs, fmt.Sprintf("and %d more names (%d entries)", len(hidden), entries))
	}
	return strings.Join(pairs, ", ")
}

// TruncateName cuts a name longer than MaxNameBytes at a character boundary, and marks the cut
// with "...".
func TruncateName(name string) string {
	if len(name) <= MaxNameBytes {
		return name
	}
	cut := MaxNameBytes
	for cut > 0 && !utf8.RuneStart(name[cut]) {
		cut--
	}
	return name[:cut] + "..."
}
