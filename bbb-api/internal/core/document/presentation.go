package document

// Presentation is a representation of a
// BigBlueButton presentation.
type Presentation struct {
	ID           string
	TempID       string
	PodID        string
	MeetingID    string
	FileName     string
	FilePath     string
	Current      bool
	AuthzToken   string
	Downloadable bool
	Removable    bool
	Default      bool
	URL          string
	Pages        []Page
}

// Copy creates a deep copy of the [Presentation] and returns
// the reference to the new [Presentation].
func (p Presentation) Copy() Presentation {
	pres := Presentation{
		ID:           p.ID,
		TempID:       p.TempID,
		PodID:        p.PodID,
		MeetingID:    p.MeetingID,
		FileName:     p.FileName,
		FilePath:     p.FilePath,
		Current:      p.Current,
		AuthzToken:   p.AuthzToken,
		Downloadable: p.Downloadable,
		Removable:    p.Removable,
		Default:      p.Default,
		URL:          p.URL,
	}

	pages := make([]Page, 0, len(p.Pages))
	pages = append(pages, p.Pages...)
	pres.Pages = pages

	return pres
}

// A Page represents an individual document page
// from a [Presentation].
type Page struct {
	ParentFilePath string
	FilePath       string
	Num            int
	ThumbnailPath  string
	TextFilePath   string
	SVGPath        string
	PNGPath        string
	UseBlanks      bool
}

// Copy creates a deep copy of the [Page] and returns
// the reference to the new [Page].
func (p Page) Copy() Page {
	return Page{
		ParentFilePath: p.ParentFilePath,
		FilePath:       p.FilePath,
		Num:            p.Num,
		ThumbnailPath:  p.ThumbnailPath,
		TextFilePath:   p.TextFilePath,
		SVGPath:        p.SVGPath,
		PNGPath:        p.PNGPath,
	}
}
