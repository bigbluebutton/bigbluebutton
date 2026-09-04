package pipeline

import (
	"context"
	"fmt"
	"testing"

	"github.com/pkg/errors"
)

const (
	filterSuccess = "success"
)

type TestFilter struct{}

func (f *TestFilter) Filter(msg Message[string]) error {
	if msg.Payload != filterSuccess {
		return fmt.Errorf("validation failed; got: %s, want: %s", msg.Payload, filterSuccess)
	}
	return nil
}

type TestMessage struct {
	data string
}

type TestTransformer struct{}

func (t *TestTransformer) Transform(msg Message[string]) (Message[TestMessage], error) {
	return Message[TestMessage]{
		Payload: TestMessage{
			"output",
		},
	}, nil
}

type TestMessageFilter struct{}

func (f *TestMessageFilter) Filter(msg Message[TestMessage]) error {
	if msg.Payload.data != filterSuccess {
		return fmt.Errorf("validation failed; got: %s, want %s", msg.Payload.data, filterSuccess)
	}
	return nil
}

type StringTransformer struct{}

func (t StringTransformer) Transform(msg Message[TestMessage]) (Message[string], error) {
	return NewMessage(msg.Payload.data), nil
}

type ErrorTransformer struct{}

func (t *ErrorTransformer) Transform(msg Message[string]) (Message[TestMessage], error) {
	return Message[TestMessage]{}, errors.Errorf("error transforming message: %v", msg)
}

func TestMessage_Context(t *testing.T) {
	msg1 := Message[string]{
		Payload: "test1",
	}

	msg2 := NewMessage("test2")

	if msg1.Context() == nil {
		t.Error("context should not be nil")
	}

	if msg2.Context() == nil {
		t.Error("context should not be nil")
	}
}

func TestMessage_WithContext(t *testing.T) {
	ctx := context.Background()

	msg1 := Message[string]{
		Payload: "test",
	}

	msg2 := msg1.WithContext(ctx)

	if msg2.ctx != ctx {
		t.Error("context was not set")
	}
}

func TestMessage_NewMessageWithContext(t *testing.T) {
	ctx := context.Background()
	msg1 := NewMessageWithContext("test", ctx)

	if msg1.ctx != ctx {
		t.Error("context was not set")
	}

	if msg1.Payload != "test" {
		t.Error("payload was not set")
	}
}

func TestFilterAndTransform(t *testing.T) {
	msg := NewMessage(filterSuccess)
	step := NewStep[string, TestMessage]().Filter(&TestFilter{}).Transform(&TestTransformer{})
	resp, err := step.Flow().Execute(msg)

	if err != nil {
		t.Errorf("expected no error, got : %v", err)
	}

	if resp.Payload.data != "output" {
		t.Errorf("unexpected payload; got: %s, want: output", resp.Payload.data)
	}
}

func TestFilterAndTransformError(t *testing.T) {
	msg := NewMessage("fail")
	step := NewStep[string, TestMessage]().Filter(&TestFilter{}).Transform(&TestTransformer{})
	resp, err := step.Flow().Execute(msg)

	if err == nil {
		t.Error("expected error, got none")
	}

	if resp.Payload.data != "" {
		t.Errorf("expected empty payload, got: %s", resp.Payload.data)
	}
}

func TestMultipleSteps(t *testing.T) {
	msg := NewMessage(filterSuccess)
	step1 := NewStep[string, TestMessage]().Filter(&TestFilter{}).Transform(&TestTransformer{})
	step2 := NewStep[TestMessage, string]().Transform(StringTransformer{})
	step3 := NewStep[string, TestMessage]().Transform(&TestTransformer{})

	flow1 := Add(step1.Flow(), step2)
	finalFlow := Add(flow1, step3)
	resp, err := finalFlow.Execute(msg)

	if err != nil {
		t.Errorf("expected no error, got: %v", err)
	}

	if resp.Payload.data != "output" {
		t.Errorf("unexpected payload; got: %s, want: output", resp.Payload.data)
	}
}

func TestMerge(t *testing.T) {
	msg := NewMessage(filterSuccess)
	step1 := NewStep[string, TestMessage]().Filter(&TestFilter{}).Transform(&TestTransformer{})
	step2 := NewStep[TestMessage, string]().Transform(StringTransformer{})

	flow := Merge(step1.Flow(), step2.Flow())
	resp, err := flow.Execute(msg)

	if err != nil {
		t.Errorf("expected no error, got: %v", err)
	}

	if resp.Payload != "output" {
		t.Errorf("unexpected payload; got: %s, want: output", resp.Payload)
	}
}

func TestFilterErrorPropagation(t *testing.T) {
	msg := NewMessage(filterSuccess)
	step1 := NewStep[string, TestMessage]().Filter(&TestFilter{}).Transform(&TestTransformer{})
	step2 := NewStep[TestMessage, string]().Filter(&TestMessageFilter{}).Transform(StringTransformer{})

	flow := Add(step1.Flow(), step2)
	resp, err := flow.Execute(msg)

	if err == nil {
		t.Error("expected error but got none")
	}

	if resp.Payload != "" {
		t.Errorf("expected empty payload, got: %s", resp.Payload)
	}
}

func TestTransformerErrorPropagation(t *testing.T) {
	msg := NewMessage(filterSuccess)
	step1 := NewStep[string, TestMessage]().Filter(&TestFilter{}).Transform(&TestTransformer{})
	step2 := NewStep[TestMessage, string]().Transform(StringTransformer{})
	step3 := NewStep[string, TestMessage]().Transform(&ErrorTransformer{})

	f1 := Add(step1.Flow(), step2)
	finalFlow := Add(f1, step3)
	resp, err := finalFlow.Execute(msg)

	if err == nil {
		t.Error("expected error but got none")
	}

	if resp.Payload.data != "" {
		t.Errorf("expected empty payload, got: %s", resp.Payload.data)
	}
}
