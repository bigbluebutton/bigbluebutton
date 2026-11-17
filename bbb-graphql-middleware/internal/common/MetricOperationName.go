package common

import (
	"sync"

	"bbb-graphql-middleware/config"
)

const (
	// UnnamedOperationLabel is the operationName label of an operation sent without a name.
	UnnamedOperationLabel = "(unnamed)"
	// OtherOperationLabel is the operationName label of a name past the cap, longer than the
	// longest name admitted, or outside the GraphQL name grammar [_A-Za-z][_0-9A-Za-z]*. The
	// name is the operationName field of the client's JSON, which is free text, so it is
	// checked against the grammar before it is admitted; the parentheses then keep both values
	// apart from every admitted name.
	OtherOperationLabel = "(other)"

	// defaultOperationNameLabels is the cap when prometheus_operation_name_limit is missing or
	// below 1.
	defaultOperationNameLabels = 500
	maxOperationNameLabelBytes = 128
)

// operationNameLabels caps the distinct operationName label values of the metrics. The names
// come from the browser, so without a cap any client could create new series at will.
type operationNameLabels struct {
	mu       sync.Mutex
	admitted map[string]struct{}
	maxNames int
	maxBytes int
}

func newOperationNameLabels(maxNames, maxBytes int) *operationNameLabels {
	return &operationNameLabels{admitted: make(map[string]struct{}), maxNames: maxNames, maxBytes: maxBytes}
}

func (l *operationNameLabels) label(operationName string) string {
	if operationName == "" {
		return UnnamedOperationLabel
	}
	if len(operationName) > l.maxBytes || !isGraphQLName(operationName) {
		return OtherOperationLabel
	}

	l.mu.Lock()
	defer l.mu.Unlock()
	if _, ok := l.admitted[operationName]; ok {
		return operationName
	}
	if len(l.admitted) >= l.maxNames {
		return OtherOperationLabel
	}
	l.admitted[operationName] = struct{}{}
	return operationName
}

// isGraphQLName reports whether a name follows the GraphQL name grammar, [_A-Za-z][_0-9A-Za-z]*.
func isGraphQLName(name string) bool {
	for i := 0; i < len(name); i++ {
		c := name[i]
		letter := c == '_' || (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z')
		if !letter && (i == 0 || c < '0' || c > '9') {
			return false
		}
	}
	return name != ""
}

// operationNameLimit is the cap on the operationName label values for the configured
// prometheus_operation_name_limit: the configured value, or the default when it is missing (0)
// or below 1.
func operationNameLimit(configured int) int {
	if configured < 1 {
		return defaultOperationNameLabels
	}
	return configured
}

var (
	metricOperationNamesOnce sync.Once
	metricOperationNames     *operationNameLabels
)

// InitMetricOperationNames reads the cap on the operationName label values from the
// configuration, once: main calls it at start, so a change of the cap needs a restart.
func InitMetricOperationNames() {
	metricOperationNamesOnce.Do(func() {
		metricOperationNames = newOperationNameLabels(operationNameLimit(config.GetConfig().PrometheusOperationNameLimit), maxOperationNameLabelBytes)
	})
}

// MetricOperationName is the operationName label value of every metric: the name itself for the
// first distinct GraphQL names of up to 128 bytes, up to the cap (500 by default, set with
// prometheus_operation_name_limit), OtherOperationLabel for any other, and
// UnnamedOperationLabel for an operation without a name.
func MetricOperationName(operationName string) string {
	InitMetricOperationNames()
	return metricOperationNames.label(operationName)
}

// MetricLabel is the operationName label of the subscription's metrics: the label resolved when
// the subscription was created, so the per-message metrics take no lock, or, for a record that
// was not made by the writer, the label resolved now.
func (s GraphQlSubscription) MetricLabel() string {
	if s.OperationNameLabel != "" {
		return s.OperationNameLabel
	}
	return MetricOperationName(s.OperationName)
}
