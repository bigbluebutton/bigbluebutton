package tap

import (
	"errors"
	"fmt"
	"io/fs"
	"net/http"
	"os"
	"path"
	"regexp"
	"sort"
)

// recordingStates are the directories under the data directory that hold
// recordings, one directory per playback format below each, and one per
// record ID below that. bbb-web moves a recording between them when it
// publishes, unpublishes or deletes it.
var recordingStates = []string{"published", "unpublished", "deleted", "recording/process"}

// recordIDPattern is what a fixture's record ID may look like: nginx serves
// caption files only for record IDs like these.
var recordIDPattern = regexp.MustCompile(`^[A-Za-z0-9_-]+$`)

// recordings holds the fixture recordings a tap installs into the data
// directory: a tree laid out like it, with recordings under the state
// directories and caption files under captions/<record ID>/.
type recordings struct {
	dir   string
	root  *os.Root
	paths map[string][]string // record ID -> its directories in the tree
	uid   int                 // owner given to what is written, or -1
	gid   int
}

// openRecordings reads the fixture tree in dir.
func openRecordings(dir string) (*recordings, error) {
	root, err := os.OpenRoot(dir)
	if err != nil {
		return nil, err
	}
	rec := &recordings{dir: dir, root: root, paths: map[string][]string{}, uid: -1, gid: -1}
	add := func(id, p string) error {
		if !recordIDPattern.MatchString(id) {
			return fmt.Errorf("fixture recordings: %s: a record ID may only have letters, digits, - and _", p)
		}
		rec.paths[id] = append(rec.paths[id], p)
		return nil
	}
	for _, st := range recordingStates {
		formats, err := subdirs(root, st)
		if err != nil {
			root.Close()
			return nil, err
		}
		for _, f := range formats {
			ids, err := subdirs(root, path.Join(st, f))
			if err != nil {
				root.Close()
				return nil, err
			}
			for _, id := range ids {
				if err := add(id, path.Join(st, f, id)); err != nil {
					root.Close()
					return nil, err
				}
			}
		}
	}
	captions, err := subdirs(root, "captions")
	if err != nil {
		root.Close()
		return nil, err
	}
	for _, id := range captions {
		if id == "inbox" {
			continue
		}
		if err := add(id, path.Join("captions", id)); err != nil {
			root.Close()
			return nil, err
		}
	}
	if len(rec.paths) == 0 {
		root.Close()
		return nil, fmt.Errorf("fixture recordings: no recordings under %s", dir)
	}
	return rec, nil
}

// subdirs lists the directories in dir, sorted; none if dir is missing.
func subdirs(root *os.Root, dir string) ([]string, error) {
	entries, err := fs.ReadDir(root.FS(), dir)
	if errors.Is(err, fs.ErrNotExist) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	var out []string
	for _, e := range entries {
		if e.IsDir() {
			out = append(out, e.Name())
		}
	}
	return out, nil
}

// ids returns the fixture record IDs, sorted.
func (rec *recordings) ids() []string {
	out := make([]string, 0, len(rec.paths))
	for id := range rec.paths {
		out = append(out, id)
	}
	sort.Strings(out)
	return out
}

// restore puts the recording id back into data as the fixture tree has
// it: every copy of it in data goes, in any state and format, with its
// caption files and anything uploaded for it to the captions inbox; then
// the tree's copy goes in.
func (rec *recordings) restore(data *os.Root, id string) error {
	for _, st := range recordingStates {
		formats, err := subdirs(data, st)
		if err != nil {
			return err
		}
		for _, f := range formats {
			if err := data.RemoveAll(path.Join(st, f, id)); err != nil {
				return err
			}
		}
	}
	if err := data.RemoveAll(path.Join("captions", id)); err != nil {
		return err
	}
	inbox, err := fs.ReadDir(data.FS(), "captions/inbox")
	if err != nil && !errors.Is(err, fs.ErrNotExist) {
		return err
	}
	// bbb-web names an upload <record ID>-<ms>-track.txt, with its
	// description in .json, written first as .json.tmp.
	upload := regexp.MustCompile(`^` + regexp.QuoteMeta(id) + `-[0-9]+-track\.(txt|json|json\.tmp)$`)
	for _, e := range inbox {
		if upload.MatchString(e.Name()) {
			if err := data.RemoveAll(path.Join("captions/inbox", e.Name())); err != nil {
				return err
			}
		}
	}
	for _, p := range rec.paths[id] {
		if err := rec.copyTree(data, p); err != nil {
			return err
		}
	}
	return nil
}

