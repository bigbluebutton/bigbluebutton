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

type Message[T any] struct {
	ctx     context.Context
	Payload T
}

func NewMessage[T any](payload T) Message[T] {
	return NewMessageWithContext(payload, context.Background())
}

func NewMessageWithContext[T any](payload T, ctx context.Context) Message[T] {
	if ctx == nil {
		panic("nil context provided")
	}
	return Message[T]{
		ctx:     ctx,
		Payload: payload,
	}
}

func (m Message[T]) Context() context.Context {
	if m.ctx != nil {
		return m.ctx
	}
	return context.Background()
}

func (m Message[T]) WithContext(ctx context.Context) Message[T] {
	if ctx == nil {
		panic("nil context provided")
	}
	return Message[T]{
		ctx:     ctx,
		Payload: m.Payload,
	}
}

type ContextKey string

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

type Filter[T any] interface {
	Filter(Message[T]) error
}

type Transformer[T, U any] interface {
	Transform(Message[T]) (Message[U], error)
}

type Generator[T, U any] interface {
	Generate(Message[T]) (Message[U], error)
}

type Flow[T, U any] struct {
	Execute func(Message[T]) (Message[U], error)
}

type Step[T, U any] struct {
	filter    func(Message[T]) error
	processor func(Message[T]) (Message[U], error)
}

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

func (s *Step[T, U]) Flow() Flow[T, U] {
	return Flow[T, U]{
		Execute: s.execute,
	}
}

func (s *Step[T, U]) Filter(f Filter[T]) *Step[T, U] {
	s.filter = f.Filter
	return s
}

func (s *Step[T, U]) Transform(t Transformer[T, U]) *Step[T, U] {
	if s.processor != nil {
		panic("cannot call Transform on a Step that already has a processor function")
	}
	s.processor = t.Transform
	return s
}

func (s *Step[T, U]) Generate(g Generator[T, U]) *Step[T, U] {
	if s.processor != nil {
		panic("cannot call Generate on a Step that already has a processor function")
	}
	s.processor = g.Generate
	return s
}

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
