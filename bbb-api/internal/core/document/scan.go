package document

type Scanner interface {
	Scan(path string) (string, error)
}
