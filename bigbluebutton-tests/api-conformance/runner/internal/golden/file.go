package golden

import (
	"bufio"
	"bytes"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/spec"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/steps"
)

// File is one case's recording: the normalized output of each of its steps
// that isn't golden: off.
type File struct {
	Case     string
	Target   string // the target it was recorded from
	Sections []Section
}

// Section is one step's part of a recording.
type Section struct {
	Key
	Label    string // what the step does: call create, route x, fs, ...
	Document bool   // golden: document, which run doesn't compare
	Lines    []string
}

// title is the section's header without its "== " prefix.
func (s Section) title() string {
	phase := "step"
	if s.Phase == "teardown" {
		phase = "teardown"
	}
	t := fmt.Sprintf("%s %d: %s", phase, s.Index+1, s.Label)
	if s.Document {
		t += " (document)"
	}
	return t
}

// recorded lists the step types whose output is recorded: those that take
// golden.
var recorded = map[spec.StepKind]bool{
	spec.KindCall: true, spec.KindPresence: true, spec.KindGraphQL: true, spec.KindBus: true,
	spec.KindFS: true, spec.KindRedis: true, spec.KindSink: true,
}

// Sections returns the sections a recording of c has, without their lines.
// They follow from the case alone, so a recording whose sections differ was
// made from another version of the case.
func Sections(c *spec.Case) []Section {
	var out []Section
	for _, ph := range []struct {
		name  string
		steps []spec.Step
	}{{"steps", c.Steps}, {"teardown", c.Teardown}} {
		for i, s := range ph.steps {
			mode := steps.GoldenMode(c, ph.name, s)
			if !recorded[s.Kind] || mode == "off" {
				continue
			}
			out = append(out, Section{Key: Key{ph.name, i}, Label: label(s), Document: mode == "document"})
		}
	}
	return out
}

func label(s spec.Step) string {
	switch {
	case s.Kind == spec.KindPresence:
		return "presence " + s.Presence.Action + " as " + s.Presence.As
	case s.Kind == spec.KindGraphQL && s.GraphQL.Op != nil:
		return "graphql " + s.GraphQL.Op.Type + " " + s.GraphQL.Op.Name + " as " + s.GraphQL.As
	case s.Kind == spec.KindBus:
		return "bus " + s.Bus.Name
	case s.Kind == spec.KindFS:
		return "fs " + s.FS.Path
	case s.Kind == spec.KindRedis:
		return "redis " + s.Redis.Key
	case s.Kind != spec.KindCall:
		return string(s.Kind)
	}
	c := s.Call
	var l string
	switch {
	case c.HasCall && c.Call == "":
		l = `call ""` // the version endpoint
	case c.HasCall:
		l = "call " + c.Call
	case c.Route != "":
		l = "route " + c.Route
	default:
		l = "url " + c.URL
	}
	if c.Method != "GET" {
		l += " (" + c.Method + ")"
	}
	return l
}

// Build makes c's recording from the steps a run collected for it. It fails
// if a section's step wasn't reached.
func Build(c *spec.Case, target string, got []Step) (*File, error) {
	byKey := map[Key]Step{}
	for _, s := range got {
		byKey[s.Key] = s
	}
	f := &File{Case: c.ID, Target: target}
	for _, sec := range Sections(c) {
		s, ok := byKey[sec.Key]
		if !ok {
			return nil, fmt.Errorf("%s wasn't reached", sec.title())
		}
		sec.Lines = s.Lines
		f.Sections = append(f.Sections, sec)
	}
	return f, nil
}

// Stale describes how a recording's sections differ from those c has now,
// or returns "" if they match.
func Stale(f *File, c *spec.Case) string {
	want := Sections(c)
	for i := 0; i < max(len(want), len(f.Sections)); i++ {
		had, has := "nothing", "nothing"
		if i < len(f.Sections) {
			had = f.Sections[i].title()
		}
		if i < len(want) {
			has = want[i].title()
		}
		if had != has {
			return fmt.Sprintf("it has %s where the case has %s", had, has)
		}
	}
	return ""
}

// Path is where c's recording lives under dir.
func Path(dir string, c *spec.Case) string {
	return filepath.Join(dir, c.Endpoint, c.ID+".txt")
}

// Leaks reports whether lines hold a secret: the salt's placeholder or a
// redaction label. Such a recording must never be written.
func Leaks(lines []string) bool {
	for _, l := range lines {
		if strings.Contains(l, "${salt}") || strings.Contains(l, "[salt]") || strings.Contains(l, "[secret:") {
			return true
		}
	}
	return false
}

