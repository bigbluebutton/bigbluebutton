// Package convfix finds the presentation conversion suite's fixtures
// (bigbluebutton-tests/presentation-conversion) by their IDs, so that the
// sink can serve one to the server without the suite keeping a copy.
//
// A fixture is a manifest, fixtures/<tier>/<id>.yaml in that suite. Its
// file is named relative to the manifest and may be elsewhere in the
// repository; a runtime fixture is generated instead. Only the fields the
// conformance suite needs are read: id, file and generate.
package convfix

import (
	"errors"
	"fmt"
	"io/fs"
	"path"
	"regexp"
	"strings"

	"go.yaml.in/yaml/v3"
)

// ManifestDir is where the manifests are, relative to the repository.
const ManifestDir = "bigbluebutton-tests/presentation-conversion/fixtures"

// Dirs are the directories, relative to the repository, a fixture's file
// may be in: the manifests' own, and the two the conversion suite borrows
// from. The sink is given these and nothing else of the repository.
var Dirs = []string{
	ManifestDir,
	"bigbluebutton-tests/playwright/core/media",
	"bigbluebutton-web/test/resources",
}

// tiers are the manifest directories searched, in order. private holds
// fixtures that aren't in the repository, so it isn't one of them.
var tiers = []string{"synthetic", "repo", "variants", "runtime"}

// MaxGenerated is the largest file a runtime fixture may ask for.
const MaxGenerated = 64 << 20

var idPattern = regexp.MustCompile(`^[a-z0-9][a-z0-9-]*$`)

// ErrNotFound is returned when no tier has a manifest for the ID, and
// ErrBadID when the ID can't be one.
var (
	ErrNotFound = errors.New("no such conversion fixture")
	ErrBadID    = errors.New("bad conversion fixture ID")
)

// Fixture is a fixture found by ID.
type Fixture struct {
	ID string
	// Path is its file, relative to the repository; "" when it is
	// generated.
	Path string
	// Generated, when Path is "", is the length of the padded PDF that
	// stands for it.
	Generated int64
	// Name is the file name it is served as.
	Name string
}

type manifest struct {
	ID       string `yaml:"id"`
	File     string `yaml:"file"`
	Generate *struct {
		Kind  string `yaml:"kind"`
		Bytes int64  `yaml:"bytes"`
	} `yaml:"generate"`
}

// Find reads the manifest for id from fsys, the repository, and says
// which file it stands for.
func Find(fsys fs.FS, id string) (Fixture, error) {
	if !idPattern.MatchString(id) {
		return Fixture{}, fmt.Errorf("%w %q: lower-case letters, digits and dashes", ErrBadID, id)
	}
	for _, tier := range tiers {
		p := path.Join(ManifestDir, tier, id+".yaml")
		b, err := fs.ReadFile(fsys, p)
		if errors.Is(err, fs.ErrNotExist) {
			continue
		}
		if err != nil {
			return Fixture{}, err
		}
		return resolve(p, id, b)
	}
	return Fixture{}, fmt.Errorf("%w %q (looked in %s/{%s})", ErrNotFound, id, ManifestDir, strings.Join(tiers, ","))
}

func resolve(manifestPath, id string, b []byte) (Fixture, error) {
	var m manifest
	if err := yaml.Unmarshal(b, &m); err != nil {
		return Fixture{}, fmt.Errorf("%s: %w", manifestPath, err)
	}
	if m.ID != id {
		return Fixture{}, fmt.Errorf("%s: its id is %q", manifestPath, m.ID)
	}
	switch {
	case m.Generate != nil && m.File != "":
		return Fixture{}, fmt.Errorf("%s: has both file and generate", manifestPath)
	case m.Generate != nil:
		// The suite pads a one-page PDF to the length asked for; so
		// does the sink, though not byte for byte.
		if m.Generate.Kind != "padded-pdf" {
			return Fixture{}, fmt.Errorf("%s: the sink can't generate a %q fixture, only padded-pdf", manifestPath, m.Generate.Kind)
		}
		if m.Generate.Bytes < 1 || m.Generate.Bytes > MaxGenerated {
			return Fixture{}, fmt.Errorf("%s: generate.bytes %d isn't from 1 to %d", manifestPath, m.Generate.Bytes, MaxGenerated)
		}
		return Fixture{ID: id, Generated: m.Generate.Bytes, Name: id + ".pdf"}, nil
	case m.File == "":
		return Fixture{}, fmt.Errorf("%s: has neither file nor generate", manifestPath)
	}
	// path.Join would make an absolute file relative to the manifest;
	// the suite reads it as absolute, so it is refused.
	p := path.Join(path.Dir(manifestPath), m.File)
	if path.IsAbs(m.File) || !fs.ValidPath(p) || !inDirs(p) {
		return Fixture{}, fmt.Errorf("%s: file %q is outside %s", manifestPath, m.File, strings.Join(Dirs, ", "))
	}
	return Fixture{ID: id, Path: p, Name: path.Base(p)}, nil
}

func inDirs(p string) bool {
	for _, d := range Dirs {
		if strings.HasPrefix(p, d+"/") {
			return true
		}
	}
	return false
}
