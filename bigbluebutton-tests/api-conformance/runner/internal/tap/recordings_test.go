package tap

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/resp"
)

// writeTree writes files (slash paths, relative to dir) with their contents.
func writeTree(t *testing.T, dir string, files map[string]string) {
	t.Helper()
	for name, body := range files {
		p := filepath.Join(dir, filepath.FromSlash(name))
		if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(p, []byte(body), 0o644); err != nil {
			t.Fatal(err)
		}
	}
}

func readFile(t *testing.T, dir, name string) string {
	t.Helper()
	b, err := os.ReadFile(filepath.Join(dir, filepath.FromSlash(name)))
	if err != nil {
		t.Fatal(err)
	}
	return string(b)
}

func exists(dir, name string) bool {
	_, err := os.Stat(filepath.Join(dir, filepath.FromSlash(name)))
	return err == nil
}

var fixtureTree = map[string]string{
	"published/presentation/rec-a/metadata.xml":    "a presentation",
	"published/video/rec-a/metadata.xml":           "a video",
	"unpublished/presentation/rec-b/metadata.xml":  "b",
	"deleted/presentation/rec-c/metadata.xml":      "c",
	"recording/process/presentation/rec-d/x/y.txt": "d",
	"captions/rec-a/captions.json":                 "[]",
	"captions/rec-a/subtitles_en.vtt":              "WEBVTT",
	"captions/inbox/ignored.txt":                   "not a recording",
}

func startRecordingsTap(t *testing.T, fixtures, data string) (*Server, *Client) {
	t.Helper()
	s, err := Start(Config{Redis: resp.Options{Addr: "127.0.0.1:1"}, DataDir: data, Recordings: fixtures,
		MaxBytes: 1 << 20, MaxAge: time.Hour})
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(s.Close)
	srv := httptest.NewServer(s)
	t.Cleanup(srv.Close)
	return s, NewClient(srv.URL, "")
}

func TestRecordingsInstalledAtStart(t *testing.T) {
	fixtures, data := t.TempDir(), t.TempDir()
	writeTree(t, fixtures, fixtureTree)
	writeTree(t, data, map[string]string{
		"unpublished/presentation/rec-a/metadata.xml":       "a moved by an earlier run",
		"captions/inbox/rec-a-1700000000000-track.txt":      "uploaded by an earlier run",
		"captions/inbox/rec-a-1700000000001-track.json.tmp": "being written by an earlier run",
		"captions/inbox/rec-a-2-1700000000000-track.json":   "a recording whose ID starts with rec-a-",
		"captions/inbox/rec-ab-1700000000000-track.txt":     "another recording's upload",
		"published/presentation/other/metadata.xml":         "not a fixture",
	})
	_, c := startRecordingsTap(t, fixtures, data)

	for name, body := range fixtureTree {
		if strings.HasPrefix(name, "captions/inbox/") {
			continue
		}
		if got := readFile(t, data, name); got != body {
			t.Errorf("%s = %q, want %q", name, got, body)
		}
	}
	for _, gone := range []string{"unpublished/presentation/rec-a", "captions/inbox/rec-a-1700000000000-track.txt",
		"captions/inbox/rec-a-1700000000001-track.json.tmp", "captions/inbox/ignored.txt"} {
		if exists(data, gone) {
			t.Errorf("%s is still there", gone)
		}
	}
	for _, kept := range []string{"published/presentation/other/metadata.xml", "captions/inbox/rec-ab-1700000000000-track.txt",
		"captions/inbox/rec-a-2-1700000000000-track.json"} {
		if !exists(data, kept) {
			t.Errorf("%s was removed", kept)
		}
	}
	info, err := c.Info(ctx(t))
	if err != nil {
		t.Fatal(err)
	}
	if info.Recordings != fixtures || info.RecordingCount != 4 {
		t.Errorf("info = %q, %d; want %q, 4", info.Recordings, info.RecordingCount, fixtures)
	}
}

