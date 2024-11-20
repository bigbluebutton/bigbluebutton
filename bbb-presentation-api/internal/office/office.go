// Package office provides the [pipeline.Flow] and each
// office specific [pipleine.Step] for the processing of
// uploaded MS Office documents.
package office

type FileToConvert struct {
	ID             string
	InFile         string
	OutFile        string
	IsDownloadable bool
}
