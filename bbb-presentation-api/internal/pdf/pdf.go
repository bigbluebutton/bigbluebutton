package pdf

type FileToProcess struct {
	ID             string
	File           string
	IsDownloadable bool
}

type FileWithPages struct {
	ID         string
	File       string
	Pages      []*Page
	Thumbnails []string
	TextFiles  []string
	Svgs       []string
	Pngs       []string
}

type Page struct {
	ParentFile string
	File       string
	Num        int
}
