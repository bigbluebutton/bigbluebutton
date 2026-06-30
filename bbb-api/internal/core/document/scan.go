package document

// Scanner is an interface the wraps the functionality
// for scanning the file located at the given file path.
// What scanning entails is determined by each implementation.
// Returns a string with the result of the scan and
// possibly an error.
type Scanner interface {
	Scan(path string) (string, error)
}
