package sink

import (
	"bytes"
	"fmt"
	"io"
	"path"
	"strconv"
	"strings"
)

// MaxGenerated is the largest file the sink generates.
const MaxGenerated = 64 << 20

// lineLen is the length of the lines generated text and padding are cut
// into, newline included.
const lineLen = 77

// generate makes the file a fixtures/generated/<name> request asks for:
// size bytes whose kind follows the name's extension. A .pdf is a valid
// one-page PDF and a .json a valid JSON document; anything else is lines
// of text. The file is computed as it is read, so a large one never sits
// in memory, however many requests read it at once.
func generate(name, size string) (io.ReadSeeker, error) {
	if size == "" {
		return nil, fmt.Errorf("a generated file needs _size, its length in bytes")
	}
	n, err := strconv.Atoi(size)
	if err != nil || n < 0 || n > MaxGenerated {
		return nil, fmt.Errorf("bad _size %q: a number of bytes up to %d", size, MaxGenerated)
	}
	var ps parts
	switch strings.ToLower(path.Ext(name)) {
	case ".pdf":
		ps, err = generatePDF(n)
	case ".json":
		ps, err = generateJSON(n)
	default:
		ps = parts{filler(n)}
	}
	if err != nil {
		return nil, err
	}
	return io.NewSectionReader(ps, 0, ps.size()), nil
}

// part is a stretch of a generated file: bytes given, or a unit repeated.
type part struct {
	n    int64
	lit  []byte // the bytes, when not nil
	unit []byte // else byte i is unit[i%len(unit)]
}

func literal(b []byte) part { return part{n: int64(len(b)), lit: b} }

// periodic is n bytes of unit repeated, copied in runs of at least 4 KiB.
func periodic(unit []byte, n int) part {
	k := max(1, 4096/len(unit))
	return part{n: int64(n), unit: bytes.Repeat(unit, k)}
}

// parts is a generated file, read through ReadAt.
type parts []part

func (ps parts) size() int64 {
	var n int64
	for _, p := range ps {
		n += p.n
	}
	return n
}

func (ps parts) ReadAt(b []byte, off int64) (int, error) {
	if off < 0 {
		return 0, fmt.Errorf("negative offset %d", off)
	}
	n := 0
	for _, p := range ps {
		if n == len(b) {
			return n, nil
		}
		if off >= p.n {
			off -= p.n
			continue
		}
		if p.lit != nil {
			c := copy(b[n:], p.lit[off:])
			n, off = n+c, off+int64(c)
		} else {
			u := int64(len(p.unit))
			for off < p.n && n < len(b) {
				run := min(p.n-off, u-off%u, int64(len(b)-n))
				c := copy(b[n:n+int(run)], p.unit[off%u:])
				n, off = n+c, off+int64(c)
			}
		}
		off = 0
	}
	if n == len(b) {
		return n, nil
	}
	return n, io.EOF
}

// filler is n bytes of text: lines of x.
func filler(n int) part {
	return periodic(append(bytes.Repeat([]byte{'x'}, lineLen-1), '\n'), n)
}

// repeat is n copies of c.
func repeat(c byte, n int) part { return periodic([]byte{c}, n) }

func generateJSON(n int) (parts, error) {
	const head, tail = `{"padding":"`, `"}`
	if n < len(head)+len(tail) {
		return nil, fmt.Errorf("a JSON file needs at least %d bytes", len(head)+len(tail))
	}
	return parts{literal([]byte(head)), repeat('x', n-len(head)-len(tail)), literal([]byte(tail))}, nil
}

// pdfHead is a PDF's header, with the binary comment that marks it as
// holding binary data.
const pdfHead = "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"

// generatePDF returns a one-page PDF of exactly n bytes. The padding is
// comment lines after the header, which shift the objects but nothing
// else; the bytes the padding can't place, at most a few, are newlines
// after %%EOF, where readers look for it.
func generatePDF(n int) (parts, error) {
	least := len(pdfHead) + len(pdfBody(len(pdfHead)))
	if n < least {
		return nil, fmt.Errorf("a PDF needs at least %d bytes", least)
	}
	pad := n - least
	body := pdfBody(len(pdfHead) + pad)
	for len(pdfHead)+pad+len(body) > n { // the xref offset grew a digit or two
		pad -= len(pdfHead) + pad + len(body) - n
		body = pdfBody(len(pdfHead) + pad)
	}
	rest := n - len(pdfHead) - pad - len(body)
	return append(append(parts{literal([]byte(pdfHead))}, padding(pad)...), literal(body), repeat('\n', rest)), nil
}

// padding is pad bytes of PDF comment lines: %, x up to the line's length,
// a newline. A last line of one byte is the newline alone.
func padding(pad int) parts {
	line := func(n int) []byte {
		if n == 1 {
			return []byte{'\n'}
		}
		return append(append([]byte{'%'}, bytes.Repeat([]byte{'x'}, n-2)...), '\n')
	}
	full, last := pad/lineLen, pad%lineLen
	ps := parts{periodic(line(lineLen), full*lineLen)}
	if last > 0 {
		ps = append(ps, literal(line(last)))
	}
	return ps
}

// pdfBody is a PDF's objects, cross-reference table and trailer, for
// objects starting at offset base: a blank US Letter page with a grey
// rectangle on it.
func pdfBody(base int) []byte {
	var b bytes.Buffer
	content := "0.9 g 72 72 468 648 re f\n"
	objects := []string{
		"<< /Type /Catalog /Pages 2 0 R >>",
		"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
		"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> /Contents 4 0 R >>",
		fmt.Sprintf("<< /Length %d >>\nstream\n%sendstream", len(content), content),
	}
	offsets := make([]int, len(objects))
	for i, o := range objects {
		offsets[i] = base + b.Len()
		fmt.Fprintf(&b, "%d 0 obj\n%s\nendobj\n", i+1, o)
	}
	xref := base + b.Len()
	fmt.Fprintf(&b, "xref\n0 %d\n0000000000 65535 f \n", len(objects)+1)
	for _, off := range offsets {
		fmt.Fprintf(&b, "%010d 00000 n \n", off)
	}
	fmt.Fprintf(&b, "trailer\n<< /Size %d /Root 1 0 R >>\nstartxref\n%d\n%%%%EOF\n", len(objects)+1, xref)
	return b.Bytes()
}
