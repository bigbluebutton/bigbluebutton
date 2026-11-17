// Package metricstest reads metric values in the tests of the middleware metrics.
package metricstest

import (
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