func TestRestoreRecordings(t *testing.T) {
	fixtures, data := t.TempDir(), t.TempDir()
	writeTree(t, fixtures, fixtureTree)
	_, c := startRecordingsTap(t, fixtures, data)

	// What bbb-web does to rec-a when it deletes it, and to rec-b when it
	// publishes it.
	if err := os.MkdirAll(filepath.Join(data, "deleted", "presentation"), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.Rename(filepath.Join(data, "published/presentation/rec-a"), filepath.Join(data, "deleted/presentation/rec-a")); err != nil {
		t.Fatal(err)
	}
	writeTree(t, data, map[string]string{
		"deleted/presentation/rec-a/metadata.xml":   "a deleted",
		"published/presentation/rec-b/metadata.xml": "b published",
		"captions/rec-a/subtitles_fr.vtt":           "added",
	})
	if err := os.RemoveAll(filepath.Join(data, "unpublished/presentation/rec-b")); err != nil {
		t.Fatal(err)
	}

	if err := c.Restore(ctx(t), []string{"rec-a"}); err != nil {
		t.Fatal(err)
	}
	if got := readFile(t, data, "published/presentation/rec-a/metadata.xml"); got != "a presentation" {
		t.Errorf("rec-a = %q", got)
	}
	for _, gone := range []string{"deleted/presentation/rec-a", "captions/rec-a/subtitles_fr.vtt"} {
		if exists(data, gone) {
			t.Errorf("%s is still there", gone)
		}
	}
	if !exists(data, "published/presentation/rec-b") {
		t.Error("restoring rec-a touched rec-b")
	}

	if err := c.Restore(ctx(t), []string{"rec-b", "rec-c"}); err != nil {
		t.Fatal(err)
	}
	if exists(data, "published/presentation/rec-b") || readFile(t, data, "unpublished/presentation/rec-b/metadata.xml") != "b" {
		t.Error("rec-b wasn't put back")
	}

	writeTree(t, data, map[string]string{"recording/process/presentation/rec-d/x/y.txt": "changed", "captions/rec-a/captions.json": "changed"})
	if err := c.RestoreAll(ctx(t)); err != nil {
		t.Fatal(err)
	}
	if readFile(t, data, "recording/process/presentation/rec-d/x/y.txt") != "d" || readFile(t, data, "captions/rec-a/captions.json") != "[]" {
		t.Error("all=1 didn't put every recording back")
	}
}

func TestRestoreRefuses(t *testing.T) {
	fixtures, data := t.TempDir(), t.TempDir()
	writeTree(t, fixtures, fixtureTree)
	s, c := startRecordingsTap(t, fixtures, data)

	var te *Error
	writeTree(t, data, map[string]string{"published/presentation/rec-a/metadata.xml": "changed"})
	if err := c.Restore(ctx(t), []string{"rec-a", "../published"}); !errors.As(err, &te) || te.Status != http.StatusNotFound {
		t.Errorf("unknown ID: %v", err)
	}
	if readFile(t, data, "published/presentation/rec-a/metadata.xml") != "changed" {
		t.Error("a refused restore put rec-a back")
	}
	if err := c.Restore(ctx(t), nil); !errors.As(err, &te) || te.Status != http.StatusBadRequest {
		t.Errorf("no ID: %v", err)
	}
	for _, q := range []string{"all=1&id=rec-a", "all=yes"} {
		w := httptest.NewRecorder()
		s.ServeHTTP(w, httptest.NewRequest(http.MethodPost, "http://127.0.0.1/recordings/restore?"+q, nil))
		if w.Code != http.StatusBadRequest {
			t.Errorf("%s: %d", q, w.Code)
		}
	}
	w := httptest.NewRecorder()
	s.ServeHTTP(w, httptest.NewRequest(http.MethodGet, "http://127.0.0.1/recordings/restore?id=rec-a", nil))
	if w.Code != http.StatusMethodNotAllowed {
		t.Errorf("GET: %d", w.Code)
	}

	plain := startWorld(t)
	if err := plain.client.Restore(ctx(t), []string{"rec-a"}); !errors.As(err, &te) || te.Status != http.StatusConflict {
		t.Errorf("tap without recordings: %v", err)
	}
}

func TestRecordingsTreeChecked(t *testing.T) {
	for name, tree := range map[string]map[string]string{
		"bad ID": {"published/presentation/a.b/metadata.xml": "x"},
		"empty":  {"published/presentation/metadata.xml": "a file, not a recording"},
	} {
		t.Run(name, func(t *testing.T) {
			fixtures := t.TempDir()
			writeTree(t, fixtures, tree)
			_, err := Start(Config{Redis: resp.Options{Addr: "127.0.0.1:1"}, DataDir: t.TempDir(), Recordings: fixtures,
				MaxBytes: 1 << 20, MaxAge: time.Hour})
			if err == nil {
				t.Fatal("Start accepted the tree")
			}
		})
	}
	if _, err := Start(Config{Redis: resp.Options{Addr: "127.0.0.1:1"}, Recordings: t.TempDir(), MaxBytes: 1 << 20, MaxAge: time.Hour}); err == nil {
		t.Error("Start accepted recordings without a data directory")
	}
}

// The fixture tree can't be the data directory, under any name: installing
// would remove each recording from the tree before copying it.
func TestRecordingsTreeIsntTheDataDirectory(t *testing.T) {
	dir := t.TempDir()
	writeTree(t, dir, fixtureTree)
	link := filepath.Join(t.TempDir(), "link")
	if err := os.Symlink(dir, link); err != nil {
		t.Fatal(err)
	}
	for _, data := range []string{dir, link} {
		_, err := Start(Config{Redis: resp.Options{Addr: "127.0.0.1:1"}, DataDir: data, Recordings: dir,
			MaxBytes: 1 << 20, MaxAge: time.Hour})
		if err == nil || !strings.Contains(err.Error(), "is the data directory") {
			t.Errorf("data directory %s: %v", data, err)
		}
	}
	for name, body := range fixtureTree {
		if readFile(t, dir, name) != body {
			t.Errorf("%s changed", name)
		}
	}
}
