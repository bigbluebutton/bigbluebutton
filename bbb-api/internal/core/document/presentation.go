package document

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
}