// copyTree copies the directory p of the tree to the same place in data,
// creating its parents.
func (rec *recordings) copyTree(data *os.Root, p string) error {
	if err := rec.mkdirAll(data, path.Dir(p)); err != nil {
		return err
	}
	return fs.WalkDir(rec.root.FS(), p, func(name string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		switch {
		case d.IsDir():
			if err := data.Mkdir(name, 0o755); err != nil && !errors.Is(err, fs.ErrExist) {
				return err
			}
		case d.Type().IsRegular():
			b, err := rec.root.ReadFile(name)
			if err != nil {
				return err
			}
			if err := data.WriteFile(name, b, 0o644); err != nil {
				return err
			}
		default:
			return fmt.Errorf("fixture recordings: %s isn't a regular file or a directory", name)
		}
		return rec.own(data, name)
	})
}

// mkdirAll creates dir and its missing parents in data, giving each one
// it creates the data directory's owner.
func (rec *recordings) mkdirAll(data *os.Root, dir string) error {
	if dir == "." || dir == "/" {
		return nil
	}
	if _, err := data.Stat(dir); err == nil {
		return nil
	}
	if err := rec.mkdirAll(data, path.Dir(dir)); err != nil {
		return err
	}
	if err := data.Mkdir(dir, 0o755); err != nil && !errors.Is(err, fs.ErrExist) {
		return err
	}
	return rec.own(data, dir)
}

// own gives name the data directory's owner when the tap runs as root, as
// on a full install, so that bbb-web, which runs as that owner, can move
// and rewrite what the tap wrote.
func (rec *recordings) own(data *os.Root, name string) error {
	if rec.uid < 0 {
		return nil
	}
	return data.Lchown(name, rec.uid, rec.gid)
}

// installRecordings opens the fixture tree and installs every recording
// in it into the data directory.
func (s *Server) installRecordings() error {
	rec, err := openRecordings(s.cfg.Recordings)
	if err != nil {
		return err
	}
	if os.Geteuid() == 0 {
		st, err := s.root.Stat(".")
		if err != nil {
			rec.root.Close()
			return err
		}
		if uid, gid, ok := owner(st); ok {
			rec.uid, rec.gid = uid, gid
		}
	}
	for _, id := range rec.ids() {
		if err := rec.restore(s.root, id); err != nil {
			rec.root.Close()
			return fmt.Errorf("fixture recordings: installing %s: %w", id, err)
		}
	}
	s.rec = rec
	return nil
}

// restoreRecordings serves POST /recordings/restore?id=...: it restores
// each recording named, all or none of them known; all=1 restores every
// one.
func (s *Server) restoreRecordings(r *http.Request) (any, int, error) {
	if r.Method != http.MethodPost {
		return nil, http.StatusMethodNotAllowed, errors.New("/recordings/restore takes POST")
	}
	if s.rec == nil {
		return nil, http.StatusConflict, errors.New("the tap has no fixture recordings: start it with --recordings")
	}
	q := r.URL.Query()
	ids := q["id"]
	switch {
	case q.Get("all") == "1" && len(ids) == 0:
		ids = s.rec.ids()
	case q.Has("all"):
		return nil, http.StatusBadRequest, errors.New("all=1 takes no id=")
	case len(ids) == 0:
		return nil, http.StatusBadRequest, errors.New("name the recordings to restore with id=, or all=1")
	}
	for _, id := range ids {
		if _, ok := s.rec.paths[id]; !ok {
			return nil, http.StatusNotFound, fmt.Errorf("%q isn't a fixture recording", id)
		}
	}
	s.recMu.Lock()
	defer s.recMu.Unlock()
	for _, id := range ids {
		if err := s.rec.restore(s.root, id); err != nil {
			return nil, http.StatusInternalServerError, fmt.Errorf("restoring %s: %w", id, err)
		}
	}
	return RestoreResult{Restored: ids}, 0, nil
}
