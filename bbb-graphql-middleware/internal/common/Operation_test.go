package common

import (
	"errors"
	"fmt"
	"strings"
	"testing"
)

// The leading characters GraphQL ignores before an operation: they do not change its type.
var leadingIgnored = map[string]string{
	"space":   " ",
	"newline": "\n",
	"comment": "# a comment with a { brace\n",
	"comma":   ",",
}

func TestTheOperationTypeComesFromTheDocument(t *testing.T) {
	cases := []struct {
		query string
		want  QueryType
		name  string
	}{
		{"subscription getUsers { user { userId } }", Subscription, "getUsers"},
		{"mutation userSetMuted { userSetMuted(muted: true) }", Mutation, "userSetMuted"},
		{"query getMeeting { meeting { name } }", Query, "getMeeting"},
		{"{ meeting { name } }", Query, ""},
	}
	for _, c := range cases {
		for prefixName, prefix := range map[string]string{"none": "", "space": " ", "newline": "\n", "comment": leadingIgnored["comment"], "comma": ","} {
			operation := DecideOperation(prefix+c.query, c.name)
			if !operation.FromDocument || operation.Type != c.want || operation.Name != c.name {
				t.Errorf("%s before %q: got type %q, name %q, from the document %v; want %q, %q, true",
					prefixName, c.query, operation.Type, operation.Name, operation.FromDocument, c.want, c.name)
			}
			if operation.Document == nil {
				t.Errorf("%s before %q: the document is not passed on", prefixName, c.query)
			}
		}
	}
}

func TestStreamsAndAggregatesComeFromTheDocument(t *testing.T) {
	stream := `chat_stream(batch_size: 1, cursor: {initial_value: {createdAt: "x"}}) { createdAt }`
	cases := []struct {
		name      string
		query     string
		want      QueryType
		streaming bool
	}{
		{"subscription", `subscription S { user { userId } }`, Subscription, false},
		{"stream", `subscription S { ` + stream + ` }`, Streaming, true},
		{"stream with a cursor spelled without spaces", `subscription S { chat_stream(batch_size: 1,cursor:{initial_value:{createdAt:"x"}}) { createdAt } }`, Streaming, true},
		{"stream without a cursor", `subscription S { chat_stream(batch_size: 1) { createdAt } }`, Subscription, false},
		{"aggregate", `subscription S { user_aggregate { aggregate { count } } }`, SubscriptionAggregate, false},
		{"nested aggregate", `subscription S { poll { users_aggregate { aggregate { count } } } }`, SubscriptionAggregate, false},
		{"aggregate without aggregate", `subscription S { user_aggregate { nodes { userId } } }`, Subscription, false},
		{"aggregate and stream", `subscription S { user_aggregate { aggregate { count } } ` + stream + ` }`, SubscriptionAggregate, true},
		{"stream in a fragment", `subscription S { ...F } fragment F on subscription_root { ` + stream + ` }`, Streaming, true},
		{"stream in an inline fragment", `subscription S { ... on subscription_root { ` + stream + ` } }`, Streaming, true},
		{"a fragment cycle", `subscription S { ...A } fragment A on t { ...B } fragment B on t { ...A }`, Subscription, false},
		{"the words in a comment", "subscription S { # _stream(cursor: { and aggregate {\n user { userId } }", Subscription, false},
		{"a query with an aggregate", `query Q { user_aggregate { aggregate { count } } }`, Query, false},
	}
	for _, c := range cases {
		operation := DecideOperation(c.query, "S")
		if c.want == Query {
			operation = DecideOperation(c.query, "Q")
		}
		if operation.Type != c.want || operation.Streaming != c.streaming || !operation.FromDocument {
			t.Errorf("%s: got %q, streaming %v, from the document %v; want %q, streaming %v",
				c.name, operation.Type, operation.Streaming, operation.FromDocument, c.want, c.streaming)
		}
	}
}

// The operation is selected as GraphQL selects it: by operationName, or the only one.
func TestTheSelectedOperationDecidesTheType(t *testing.T) {
	document := `query A { user { userId } } mutation B { userSetMuted(muted: true) }`
	if operation := DecideOperation(document, "B"); operation.Type != Mutation || operation.Name != "B" || !operation.FromDocument {
		t.Errorf("operationName B: got %q %q, from the document %v; want the mutation B", operation.Type, operation.Name, operation.FromDocument)
	}
	if operation := DecideOperation(document, "A"); operation.Type != Query || operation.Name != "A" {
		t.Errorf("operationName A: got %q %q, want the query A", operation.Type, operation.Name)
	}
	for _, operationName := range []string{"", "C"} {
		operation := DecideOperation(document, operationName)
		if operation.FromDocument || operation.Type != Query || operation.Document == nil {
			t.Errorf("operationName %q selects no operation: got %q, from the document %v, document %v; want the text rule",
				operationName, operation.Type, operation.FromDocument, operation.Document != nil)
		}
	}
}

// A document that does not parse keeps the type the start of its text gives, as before.
func TestADocumentThatDoesNotParseKeepsTheTypeOfItsText(t *testing.T) {
	cases := []struct {
		query string
		want  QueryType
	}{
		{"mutation M { userSetMuted(muted: true)", Mutation},
		{" mutation M { userSetMuted(muted: true)", Query},
		{"subscription S { user { userId }", Subscription},
		{`subscription S { chat_stream(batch_size: 1, cursor: {initial_value: {createdAt: "x"}}) { createdAt }`, Streaming},
		{"subscription S { user_aggregate { aggregate { count } }", SubscriptionAggregate},
		{"query Q { user", Query},
	}
	for _, c := range cases {
		operation := DecideOperation(c.query, "")
		if operation.FromDocument || operation.Type != c.want || operation.ParseError == nil || operation.Document != nil {
			t.Errorf("%q: got %q, from the document %v, parse error %v; want %q from the text", c.query, operation.Type, operation.FromDocument, operation.ParseError, c.want)
		}
	}
}

