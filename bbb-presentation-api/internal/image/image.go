// Package image provides the [pipeline.Flow] and each
// image specific [pipleine.Step] for the processing of
// uploaded image documents.
package image

// A FileWithAuxilliaries is a representation of a file that
// has potenitally had additional external files created based
// on the content of the initial file.
type FileWithAuxilliaries struct {
	ID       string
	File     string
	Thumnail string
	TextFile string
	SVG      string
	PNG      string
}
