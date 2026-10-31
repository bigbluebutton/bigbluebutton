package sink

import (
	"bytes"
	"fmt"
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
// of text.
func generate(name, size string) ([]byte, error) {
	if size == "" {
		return nil, fmt.Errorf("a generated file needs _size, its length in bytes")
	}
	n, err := strconv.Atoi(size)
	if err != nil || n < 0 || n > MaxGenerated {
		return nil, fmt.Errorf("bad _size %q: a number of bytes up to %d", size, MaxGenerated)
	}
	switch strings.ToLower(path.Ext(name)) {
	case ".pdf":
		return generatePDF(n)
	case ".json":
		return generateJSON(n)
	}
	return filler(n), nil
}

// filler is n bytes of text: lines of x.
func filler(n int) []byte {
	b := bytes.Repeat([]byte{'x'}, n)
	for i := lineLen - 1; i < n; i += lineLen {
		b[i] = '\n'
	}
	return b
}

func generateJSON(n int) ([]byte, error) {
	const head, tail = `{"padding":"`, `"}`
	if n < len(head)+len(tail) {
		return nil, fmt.Errorf("a JSON file needs at least %d bytes", len(head)+len(tail))
	}
	return []byte(head + strings.Repeat("x", n-len(head)-len(tail)) + tail), nil
}

// generatePDF returns a one-page PDF of exactly n bytes. The padding is
// comment lines after the header, which shift the objects but nothing
// else; the bytes the padding can't place, at most a few, are newlines
// after %%EOF, where readers look for it.
func generatePDF(n int) ([]byte, error) {
	least := len(pdfWithPadding(0))
	if n < least {
		return nil, fmt.Errorf("a PDF needs at least %d bytes", least)
	}
	pad := n - least
	b := pdfWithPadding(pad)
	for len(b) > n { // the xref offset grew a digit or two
		pad -= len(b) - n
		b = pdfWithPadding(pad)
	}
	return append(b, bytes.Repeat([]byte{'\n'}, n-len(b))...), nil
}

// pdfWithPadding builds the PDF with pad bytes of comments after its
// header: a blank US Letter page with a grey rectangle on it.
func pdfWithPadding(pad int) []byte {
	var b bytes.Buffer
	b.WriteString("%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
	for pad > 0 {
		line := min(pad, lineLen)
		if line == 1 {
			b.WriteByte('\n')
		} else {
			b.WriteByte('%')
			b.Write(bytes.Repeat([]byte{'x'}, line-2))
			b.WriteByte('\n')
		}
		pad -= line
	}
	content := "0.9 g 72 72 468 648 re f\n"
	objects := []string{
		"<< /Type /Catalog /Pages 2 0 R >>",
		"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
		"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> /Contents 4 0 R >>",
		fmt.Sprintf("<< /Length %d >>\nstream\n%sendstream", len(content), content),
	}
	offsets := make([]int, len(objects))
	for i, o := range objects {
		offsets[i] = b.Len()
		fmt.Fprintf(&b, "%d 0 obj\n%s\nendobj\n", i+1, o)
	}
	xref := b.Len()
	fmt.Fprintf(&b, "xref\n0 %d\n0000000000 65535 f \n", len(objects)+1)
	for _, off := range offsets {
		fmt.Fprintf(&b, "%010d 00000 n \n", off)
	}
	fmt.Fprintf(&b, "trailer\n<< /Size %d /Root 1 0 R >>\nstartxref\n%d\n%%%%EOF\n", len(objects)+1, xref)
	return b.Bytes()
}
