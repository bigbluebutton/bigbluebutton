package common

import (
	"encoding/json"
	"errors"
	"fmt"
	"slices"
	"strings"

	"bbb-graphql-middleware/config"

	"github.com/graphql-go/graphql/language/ast"
	"github.com/graphql-go/graphql/language/parser"
	"github.com/graphql-go/graphql/language/source"
)

// MaxNestingTokens bounds how many '{' and '[' a query may contain before it is parsed. The GraphQL
// parser recurses with no limit of its own, and each level of its recursion (selection set, object
// value, list value, list type) consumes one of these tokens, so their count bounds the recursion
// for any input. 5000 matches the default max_query_length, so it refuses nothing that limit
// accepts; at about 940 bytes per level for the costliest construct (list values), 5000 levels
// take about 4.5 MiB of stack, against the 1 GiB default limit.
const MaxNestingTokens = 5000

// ErrTooManyNestingTokens is the error of ParseQuery for a query past MaxNestingTokens.
var ErrTooManyNestingTokens = errors.New("too many braces and brackets")

// CountNestingTokens counts every '{' and '[' in the text, including those inside strings and
// comments, so it is never below the number of such tokens the lexer produces.
func CountNestingTokens(query string) int {
	return strings.Count(query, "{") + strings.Count(query, "[")
}

// ParseQuery parses a query, refusing without parsing one past MaxNestingTokens. Every parse of a
// client query goes through it.
func ParseQuery(query string) (*ast.Document, error) {
	if tokens := CountNestingTokens(query); tokens > MaxNestingTokens {
		return nil, fmt.Errorf("%w: %d, the max allowed is %d", ErrTooManyNestingTokens, tokens, MaxNestingTokens)
	}

	return parser.Parse(parser.ParseParams{
		Source: source.NewSource(&source.Source{
			Body: []byte(query),
			Name: "GraphQL query",
		}),
	})
}

// Operation is what the middleware decides about the operation of a subscribe message: its type
// and its name. The reader decides it once, from the parsed document, and passes it on with the
// message to whoever handles it.
type Operation struct {
	Type QueryType
	// Name is the name of the selected operation in the document.
	Name string
	// Streaming is set for a subscription with a field *_stream that has a cursor argument: the
	// middleware tracks its cursor. Type is SubscriptionAggregate rather than Streaming when the
	// subscription also has an aggregate.
	Streaming bool
	// FromDocument is set when Type and Name come from the parsed document. When it is not set,
	// the document did not parse, was not parsed, or names no single operation, and Type comes
	// from the start of the query text, as the middleware decided it before.
	FromDocument bool
	// Document is the parsed document, nil when it was not parsed or did not parse.
	Document *ast.Document
	// ParseError is why Document is nil when the parse was attempted.
	ParseError error
}

// NameOr is the name of the operation: the name decided from the document, or, when there is
// none, jsonName, the operationName field of the message.
func (o *Operation) NameOr(jsonName string) string {
	if o.Name != "" {
		return o.Name
	}
	return jsonName
}

// IsSubscription reports whether the type is one of the subscription types.
func (t QueryType) IsSubscription() bool {
	return t == Subscription || t == Streaming || t == SubscriptionAggregate
}

// DecideOperation decides the type and the name of the operation of a query, from the parsed
// document. It parses the query once. A query that does not parse, that names no single operation,
// or that both length limits refuse (it is then not parsed) keeps the type the start of its text
// gives, as before.
func DecideOperation(query string, operationName string) *Operation {
	operation := decideOperation(query, operationName)
	return &operation
}

func decideOperation(query string, operationName string) Operation {
	if query == "" {
		return Operation{Type: Query}
	}
	if longerThanBothLengthLimits(len(query)) {
		return operationFromText(query)
	}

	document, err := ParseQuery(query)
	if err != nil {
		operation := operationFromText(query)
		operation.ParseError = err
		return operation
	}

	selected := selectOperation(document, operationName)
	if selected == nil {
		operation := operationFromText(query)
		operation.Document = document
		return operation
	}

	operation := Operation{FromDocument: true, Document: document}
	if selected.Name != nil {
		operation.Name = selected.Name.Value
	}
	switch selected.Operation {
	case ast.OperationTypeMutation:
		operation.Type = Mutation
	case ast.OperationTypeSubscription:
		var fields fieldScan
		fields.selectionSet(document, selected.SelectionSet)
		operation.Streaming = fields.streaming
		switch {
		case fields.aggregate:
			operation.Type = SubscriptionAggregate
		case fields.streaming:
			operation.Type = Streaming
		default:
			operation.Type = Subscription
		}
	default:
		operation.Type = Query
	}
	return operation
}