// A query longer than both length limits is not parsed: whichever path it takes refuses it on its
// length. A query past the nesting bound is not parsed either.
func TestAQueryEveryLengthLimitRefusesIsNotParsed(t *testing.T) {
	long := " mutation M { userSetMuted(muted: true) }" + strings.Repeat(" ", 10001)
	operation := DecideOperation(long, "M")
	if operation.Document != nil || operation.ParseError != nil || operation.FromDocument || operation.Type != Query {
		t.Errorf("a query past both limits: got %q, parsed %v, error %v; want the text rule, not parsed", operation.Type, operation.Document != nil, operation.ParseError)
	}

	nested := "query N { user(where: " + strings.Repeat("[", MaxNestingTokens) + ") { userId } }"
	operation = DecideOperation(nested, "N")
	if !errors.Is(operation.ParseError, ErrTooManyNestingTokens) || operation.Document != nil {
		t.Errorf("a query past the nesting bound: parse error %v, want %v", operation.ParseError, ErrTooManyNestingTokens)
	}
}

func TestAnEmptyQueryIsAQuery(t *testing.T) {
	if operation := DecideOperation("", ""); operation.Type != Query || operation.FromDocument {
		t.Errorf("empty query: got %q, from the document %v", operation.Type, operation.FromDocument)
	}
}

func TestTheReaderDecodesAndDecidesASubscribe(t *testing.T) {
	message := DecodeBrowserMessage([]byte(`{"id":"1","type":"subscribe","payload":{"operationName":"M","query":"\n mutation M { userSetMuted(muted: true) }"}}`))
	if message == nil || message.Subscribe.ID != "1" {
		t.Fatalf("the subscribe was not decoded: %+v", message)
	}
	if message.Decide().Operation.Type != Mutation {
		t.Errorf("decided %q, want a mutation", message.Operation.Type)
	}
	if DecodeBrowserMessage([]byte(`{"type":"subscribe","payload":{"variables":[1]}}`)) != nil {
		t.Error("a payload that does not decode as a subscribe was decoded")
	}
}

// The aggregate selected by a *_aggregate field is found through fragments too, and only as its
// own field, not deeper.
func TestTheAggregateIsFoundThroughFragments(t *testing.T) {
	cases := []struct {
		name  string
		query string
		want  QueryType
	}{
		{"a fragment spread", `subscription S { user_aggregate { ...AggFields } } fragment AggFields on user_aggregate { aggregate { count } }`, SubscriptionAggregate},
		{"an inline fragment", `subscription S { user_aggregate { ... on user_aggregate { aggregate { count } } } }`, SubscriptionAggregate},
		{"a spread in a spread", `subscription S { user_aggregate { ...A } } fragment A on t { ...B } fragment B on t { aggregate { count } }`, SubscriptionAggregate},
		{"deeper than its own field", `subscription S { user_aggregate { nodes { aggregate { count } } } }`, Subscription},
		{"a fragment cycle", `subscription S { user_aggregate { ...A } } fragment A on t { ...B } fragment B on t { ...A }`, Subscription},
	}
	for _, c := range cases {
		if operation := DecideOperation(c.query, "S"); operation.Type != c.want || !operation.FromDocument {
			t.Errorf("%s: got %q, from the document %v; want %q", c.name, operation.Type, operation.FromDocument, c.want)
		}
	}
}

func TestTheNameIsTheDecidedOneOrTheField(t *testing.T) {
	if got := DecideOperation("subscription Named { a }", "").NameOr(""); got != "Named" {
		t.Errorf("a named document without the field: %q", got)
	}
	if got := DecideOperation("subscription Named { a", "Field").NameOr("Field"); got != "Field" {
		t.Errorf("a document that does not parse: %q, want the field", got)
	}
}

// chainOfFragments is a subscription with fields *_aggregate fields that all spread the first of
// a chain of links fragments, none of which selects aggregate.
func chainOfFragments(fields, links int) string {
	var query strings.Builder
	query.WriteString("subscription S {")
	for i := 0; i < fields; i++ {
		fmt.Fprintf(&query, " a%d_aggregate { ...F0 }", i)
	}
	query.WriteString(" }")
	for i := 0; i < links; i++ {
		if i < links-1 {
			fmt.Fprintf(&query, " fragment F%d on t { ...F%d x }", i, i+1)
		} else {
			fmt.Fprintf(&query, " fragment F%d on t { x }", i)
		}
	}
	return query.String()
}

// The search for the aggregate of *_aggregate fields walks each fragment definition once per
// document, however many of those fields spread the same chain of fragments.
func TestTheAggregateSearchWalksEachFragmentOnce(t *testing.T) {
	query := chainOfFragments(150, 100)
	document, err := ParseQuery(query)
	if err != nil {
		t.Fatal(err)
	}
	var scan fieldScan
	scan.selectionSet(document, selectOperation(document, "S").SelectionSet)
	if scan.aggregate || scan.streaming {
		t.Errorf("aggregate %v, streaming %v, want neither", scan.aggregate, scan.streaming)
	}
	if scan.fragmentsWalked != 100 {
		t.Errorf("walked %d fragment definitions for 150 fields, want each of the 100 once", scan.fragmentsWalked)
	}
	if operation := DecideOperation(query, "S"); operation.Type != Subscription || !operation.FromDocument {
		t.Errorf("decided %q, from the document %v; want a subscription", operation.Type, operation.FromDocument)
	}
}
