// Package office provides the [pipeline.Flow] and each
// office specific [pipleine.Step] for the processing of
// uploaded MS Office documents.
package office

// FileToConvert encasulates all the of necessary data for
// carrying out the step of converting an uploaded MS Office
// document to a PDF.
type FileToConvert struct {
	ID             string
	InFile         string
	OutFile        string
	IsDownloadable bool
}
