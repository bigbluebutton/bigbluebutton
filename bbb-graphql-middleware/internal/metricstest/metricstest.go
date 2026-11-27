// Package metricstest reads metric values in the tests of the middleware metrics.
package metricstest

import (
	"fmt"
	"strings"
	"testing"

	"github.com/prometheus/client_golang/prometheus"
	dto "github.com/prometheus/client_model/go"
)

// Value reads the current value of a counter or gauge, and the observation count of a
// histogram. It exists because testutil.ToFloat64 does not read a histogram's count. Only tests
// import this package, so it stays out of the binary.
func Value(m prometheus.Metric) float64 {
	var out dto.Metric
	if err := m.Write(&out); err != nil {
		panic(err)
	}
	switch {
	case out.Counter != nil:
		return out.Counter.GetValue()
	case out.Gauge != nil:
		return out.Gauge.GetValue()
	case out.Histogram != nil:
		return float64(out.Histogram.GetSampleCount())
	}
	return 0
}

// Sum reads the sum of the observations of a histogram.
func Sum(m prometheus.Metric) float64 {
	var out dto.Metric
	if err := m.Write(&out); err != nil {
		panic(err)
	}
	return out.GetHistogram().GetSampleSum()
}

// Series reads every series of the default registry except the Go runtime and process ones: a
// counter or gauge by its value, a histogram by its count (key " count") and its sum (" sum"). The
// key is the metric name and its labels, as the export writes them.
func Series() (map[string]float64, error) {
	families, err := prometheus.DefaultGatherer.Gather()
	if err != nil {
		return nil, err
	}
	series := map[string]float64{}
	for _, family := range families {
		name := family.GetName()
		if strings.HasPrefix(name, "go_") || strings.HasPrefix(name, "process_") || strings.HasPrefix(name, "promhttp_") {
			continue
		}
		for _, metric := range family.GetMetric() {
			labels := make([]string, 0, len(metric.GetLabel()))
			for _, label := range metric.GetLabel() {
				labels = append(labels, fmt.Sprintf("%s=%q", label.GetName(), label.GetValue()))
			}
			key := name
			if len(labels) > 0 {
				key += "{" + strings.Join(labels, ",") + "}"
			}
			switch {
			case metric.GetCounter() != nil:
				series[key] = metric.GetCounter().GetValue()
			case metric.GetGauge() != nil:
				series[key] = metric.GetGauge().GetValue()
			case metric.GetHistogram() != nil:
				series[key+" count"] = float64(metric.GetHistogram().GetSampleCount())
				series[key+" sum"] = metric.GetHistogram().GetSampleSum()
			}
		}
	}
	return series, nil
}

// Changed is what moved between two readings of Series: the difference of each series, and the
// negated value of a series gone.
func Changed(before, after map[string]float64) map[string]float64 {
	changed := map[string]float64{}
	for key, value := range after {
		if delta := value - before[key]; delta != 0 {
			changed[key] = delta
		}
	}
	for key, value := range before {
		if _, ok := after[key]; !ok {
			changed[key] = -value
		}
	}
	return changed
}

// MustRead reads one series of the default registry by its Series key (a histogram by its count,
// key + " count", or its sum, key + " sum"), and fails the test if the registry does not export it.
// It is for the series of a closed label set, which must exist before any event: reading a child of
// a vector with WithLabelValues would create it, and hide that the code never did.
func MustRead(t testing.TB, key string) float64 {
	t.Helper()
	series, err := Series()
	if err != nil {
		t.Fatalf("gather: %v", err)
	}
	value, ok := series[key]
	if !ok {
		t.Fatalf("%s is not exported", key)
	}
	return value
}