const header = "# Recorded by bbb-conform record. Review it with bbb-conform review before committing.\n"

// Format renders the recording. It fails on a line the format can't hold.
func (f *File) Format() ([]byte, error) {
	var b bytes.Buffer
	b.WriteString(header)
	fmt.Fprintf(&b, "case %s\ntarget %s\n", f.Case, f.Target)
	for _, s := range f.Sections {
		fmt.Fprintf(&b, "\n== %s\n", s.title())
		for _, l := range s.Lines {
			if l == "" || strings.ContainsAny(l, "\r\n") || strings.HasPrefix(l, "==") {
				return nil, fmt.Errorf("%s: can't record the line %s", s.title(), strconv.Quote(l))
			}
			b.WriteString(l + "\n")
		}
	}
	return b.Bytes(), nil
}

var sectionRe = regexp.MustCompile(`^== (step|teardown) ([1-9][0-9]*): (.+?)( \(document\))?$`)

// Parse reads a recording. name is the file it came from: the case it
// names must match the file's name.
func Parse(name string, data []byte) (*File, error) {
	f := &File{}
	sc := bufio.NewScanner(bytes.NewReader(data))
	sc.Buffer(make([]byte, 64*1024), 16*1024*1024)
	seen := map[Key]bool{}
	var cur *Section
	n := 0
	for sc.Scan() {
		n++
		line := strings.TrimSuffix(sc.Text(), "\r")
		if m := sectionRe.FindStringSubmatch(line); m != nil {
			phase := "steps"
			if m[1] == "teardown" {
				phase = "teardown"
			}
			i, _ := strconv.Atoi(m[2])
			k := Key{phase, i - 1}
			if seen[k] {
				return nil, fmt.Errorf("%s:%d: %s %s appears twice", name, n, m[1], m[2])
			}
			seen[k] = true
			f.Sections = append(f.Sections, Section{Key: k, Label: m[3], Document: m[4] != ""})
			cur = &f.Sections[len(f.Sections)-1]
			continue
		}
		switch {
		case line == "":
		case cur != nil:
			cur.Lines = append(cur.Lines, line)
		case strings.HasPrefix(line, "#"):
		case strings.HasPrefix(line, "case "):
			f.Case = strings.TrimPrefix(line, "case ")
		case strings.HasPrefix(line, "target "):
			f.Target = strings.TrimPrefix(line, "target ")
		default:
			return nil, fmt.Errorf("%s:%d: expected case, target or a section, got %s", name, n, strconv.Quote(line))
		}
	}
	if err := sc.Err(); err != nil {
		return nil, fmt.Errorf("%s: %w", name, err)
	}
	if want := strings.TrimSuffix(filepath.Base(name), ".txt"); f.Case != want {
		return nil, fmt.Errorf("%s: records case %q, but the file is named for %q", name, f.Case, want)
	}
	return f, nil
}

// Read reads and parses a recording. A missing file gives an error for
// which errors.Is(err, fs.ErrNotExist) holds.
func Read(name string) (*File, error) {
	data, err := os.ReadFile(name)
	if err != nil {
		return nil, err
	}
	return Parse(name, data)
}

// Write writes data to name atomically, unless the file already holds
// exactly that. It reports whether it wrote.
func Write(name string, data []byte) (bool, error) {
	if old, err := os.ReadFile(name); err == nil && bytes.Equal(old, data) {
		return false, nil
	}
	dir := filepath.Dir(name)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return false, err
	}
	tmp, err := os.CreateTemp(dir, ".recording-*")
	if err != nil {
		return false, err
	}
	defer os.Remove(tmp.Name()) // fails harmlessly once renamed
	if _, err := tmp.Write(data); err != nil {
		tmp.Close()
		return false, err
	}
	if err := tmp.Close(); err != nil {
		return false, err
	}
	if err := os.Chmod(tmp.Name(), 0o644); err != nil {
		return false, err
	}
	return true, os.Rename(tmp.Name(), name)
}

// List returns the recordings under dir by case ID. A missing dir has none.
func List(dir string) (map[string]string, error) {
	out := map[string]string{}
	err := filepath.WalkDir(dir, func(p string, d fs.DirEntry, err error) error {
		if err != nil {
			if p == dir && os.IsNotExist(err) {
				return filepath.SkipDir
			}
			return err
		}
		if !d.IsDir() && strings.HasSuffix(p, ".txt") {
			out[strings.TrimSuffix(d.Name(), ".txt")] = p
		}
		return nil
	})
	return out, err
}
