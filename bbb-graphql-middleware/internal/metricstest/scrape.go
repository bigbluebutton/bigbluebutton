package metricstest

import (
	"fmt"
	"os"
	"runtime/pprof"
	"sync"
	"testing"
	"time"

	"github.com/prometheus/client_golang/prometheus"
)

// fillerSeries is a collector of constant series: enough of them that a scrape passes them along
// faster than it reads them, so the collection of the other collectors waits for the scrape.
type fillerSeries struct{ desc *prometheus.Desc }

func (f fillerSeries) Describe(ch chan<- *prometheus.Desc) { ch <- f.desc }

func (f fillerSeries) Collect(ch chan<- prometheus.Metric) {
	for i := 0; i < 5000; i++ {
		ch <- prometheus.MustNewConstMetric(f.desc, prometheus.GaugeValue, 1, fmt.Sprint(i))
	}
}

// ScrapeWhileLocked calls work runs times while a registry is scraped over and over. The registry
// holds the collectors, many series, and a gauge whose collection takes lock for reading, as a
// collector that read the application's state under its lock would. A metric updated while lock
// is held for writing can then wait on the scrape, which waits on lock: the test fails when
// neither a scrape nor a call of work finishes for 5 s.
func ScrapeWhileLocked(t *testing.T, lock *sync.RWMutex, runs int, work func(run int), collectors ...prometheus.Collector) {
	t.Helper()
	registry := prometheus.NewRegistry()
	registry.MustRegister(collectors...)
	registry.MustRegister(fillerSeries{prometheus.NewDesc("test_filler", "filler", []string{"n"}, nil)})
	// Several such gauges, so a scrape meets one at any point of its collection.
	for i := 0; i < 20; i++ {
		registry.MustRegister(prometheus.NewGaugeFunc(prometheus.GaugeOpts{Name: fmt.Sprintf("test_under_lock_%d", i), Help: "read under the lock"}, func() float64 {
			lock.RLock()
			defer lock.RUnlock()
			return 1
		}))
	}

	var mu sync.Mutex
	scrapes, done := 0, 0
	stop := make(chan struct{})
	defer close(stop)
	go func() {
		for {
			select {
			case <-stop:
				return
			default:
			}
			registry.Gather()
			mu.Lock()
			scrapes++
			mu.Unlock()
		}
	}()
	finished := make(chan struct{})
	go func() {
		defer close(finished)
		for run := 0; run < runs; run++ {
			work(run)
			mu.Lock()
			done++
			mu.Unlock()
		}
	}()

	last, still := -1, 0
	for {
		select {
		case <-finished:
			return
		case <-time.After(250 * time.Millisecond):
		}
		mu.Lock()
		progress := scrapes + done
		mu.Unlock()
		if progress == last {
			still++
		} else {
			still = 0
		}
		last = progress
		if still >= 20 {
			pprof.Lookup("goroutine").WriteTo(os.Stderr, 1)
			t.Fatalf("no scrape and no run finished in 5 s (scrapes=%d runs=%d)", scrapes, done)
		}
	}
}
