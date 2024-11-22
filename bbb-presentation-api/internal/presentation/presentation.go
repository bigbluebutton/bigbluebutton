// Package presentation contains all of the common
// functionality for the processing of various
// types of uploaded documents.
package presentation

// A ProcessedFile is a representation of a file
// that has finished being processed.
type ProcessedFile struct {
	ID   string
	File string
}
