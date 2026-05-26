// Package presentation contains all of the common
// functionality for the processing of various
// types of uploaded documents.
package presentation

// A FileToProcess is a representation of a file that has
// just been uploaded and is in the initial stages of
// processing.
type FileToProcess struct {
	ID             string
	File           string
	IsDownloadable bool
}

// A ProcessedFile is a representation of a file
// that has finished being processed.
type ProcessedFile struct {
	ID   string
	File string
}
