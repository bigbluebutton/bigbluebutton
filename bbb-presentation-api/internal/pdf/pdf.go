// Package pdf provides the [pipeline.Flow] and each
// PDF specific [pipleine.Step] for the processing of
// uploaded PDFs.
package pdf

// A FileWithPages is a representation of a file that has
// had individual page files generated for each of its
// pages and may have had auxialliary files generated based
// on those page files.
type FileWithPages struct {
	ID    string
	File  string
	Pages []*Page
}

// A Page is a representation of an individual page file
// that has been generated from a parent document.
type Page struct {
	ParentFile string
	File       string
	Num        int
	Thumbnail  string
	TextFile   string
	SVG        string
	PNG        string
}
