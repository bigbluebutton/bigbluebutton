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

// State is a string that conveys
// the current state of flow execution.
type State string

// An Executor wraps a [Message] with a payload of
// type T and a [Flow] that accepts a [Message] with
// a payload of type T and outputs a [Message] with
// a payload of type U. The Executor manages the
// execution of the flow by mainting the current state
// of flow execution and handling timeouts and retries.
type Executor[T, U any] struct {
	// ID is used to identify an Executor.
	ID string
	// Description provides details about the
	// flow execution.
	Description string
	// Submitted is a timestamp that marks when
	// an Executor was submitted for flow execution.
	Submitted time.Time
	// Attempts is the current number of attempts
	// that have been made trying for successful
	// flow execution.
	Attempts int
	// MaxRetries is the maximum number of attempts
	// that can be made to try for successful
	// flow execution.
	MaxRetries int
	// Input is the [Message] to submit to the flow
	// for execution.
	Input Message[T]
	// The [Flow] to execute for the given input.
	Flow Flow[T, U]
	// Timeout is the maximum amount of time a flow
	// execution may run for. Values less than or
	// equal to zero indicate no timeout.
	Timeout time.Duration
}

// A Result is the outcome of flow execution handled
// by an [Executor]. A Result contains the output of
// the flow along with additional metadata about the
// execution of the flow such as the current state of
// flow execution.
type Result[T any] struct {
	ID       string
	State    State
	Err      error
	Started  time.Time
	Finished time.Time
	Attempts int
	Output   T
}

// A Manager is a wrapper for the basic functionality
// necessary to manage the concurrent execution of
// many Executors. All Executors managed by a [Manager]
// implementation must be responsible for executing flows
// that accept a [Message] with a payload of type T as input
// and output a [Message] with a payload of type U.
type Manager[T, U any] interface {
	Enqueue(ctx context.Context, task *Executor[T, U]) (string, error)
	Status(ctx context.Context, id string) (*Result[U], bool)
	Cancel(ctx context.Context, id string) bool
}

// ManagerOpts are options for common settings that
// are relevant to the management of Executors.
type ManagerOpts struct {
	// QueueCapacity is number of executors that may
	// be queued for execution at any given time.
	QueueCapacity int
	// NumWorkers is the number of worker Go routines
	// available for concurrent flow execution.
	NumWorkers int
	// ShutdownGrace is the grace period after shutdown
	// of the [Manager] has been requested before the
	// [Manager] is terminated.
	ShutdownGrace time.Duration
}

// DefaultManager is the primary [Manager] implementation
// that should be used for managing Executors.
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

// NewDefaultManager creates a new [DefaultManager] instance responsible
// for manager Executors that execute flows with input payloads of type
// T and output payload of type U.
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
		var cancel context.CancelFunc

		if e.Timeout > 0 {
			execCtx, cancel = context.WithTimeout(execCtx, e.Timeout)
			m.rwMu.Lock()
			m.cancelMap[e.ID] = cancel
			m.rwMu.Unlock()
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

		if cancel != nil {
			m.rwMu.Lock()
			delete(m.cancelMap, e.ID)
			m.rwMu.Unlock()
			cancel()
		}

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
	r, ok := m.status[id]
	if !ok {
		r = &Result[U]{}
	}
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

// Enqueue attempts to add the given [Executor] to the manager's queue
// for execution. Returns the ID of the [Executor] if it is successfully
// enqueued. Returns an error if the context is done or the manager is
// either shutdown or in the process of shutting down.
func (m *DefaultManager[T, U]) Enqueue(ctx context.Context, exec *Executor[T, U]) (string, error) {
	select {
	case <-ctx.Done():
		return "", ctx.Err()
	case <-m.shutdownCh:
		return "", errors.New("manager shutting down")
	default:
	}

	if exec.ID == "" {
		id, _ := uuid.NewV7()
		exec.ID = id.String()
	}
	exec.Submitted = time.Now()

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

// Status retrieves the [Result] associated with the provided ID of
// an [Executor].
func (m *DefaultManager[T, U]) Status(_ context.Context, id string) (*Result[U], bool) {
	m.rwMu.RLock()
	defer m.rwMu.RUnlock()
	r, ok := m.status[id]
	return r, ok
}

// Cancel attempts to cancel the execution of the [Executor]
// associated with the given ID. Returns a flag indicating
// whether the canellation was successful.
func (m *DefaultManager[T, U]) Cancel(_ context.Context, id string) bool {
	m.rwMu.Lock()
	cancel, ok := m.cancelMap[id]
	m.rwMu.Unlock()
	if !ok {
		return false
	}
	cancel()
	return true
}

// Shutdown terminates the [DefaultManager] preventing it
// from accepting any more Executors and releasing any resources
// used by the [DefaultManager].
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
