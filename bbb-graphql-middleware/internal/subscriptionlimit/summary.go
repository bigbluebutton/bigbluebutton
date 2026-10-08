// Package subscriptionlimit summarises a connection's active subscriptions for the log line
// written when it reaches max_connection_concurrent_subscriptions.
package subscriptionlimit

import (
	"fmt"
	"sort"
	"strings"
)

// SummarizeByOperation counts operation names and formats them as "name=count" pairs, highest
// count first (ties by name), so the operation holding the most subscriptions leads the line.
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

	pairs := make([]string, 0, len(names))
	for _, name := range names {
		pairs = append(pairs, fmt.Sprintf("%s=%d", name, counts[name]))
	}
	return strings.Join(pairs, ", ")
}
