package websrv

import (
	"fmt"
	"os"
	"runtime/pprof"
	"strconv"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"bbb-graphql-middleware/internal/common"

	"github.com/prometheus/client_golang/prometheus"
)

// A scrape of /metrics (prometheus.DefaultGatherer.Gather, what promhttp.Handler runs) while
// connections close, with more series than the registry passes along at once and new series
// created by the closes: every scrape and every close must finish. The connections are registered
// and closed as ConnectionHandler does.
// registerForScrapeOnce registers the metrics once for the test binary, however many times the
// test runs.
var registerForScrapeOnce sync.Once

func TestScrapeWhileConnectionsClose(t *testing.T) {
	registerForScrapeOnce.Do(func() {
		common.RegisterMetrics()
		RegisterConnectionMetrics()
	})

	const (
		names          = 200 // distinct operation names, within the default cap of 500
		perConnection  = 20  // subscriptions held by each closing connection
		closingWorkers = 4
	)
	types := []common.QueryType{common.Subscription, common.Streaming, common.SubscriptionAggregate, common.Query, common.Mutation}

	subscriptions := make([]common.GraphQlSubscription, 0, names*len(types))
	for i := 0; i < names; i++ {
		operationName := fmt.Sprintf("scrapeWhileClosing%d", i)
		for _, queryType := range types {
			subscriptions = append(subscriptions, common.GraphQlSubscription{
				Type:               queryType,
				OperationName:      operationName,
				OperationNameLabel: common.MetricOperationName(operationName),
			})
		}
	}
	// The series a running server has: these subscriptions were started, resent and received data,
	// and some were completed before. Closing the connections then creates the connection_closed series.
	for _, subscription := range subscriptions {
		common.GqlSubscribeCounter.WithLabelValues(string(subscription.Type), subscription.OperationNameLabel).Inc()
		common.GqlSubscriptionRetransmittedCounter.WithLabelValues(string(subscription.Type), subscription.OperationNameLabel).Inc()
		common.GqlReceivedDataCounter.WithLabelValues(string(subscription.Type), subscription.OperationNameLabel).Inc()
		for _, reason := range []string{common.RemovedByClient, common.RemovedByHasura} {
			common.GqlSubscriptionRemovedCounter.WithLabelValues(string(subscription.Type), subscription.OperationNameLabel, reason).Inc()
		}
	}

	var scrapes, closes atomic.Int64
	stopScraping := make(chan struct{})
	go func() {
		for {
			select {
			case <-stopScraping:
				return
			default:
			}
			if _, err := prometheus.DefaultGatherer.Gather(); err != nil {
				t.Error(err)
			}
			scrapes.Add(1)
		}
	}()
	defer close(stopScraping)

	batches := make(chan []common.GraphQlSubscription, len(subscriptions)/perConnection+1)
	for i := 0; i < len(subscriptions); i += perConnection {
		batches <- subscriptions[i:min(i+perConnection, len(subscriptions))]
	}
	close(batches)

	var workers sync.WaitGroup
	var lastId atomic.Int64
	for w := 0; w < closingWorkers; w++ {
		workers.Add(1)
		go func() {
			defer workers.Done()
			for batch := range batches {
				id := fmt.Sprintf("BCscrape%d", lastId.Add(1))
				connection := &common.BrowserConnection{Id: id, ActiveSubscriptions: make(map[string]common.GraphQlSubscription, len(batch))}
				connection.ActiveSubscriptionsMutex.Lock()
				for i, subscription := range batch {
					subscription.Id = strconv.Itoa(i)
					connection.ActiveSubscriptions[subscription.Id] = subscription
					connection.NoteActiveSubscriptionsLocked()
				}
				connection.ActiveSubscriptionsMutex.Unlock()
				BrowserConnectionsMutex.Lock()
				BrowserConnections[id] = connection
				BrowserConnectionsMutex.Unlock()
				openConnectionSubscriptions.Store(id, &connection.ActiveSubscriptionsCount)

				time.Sleep(200 * time.Microsecond)

				openConnectionSubscriptions.Delete(id)
				recordConnectionClose(connection, true)
				BrowserConnectionsMutex.Lock()
				delete(BrowserConnections, id)
				BrowserConnectionsMutex.Unlock()
				closes.Add(1)
			}
		}()
	}
	closed := make(chan struct{})
	go func() { workers.Wait(); close(closed) }()

	stuck := func(what string) {
		pprof.Lookup("goroutine").WriteTo(os.Stderr, 1)
		t.Fatalf("%s (scrapes=%d closes=%d)", what, scrapes.Load(), closes.Load())
	}
	lastScrapes, lastCloses, still := int64(-1), int64(-1), 0
	for {
		select {
		case <-closed:
			before := scrapes.Load()
			time.Sleep(500 * time.Millisecond)
			if scrapes.Load() == before {
				stuck("no scrape finished after all the connections closed")
			}
			return
		case <-time.After(250 * time.Millisecond):
		}
		s, c := scrapes.Load(), closes.Load()
		if s == lastScrapes && c == lastCloses {
			still++
		} else {
			still = 0
		}
		lastScrapes, lastCloses = s, c
		if still >= 20 {
			stuck("no scrape and no connection close finished in 5 s")
		}
	}
}