// longerThanBothLengthLimits reports whether a query is longer than both max_query_length and
// max_mutation_length, so that whichever path it takes refuses it on its length. Such a query is
// not parsed, as it was not before it was refused.
func longerThanBothLengthLimits(length int) bool {
	maxQueryLength := config.GetConfig().Server.MaxQueryLength
	maxMutationLength := config.GetConfig().Server.MaxMutationLength
	return maxQueryLength > 0 && maxMutationLength > 0 && length > max(maxQueryLength, maxMutationLength)
}

// selectOperation is the operation a request executes, as GraphQL selects it: the one named
// operationName, or the only one of the document when operationName is empty. It is nil when there
// is no such single operation.
func selectOperation(document *ast.Document, operationName string) *ast.OperationDefinition {
	var selected *ast.OperationDefinition
	for _, definition := range document.Definitions {
		operation, ok := definition.(*ast.OperationDefinition)
		if !ok {
			continue
		}
		if operationName != "" && (operation.Name == nil || operation.Name.Value != operationName) {
			continue
		}
		if selected != nil {
			return nil
		}
		selected = operation
	}
	return selected
}

// fieldScan looks through the fields of a selection set, at any depth and through fragments, for
// a stream (a field *_stream with a cursor argument) and an aggregate (a field *_aggregate that
// selects aggregate, directly or through fragments).
type fieldScan struct {
	streaming bool
	aggregate bool
	fragments []string // fragments already scanned, so a fragment cycle ends

	// aggregateFragments holds the fragments that select aggregate, directly or through other
	// fragments. It is computed once per document, when a *_aggregate field first spreads a
	// fragment, so every *_aggregate field reads it rather than walking the fragments again.
	aggregateFragments map[string]bool
	// fragmentsWalked counts the fragment definitions that computation walked: each one once.
	fragmentsWalked int
}

func (s *fieldScan) selectionSet(document *ast.Document, selectionSet *ast.SelectionSet) {
	eachField(document, selectionSet, &s.fragments, func(field *ast.Field) bool {
		s.field(document, field)
		return true
	})
}

func (s *fieldScan) field(document *ast.Document, field *ast.Field) {
	if field.Name == nil {
		return
	}
	name := field.Name.Value
	if strings.HasSuffix(name, "_stream") {
		for _, argument := range field.Arguments {
			if argument.Name != nil && argument.Name.Value == "cursor" {
				s.streaming = true
			}
		}
	}
	if strings.HasSuffix(name, "_aggregate") && !s.aggregate && s.selectsAggregate(document, field.SelectionSet) {
		s.aggregate = true
	}
}

// selectsAggregate reports whether a selection set has a field aggregate of its own, through
// inline fragments and fragment spreads, not in the selection sets of its fields.
func (s *fieldScan) selectsAggregate(document *ast.Document, selectionSet *ast.SelectionSet) bool {
	if selectionSet == nil {
		return false
	}
	for _, selection := range selectionSet.Selections {
		switch selection := selection.(type) {
		case *ast.Field:
			if selection.Name != nil && selection.Name.Value == "aggregate" {
				return true
			}
		case *ast.InlineFragment:
			if s.selectsAggregate(document, selection.SelectionSet) {
				return true
			}
		case *ast.FragmentSpread:
			if selection.Name == nil {
				continue
			}
			if s.aggregateFragments == nil {
				s.aggregateFragments = s.fragmentsSelectingAggregate(document)
			}
			if s.aggregateFragments[selection.Name.Value] {
				return true
			}
		}
	}
	return false
}

