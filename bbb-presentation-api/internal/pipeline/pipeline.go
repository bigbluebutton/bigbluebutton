// Package pipline provides an API for composing processing steps together.
//
// A pipeline step consists of an optional message filter, primarily for the purpose of implementing
// validation logic, and a single message processor that is executed only if the filter is passed successfully.
// The purpose of the processor is to apply some service-specific logic using the incoming message.
//
// The input and output of a pipeline step is a [Message] consisting of a payload and an additional information
// about the message provided by the [context.Context].
//
// The steps of a pipeline are composed together into a single [Flow] which can be executed to run all of the
// processing stages for an incoming message and then return an eventual response message.
package pipeline

import (
	"context"
	"errors"
)

// A Message is a wrapper for message payloads of type T that are to be processed through the pipeline.
// Messages also provide a [context.Context] to carry metadata through the pipeline.
type Message[T any] struct {
	ctx     context.Context
	Payload T
}

// NewMessage creates a new Message with the provided payload using [context.Background].
func NewMessage[T any](payload T) Message[T] {
	return NewMessageWithContext(payload, context.Background())
}

// NewMessageWithContext creates a new Message using the given payload and [context.Context]. The provided
// ctx must not be nil.
func NewMessageWithContext[T any](payload T, ctx context.Context) Message[T] {
	if ctx == nil {
		panic("nil context provided")
	}
	return Message[T]{
		ctx:     ctx,
		Payload: payload,
	}
}

// Context returns the message's context. The returned context will never be nil. If no context
// has been set the default background context is returned.
func (m Message[T]) Context() context.Context {
	if m.ctx != nil {
		return m.ctx
	}
	return context.Background()
}

// WithContext returns a copy of m with its context changed to ctx. The provided ctx must must not be nil.
func (m Message[T]) WithContext(ctx context.Context) Message[T] {
	if ctx == nil {
		panic("nil context provided")
	}
	return Message[T]{
		ctx:     ctx,
		Payload: m.Payload,
	}
}

// A ContextKey is an identifer used for the retrieval of context values from a message's context.
type ContextKey string

// ContextValue attempts to return the value associated with the provided ContextKey from the provided ctx.
// Returns the default value for the specified type along with an error if the ContextKey is not associated
// with a value or the associated value does not conform to the specified type.
func ContextValue[T any](ctx context.Context, key ContextKey) (T, error) {
	var t T
	val := ctx.Value(key)
	if val == nil {
		return t, errors.New("no value found for the provided context key")
	}

	result, ok := val.(T)
	if !ok {
		return t, errors.New("value for the provided key does not match the required type")
	}
	return result, nil
}

// A Filter can be applied to a [Message] to ensure that it meets a set of criteria before allowing
// processing to continue. If the message does not pass the filter, an error should be returned to
// abort further processing.
type Filter[T any] interface {
	Filter(Message[T]) error
}

// A Transformer is a processor that transforms an incoming [Message] with a payload of type T into a
// new outgoing message with a payload of type U. If transformation fails, an error should be returned
// to abort further processing.
type Transformer[T, U any] interface {
	Transform(Message[T]) (Message[U], error)
}

// A Generator is a processor that generates additional data based on the incoming [Message] with a payload of
// type T and returns a new message with a payload of type U. If generation fails, an error should be returned
// to abort futher processing.
type Generator[T, U any] interface {
	Generate(Message[T]) (Message[U], error)
}

// A Flow is an assembled composition of pipeline steps that is used to carry out the processing of a
// [Message] through the pipeline. The flow takes and input [Message] with a payload of type T and
// returns a [Message] of type U or an error if a problem occurs in the flow.
type Flow[T, U any] struct {
	Execute func(Message[T]) (Message[U], error)
}

// A Step is single unit of processing of a [Flow]. It is composed of a filter and a processor. The input
// to a step is a [Message] with a payload of type T. The output will be a [Message] with a payload of
// type U or an error if filtering or processing fails.
type Step[T, U any] struct {
	filter    func(Message[T]) error
	processor func(Message[T]) (Message[U], error)
}

// NewStep creates a new empty [Step]. A [Step] must have a processor and, optionally, a filter before it
// can be used in a [Flow].
func NewStep[T, U any]() *Step[T, U] {
	return &Step[T, U]{
		filter:    func(m Message[T]) error { return nil },
		processor: nil,
	}
}

func (s *Step[T, U]) execute(msg Message[T]) (Message[U], error) {
	if s.processor == nil {
		panic("cannot call 'execute' on a Step with no processor function")
	}

	err := s.filter(msg)
	if err != nil {
		return Message[U]{}, err
	}

	result, err := s.processor(msg)
	if err != nil {
		return result, err
	}
	return result, nil
}

// Flow returns a new [Flow] containing a single [Step]. Use [Add] to add additional steps to the flow.
func (s *Step[T, U]) Flow() Flow[T, U] {
	return Flow[T, U]{
		Execute: s.execute,
	}
}

// Filter adds a [Filter] for a [Message] with a payload of type T to a [Step].
func (s *Step[T, U]) Filter(f Filter[T]) *Step[T, U] {
	s.filter = f.Filter
	return s
}

// Transform sets the processor for a [Step] to the provided [Transformer].
func (s *Step[T, U]) Transform(t Transformer[T, U]) *Step[T, U] {
	if s.processor != nil {
		panic("cannot call Transform on a Step that already has a processor function")
	}
	s.processor = t.Transform
	return s
}

// Generate sets the processor for a [Step] to the provided [Generator].
func (s *Step[T, U]) Generate(g Generator[T, U]) *Step[T, U] {
	if s.processor != nil {
		panic("cannot call Generate on a Step that already has a processor function")
	}
	s.processor = g.Generate
	return s
}

// Add connects an existing [Flow] that takes an input [Message] with a payload of type T and outputs
// a message with a payload of type U with a [Step] that takes an input message with a payload of type U
// and outputs a message with a payload of type V. The returned flow will take an input an input Message
// with a payload of type T and output a message with a payload of type V.
func Add[T, U, V any](flow Flow[T, U], step *Step[U, V]) Flow[T, V] {
	return Flow[T, V]{
		Execute: composeExecute(flow.Execute, step.execute),
	}
}

func composeExecute[T, U, V any](f1 func(Message[T]) (Message[U], error), f2 func(Message[U]) (Message[V], error)) func(Message[T]) (Message[V], error) {
	return func(msg Message[T]) (Message[V], error) {
		result, err := f1(msg)
		if err != nil {
			return Message[V]{}, err
		}
		return f2(result)
	}
}
