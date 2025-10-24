package pipeline

import (
	"context"
	"errors"
	"log/slog"
	"sync"
	"time"

	"github.com/google/uuid"
)

const (
	StateQueued    State = "queued"
	StateRunning   State = "running"
	StateSucceeded State = "succeeded"
	StateFailed    State = "failed"
	StateCancelled State = "cancelled"
)

type State string

type Executor[T, U any] struct {
	ID          string
	Description string
	Submitted   time.Time
	Attempts    int
	MaxRetries  int
	Input       Message[T]
	Flow        Flow[T, U]
	Timeout     time.Duration
}

type Result[T any] struct {
	ID       string
	State    State
	Err      error
	Started  time.Time
	Finished time.Time
	Attempts int
	Output   T
}

type Manager[T, U any] interface {
	Enqueue(ctx context.Context, task *Executor[T, U]) (string, error)
	Status(ctx context.Context, id string) (*Result[U], bool)
	Cancel(ctx context.Context, id string) bool
}

type ManagerOpts struct {
	QueueCapacity int
	NumWorkers    int
	ShutdownGrace time.Duration
}

type DefaultManager[T, U any] struct {
	opts       ManagerOpts
	queue      chan *Executor[T, U]
	rwMu       sync.RWMutex
	status     map[string]*Result[U]
	cancelMap  map[string]context.CancelFunc
	workerWg   sync.WaitGroup
	shutdownCh chan struct{}
	startOnce  sync.Once
	shutdownMu sync.Mutex
}

func NewDefaultManager[T, U any](opts ManagerOpts) *DefaultManager[T, U] {
	if opts.QueueCapacity < 1 {
		opts.QueueCapacity = 200
	}
	if opts.NumWorkers < 1 {
		opts.NumWorkers = 4
	}
	if opts.ShutdownGrace < 1 {
		opts.ShutdownGrace = 30 * time.Second
	}

	m := &DefaultManager[T, U]{
		opts:       opts,
		queue:      make(chan *Executor[T, U], opts.QueueCapacity),
		status:     make(map[string]*Result[U], opts.QueueCapacity),
		cancelMap:  make(map[string]context.CancelFunc),
		shutdownCh: make(chan struct{}),
	}

	m.startOnce.Do(func() { m.start() })

	return m
}

func (m *DefaultManager[T, U]) start() {
	for i := 0; i < m.opts.NumWorkers; i++ {
		m.workerWg.Add(1)
		go m.worker(i)
	}
}

func (m *DefaultManager[T, U]) worker(idx int) {
	defer m.workerWg.Done()
	logger := slog.With("worker", idx)

	for e := range m.queue {
		logger.Info("Starting flow execution", "ID", e.ID, "Description", e.Description)

		execCtx := e.Input.Context()
		if e.Timeout > 0 {
			var cancel context.CancelFunc
			execCtx, cancel = context.WithTimeout(execCtx, e.Timeout)
			m.rwMu.Lock()
			m.cancelMap[e.ID] = cancel
			m.rwMu.Unlock()
			defer func() {
				m.rwMu.Lock()
				delete(m.cancelMap, e.ID)
				m.rwMu.Unlock()
				cancel()
			}()
		}

		start := time.Now()
		var u U
		m.setState(e.ID, StateRunning, nil, start, time.Time{}, e.Attempts, u)

		out, err := m.runWithRetry(execCtx, e)
		end := time.Now()
		state := StateSucceeded
		if err != nil {
			if errors.Is(err, context.Canceled) {
				state = StateCancelled
			} else {
				state = StateFailed
			}
		}
		m.setState(e.ID, state, err, start, end, e.Attempts, out)

		logger.Info("Finished executing flow", "ID", e.ID, "State", state, "Error", err)
	}
}

func (m *DefaultManager[T, U]) runWithRetry(ctx context.Context, exec *Executor[T, U]) (U, error) {
	var lastErr error
	var out Message[U]
	var u U
	for attempt := 0; attempt <= exec.MaxRetries; attempt++ {
		exec.Attempts = attempt + 1
		func() {
			defer func() {
				if v := recover(); v != nil {
					lastErr = errors.New("panic in flow execution")
				}
			}()

			res, err := exec.Flow.Execute(exec.Input.WithContext(ctx))
			if err != nil {
				lastErr = err
				return
			}
			out = res
			lastErr = nil
		}()
		if lastErr == nil {
			return out.Payload, nil
		}
		select {
		case <-time.After(time.Duration(250*(attempt+1)) * time.Millisecond):
		case <-ctx.Done():
			return u, ctx.Err()
		}
	}
	return u, lastErr
}

func (m *DefaultManager[T, U]) setState(id string, state State, err error, started, finished time.Time, attempts int, out U) {
	m.rwMu.Lock()
	defer m.rwMu.Unlock()
	r := m.status[id]
	r.State = state
	r.Err = err
	if !started.IsZero() {
		r.Started = started
	}
	if !finished.IsZero() {
		r.Finished = finished
	}
	if attempts > 0 {
		r.Attempts = attempts
	}
	r.Output = out
	m.status[id] = r
}

func (m *DefaultManager[T, U]) Enqueue(ctx context.Context, exec *Executor[T, U]) (string, error) {
	select {
	case <-ctx.Done():
		return "", ctx.Err()
	case <-m.shutdownCh:
		return "", errors.New("shutting down")
	default:
	}

	if exec.ID == "" {
		id, _ := uuid.NewV7()
		exec.ID = id.String()
	}
	exec.Submitted = time.Now()
	if exec.MaxRetries == 0 {
		exec.MaxRetries = 2
	}

	m.rwMu.Lock()
	m.status[exec.ID] = &Result[U]{ID: exec.ID, State: StateQueued}
	m.rwMu.Unlock()

	select {
	case m.queue <- exec:
		return exec.ID, nil
	case <-ctx.Done():
		return "", ctx.Err()
	}
}

func (m *DefaultManager[T, U]) Status(_ context.Context, id string) (*Result[U], bool) {
	m.rwMu.RLock()
	defer m.rwMu.RUnlock()
	r, ok := m.status[id]
	return r, ok
}

func (m *DefaultManager[T, U]) Cancel(_ context.Context, id string) bool {
	m.rwMu.Lock()
	cancel, ok := m.cancelMap[id]
	m.rwMu.Unlock()
	if ok {
		cancel()
		return true
	}
	return false
}

func (m *DefaultManager[T, U]) Shutdown() {
	m.shutdownMu.Lock()
	defer m.shutdownMu.Unlock()
	select {
	case <-m.shutdownCh:
		// Do nothing already closed
	default:
		close(m.shutdownCh)
		close(m.queue)
	}
	m.workerWg.Wait()
}