// fragmentsSelectingAggregate walks each fragment definition of the document once, for whether it
// has a field aggregate of its own (through inline fragments) and which fragments it spreads, and
// returns the fragments from which such a field is reached through spreads.
func (s *fieldScan) fragmentsSelectingAggregate(document *ast.Document) map[string]bool {
	selecting := map[string]bool{}
	spreadBy := map[string][]string{} // fragment -> the fragments that spread it
	var reached []string
	for _, definition := range document.Definitions {
		fragment, ok := definition.(*ast.FragmentDefinition)
		if !ok || fragment.Name == nil {
			continue
		}
		s.fragmentsWalked++
		name := fragment.Name.Value
		var walk func(*ast.SelectionSet)
		walk = func(selectionSet *ast.SelectionSet) {
			if selectionSet == nil {
				return
			}
			for _, selection := range selectionSet.Selections {
				switch selection := selection.(type) {
				case *ast.Field:
					if selection.Name != nil && selection.Name.Value == "aggregate" && !selecting[name] {
						selecting[name] = true
						reached = append(reached, name)
					}
				case *ast.InlineFragment:
					walk(selection.SelectionSet)
				case *ast.FragmentSpread:
					if selection.Name != nil {
						spreadBy[selection.Name.Value] = append(spreadBy[selection.Name.Value], name)
					}
				}
			}
		}
		walk(fragment.SelectionSet)
	}
	// A fragment that spreads one that selects aggregate selects it too.
	for len(reached) > 0 {
		name := reached[len(reached)-1]
		reached = reached[:len(reached)-1]
		for _, spreading := range spreadBy[name] {
			if !selecting[spreading] {
				selecting[spreading] = true
				reached = append(reached, spreading)
			}
		}
	}
	return selecting
}

// eachField calls visit for each field of a selection set, through inline fragments and fragment
// spreads, and descends into the selection set of a field when visit returns true. fragments holds
// the fragments already walked, so a fragment cycle ends.
func eachField(document *ast.Document, selectionSet *ast.SelectionSet, fragments *[]string, visit func(*ast.Field) bool) {
	if selectionSet == nil {
		return
	}
	for _, selection := range selectionSet.Selections {
		switch selection := selection.(type) {
		case *ast.Field:
			if visit(selection) {
				eachField(document, selection.SelectionSet, fragments, visit)
			}
		case *ast.InlineFragment:
			eachField(document, selection.SelectionSet, fragments, visit)
		case *ast.FragmentSpread:
			if selection.Name == nil || slices.Contains(*fragments, selection.Name.Value) {
				continue
			}
			*fragments = append(*fragments, selection.Name.Value)
			for _, definition := range document.Definitions {
				if fragment, ok := definition.(*ast.FragmentDefinition); ok && fragment.Name != nil && fragment.Name.Value == selection.Name.Value {
					eachField(document, fragment.SelectionSet, fragments, visit)
				}
			}
		}
	}
}

// operationFromText is the type the start of the query text gives, as the middleware decided it
// before it parsed the document, for a document it does not decide from the parse.
func operationFromText(query string) Operation {
	switch {
	case strings.HasPrefix(query, "subscription"):
		operation := Operation{Type: Subscription, Streaming: isStreamingText(query)}
		switch {
		case isAggregateText(query):
			operation.Type = SubscriptionAggregate
		case operation.Streaming:
			operation.Type = Streaming
		}
		return operation
	case strings.HasPrefix(query, "mutation"):
		return Operation{Type: Mutation}
	}
	return Operation{Type: Query}
}

func isStreamingText(query string) bool {
	return strings.Contains(query, "_stream(") && strings.Contains(query, "cursor: {")
}

func isAggregateText(query string) bool {
	return strings.Contains(query, "_aggregate") && strings.Contains(query, "aggregate {")
}

// BrowserMessage is a message read from the browser, on its way to Hasura or to
// bbb-graphql-actions.
type BrowserMessage struct {
	Raw []byte
	// Subscribe is the message decoded, nil when the reader did not decode it.
	Subscribe *BrowserSubscribeMessage
	// Operation is the decided operation of a subscribe, nil when it was not decided.
	Operation *Operation

	// The message and its operation are held in the same allocation as the message passed on.
	subscribe BrowserSubscribeMessage
	operation Operation
}

// DecodeBrowserMessage decodes a message read from the browser. It returns nil when the message
// does not decode as a subscribe message.
func DecodeBrowserMessage(raw []byte) *BrowserMessage {
	message := &BrowserMessage{Raw: raw}
	if err := json.Unmarshal(raw, &message.subscribe); err != nil {
		return nil
	}
	message.Subscribe = &message.subscribe
	return message
}

// Decide decides the operation of a decoded subscribe message, and returns the message.
func (m *BrowserMessage) Decide() *BrowserMessage {
	m.operation = decideOperation(m.Subscribe.Payload.Query, m.Subscribe.Payload.OperationName)
	m.Operation = &m.operation
	return m
}
