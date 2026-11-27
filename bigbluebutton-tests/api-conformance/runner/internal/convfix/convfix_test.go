package convfix

import (
	"errors"
	"os"
	"strings"
	"testing"
	"testing/fstest"
)

func repo(files map[string]string) fstest.MapFS {
	m := fstest.MapFS{}
	for p, s := range files {
		m[p] = &fstest.MapFile{Data: []byte(s)}
	}
	return m
}

func TestFind(t *testing.T) {
	fsys := repo(map[string]string{
		ManifestDir + "/synthetic/pdf-a.yaml":     "id: pdf-a\nfile: pdf-a.pdf\npages: 3\n",
		ManifestDir + "/repo/repo-b.yaml":         "id: repo-b\nfile: ../../../../bigbluebutton-web/test/resources/b.ppt\n",
		ManifestDir + "/variants/var-c.yaml":      "id: var-c\nfile: ../../../playwright/core/media/c.pdf\nupload: {name: x.pptx}\n",
		ManifestDir + "/runtime/rt-d.yaml":        "id: rt-d\ngenerate: {kind: padded-pdf, bytes: 31000000}\n",
		ManifestDir + "/runtime/rt-noise.yaml":    "id: rt-noise\ngenerate: {kind: noise-image-pdf, width: 10}\n",
		ManifestDir + "/runtime/rt-huge.yaml":     "id: rt-huge\ngenerate: {kind: padded-pdf, bytes: 99999999999}\n",
		ManifestDir + "/synthetic/escape.yaml":    "id: escape\nfile: ../../../../../etc/passwd\n",
		ManifestDir + "/synthetic/elsewhere.yaml": "id: elsewhere\nfile: ../../../../bbb-common-web/build.gradle\n",
		ManifestDir + "/synthetic/wrong-id.yaml":  "id: other\nfile: x.pdf\n",
		ManifestDir + "/synthetic/both.yaml":      "id: both\nfile: x.pdf\ngenerate: {kind: padded-pdf, bytes: 5}\n",
		ManifestDir + "/synthetic/neither.yaml":   "id: neither\npages: 1\n",
		ManifestDir + "/synthetic/bad-yaml.yaml":  "id: [\n",
		ManifestDir + "/private/secret.yaml":      "id: secret\nfile: secret.pdf\n",
		ManifestDir + "/synthetic/dup.yaml":       "id: dup\nfile: synthetic-dup.pdf\n",
		ManifestDir + "/repo/dup.yaml":            "id: dup\nfile: repo-dup.pdf\n",
		ManifestDir + "/synthetic/abs.yaml":       "id: abs\nfile: /etc/passwd\n",
	})
	ok := []struct {
		id   string
		want Fixture
	}{
		{"pdf-a", Fixture{ID: "pdf-a", Path: ManifestDir + "/synthetic/pdf-a.pdf", Name: "pdf-a.pdf"}},
		{"repo-b", Fixture{ID: "repo-b", Path: "bigbluebutton-web/test/resources/b.ppt", Name: "b.ppt"}},
		{"var-c", Fixture{ID: "var-c", Path: "bigbluebutton-tests/playwright/core/media/c.pdf", Name: "c.pdf"}},
		{"rt-d", Fixture{ID: "rt-d", Generated: 31000000, Name: "rt-d.pdf"}},
		// synthetic is searched first.
		{"dup", Fixture{ID: "dup", Path: ManifestDir + "/synthetic/synthetic-dup.pdf", Name: "synthetic-dup.pdf"}},
	}
	for _, c := range ok {
		got, err := Find(fsys, c.id)
		if err != nil || got != c.want {
			t.Errorf("Find(%q) = %+v, %v; want %+v", c.id, got, err, c.want)
		}
	}
	bad := map[string]string{
		"missing":   "no such conversion fixture",
		"secret":    "no such conversion fixture",
		"rt-noise":  `can't generate a "noise-image-pdf"`,
		"rt-huge":   "isn't from 1 to",
		"escape":    "is outside",
		"elsewhere": "is outside",
		"abs":       "is outside",
		"wrong-id":  `its id is "other"`,
		"both":      "both file and generate",
		"neither":   "neither file nor generate",
		"bad-yaml":  "bad-yaml.yaml",
		"Pdf-A":     "bad conversion fixture ID",
		"../x":      "bad conversion fixture ID",
		"":          "bad conversion fixture ID",
	}
	for id, want := range bad {
		if _, err := Find(fsys, id); err == nil || !strings.Contains(err.Error(), want) {
			t.Errorf("Find(%q) = %v; want an error saying %q", id, err, want)
		}
	}
	if _, err := Find(fsys, "missing"); !errors.Is(err, ErrNotFound) {
		t.Errorf("Find(missing) = %v; want ErrNotFound", err)
	}
}

// TestRepositoryManifests resolves every manifest the conversion suite
// has, so a change there that the sink can't follow shows up here: each
// is found, or is a generated kind the sink doesn't make, and each file
// exists.
func TestRepositoryManifests(t *testing.T) {
	root := "../../../../.."
	if _, err := os.Stat(root + "/" + ManifestDir); err != nil {
		t.Skipf("no conversion suite at %s: %v", root, err)
	}
	fsys := os.DirFS(root)
	found := 0
	for _, tier := range tiers {
		entries, err := os.ReadDir(root + "/" + ManifestDir + "/" + tier)
		if err != nil {
			t.Fatal(err)
		}
		for _, e := range entries {
			id, ok := strings.CutSuffix(e.Name(), ".yaml")
			if !ok {
				continue
			}
			f, err := Find(fsys, id)
			if err != nil {
				if strings.Contains(err.Error(), "can't generate") {
					continue
				}
				t.Errorf("%s: %v", id, err)
				continue
			}
			found++
			if f.Path != "" {
				if st, err := os.Stat(root + "/" + f.Path); err != nil || !st.Mode().IsRegular() {
					t.Errorf("%s: its file %s: %v", id, f.Path, err)
				}
			}
		}
	}
	if found < 50 {
		t.Errorf("only %d manifests resolved; the suite has more", found)
	}
}
