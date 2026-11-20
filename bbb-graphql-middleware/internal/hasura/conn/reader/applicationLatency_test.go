package reader

import (
	"testing"

	"bbb-graphql-middleware/internal/common"

	"github.com/prometheus/client_golang/prometheus"
	dto "github.com/prometheus/client_model/go"
	"github.com/sirupsen/logrus"
)

// applicationLabels are the application label values bbb_application_reach_latency_milliseconds
// has, read without creating any.
func applicationLabels(t *testing.T) map[string]bool {
	t.Helper()
	metrics := make(chan prometheus.Metric, 100)
	common.ApplicationsLatency.Collect(metrics)
	close(metrics)
	labels := map[string]bool{}
	for metric := range metrics {
		var out dto.Metric
		if err := metric.Write(&out); err != nil {
			t.Fatal(err)
		}
		for _, label := range out.Label {
			labels[label.GetValue()] = true
		}
	}
	return labels
}

func TestTheReachLatencyLabelsTheKnownStagesOnly(t *testing.T) {
	logger := logrus.NewEntry(logrus.New())

	// The trace the components write, as it comes back to the middleware.
	includePromotheusMetrics("traceLog@client|2026-11-20T10:00:00.000Z"+
		"@gqlmiddleware|2026-11-20T10:00:00.010Z@gqlactions|2026-11-20T10:00:00.020Z"+
		"@bbbapps|2026-11-20T10:00:00.030Z@pg|2026-11-20T10:00:00.040Z"+
		"@gqlmiddleware|2026-11-20T10:00:00.050Z", "meeting-trace", logger)
	// A trace with stages added by the client, which also moves the known ones.
	includePromotheusMetrics("traceLog@client|2026-11-20T10:00:00.000Z"+
		"@made-up|2026-11-20T10:00:00.005Z@gqlmiddleware|2026-11-20T10:00:00.010Z"+
		"@gqlactions|2026-11-20T10:00:00.020Z@bbbapps|2026-11-20T10:00:00.030Z"+
		"@pg|2026-11-20T10:00:00.040Z@gqlmiddleware|2026-11-20T10:00:00.050Z"+
		"@another|2026-11-20T10:00:00.060Z@more|2026-11-20T10:00:00.070Z", "meeting-trace", logger)

	allowed := map[string]bool{
		"1-gqlmiddleware": true, "2-gqlactions": true, "3-bbbapps": true, "4-pg": true, "5-gqlmiddleware": true,
		"other": true, "end-to-end": true,
	}
	labels := applicationLabels(t)
	for label := range labels {
		if !allowed[label] {
			t.Errorf("application label %q", label)
		}
	}
	for _, label := range []string{"1-gqlmiddleware", "5-gqlmiddleware", "other"} {
		if !labels[label] {
			t.Errorf("application label %q was not observed", label)
		}
	}
}
