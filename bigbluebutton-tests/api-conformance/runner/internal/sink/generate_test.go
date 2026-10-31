package sink

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"testing"
)

// checkPDF checks what a reader relies on: the header, startxref pointing
// at the xref table, and every xref entry pointing at its object.
func checkPDF(b []byte) error {
	if !bytes.HasPrefix(b, []byte("%PDF-1.4\n")) {
		return fmt.Errorf("no header")
	}
	m := regexp.MustCompile(`startxref\n(\d+)\n%%EOF\n*$`).FindSubmatch(b)
	if m == nil {
		return fmt.Errorf("no startxref and %%%%EOF at the end")
	}
	xref, _ := strconv.Atoi(string(m[1]))
	if !bytes.HasPrefix(b[xref:], []byte("xref\n0 5\n0000000000 65535 f \n")) {
		return fmt.Errorf("startxref %d doesn't point at the xref table", xref)
	}
	entries := b[xref+len("xref\n0 5\n0000000000 65535 f \n"):]
	for i := 1; i <= 4; i++ {
		e := string(entries[(i-1)*20 : i*20])
		off, err := strconv.Atoi(e[:10])
		if err != nil || !strings.HasSuffix(e, " 00000 n \n") {
			return fmt.Errorf("xref entry %d is %q", i, e)
		}
		if want := fmt.Sprintf("%d 0 obj\n", i); !bytes.HasPrefix(b[off:], []byte(want)) {
			return fmt.Errorf("xref entry %d points at %q", i, b[off:min(off+10, len(b))])
		}
	}
	return nil
}

func TestGeneratePDF(t *testing.T) {
	least := len(pdfWithPadding(0))
	sizes := []int{least, least + 1, least + 2, least + 77, least + 78}
	// Around the sizes where the xref offset grows a digit.
	for _, edge := range []int{1000, 10000, 100000, 1000000} {
		for d := -6; d <= 6; d++ {
			sizes = append(sizes, edge+d)
		}
	}
	for _, n := range sizes {
		b, err := generatePDF(n)
		if err != nil {
			t.Errorf("%d: %v", n, err)
			continue
		}
		if len(b) != n {
			t.Errorf("%d: got %d bytes", n, len(b))
		}
		if err := checkPDF(b); err != nil {
			t.Errorf("%d: %v", n, err)
		}
	}
	if _, err := generatePDF(least - 1); err == nil {
		t.Errorf("a %d-byte PDF", least-1)
	}
}

// pdfinfo, when installed, reads a generated PDF over 30 MB, the size of
// the files that exceed bbb-web's default maxFileSizeUpload.
func TestGeneratedPDFReads(t *testing.T) {
	if _, err := exec.LookPath("pdfinfo"); err != nil {
		t.Skip("pdfinfo isn't installed")
	}
	b, err := generatePDF(31_000_000)
	if err != nil {
		t.Fatal(err)
	}
	f := filepath.Join(t.TempDir(), "big.pdf")
	if err := os.WriteFile(f, b, 0o644); err != nil {
		t.Fatal(err)
	}
	out, err := exec.Command("pdfinfo", f).CombinedOutput()
	if err != nil || !regexp.MustCompile(`(?m)^Pages:\s+1$`).Match(out) || !bytes.Contains(out, []byte("31000000 bytes")) {
		t.Errorf("pdfinfo: %v\n%s", err, out)
	}
}

func TestGenerate(t *testing.T) {
	for _, n := range []int{14, 15, 1000} {
		b, err := generate("a.json", strconv.Itoa(n))
		if err != nil || len(b) != n || !json.Valid(b) {
			t.Errorf("json %d: %d bytes, valid %v, %v", n, len(b), json.Valid(b), err)
		}
	}
	for _, n := range []int{0, 1, 76, 77, 78, 1000} {
		b, err := generate("notes.md", strconv.Itoa(n))
		if err != nil || len(b) != n || bytes.ContainsAny(b, "\x00\r") {
			t.Errorf("text %d: %d bytes, %v", n, len(b), err)
		}
		for _, line := range bytes.Split(b, []byte("\n")) {
			if len(line) > lineLen-1 {
				t.Errorf("text %d: a %d-byte line", n, len(line))
			}
		}
	}
	if b, err := generate("UPPER.PDF", "2000"); err != nil || checkPDF(b) != nil {
		t.Errorf("an upper-case extension: %v", err)
	}
	for _, size := range []string{"", "x", "-1", strconv.Itoa(MaxGenerated + 1)} {
		if _, err := generate("a.bin", size); err == nil {
			t.Errorf("_size %q was accepted", size)
		}
	}
	if _, err := generate("a.json", "13"); err == nil {
		t.Error("a 13-byte JSON file")
	}
}
