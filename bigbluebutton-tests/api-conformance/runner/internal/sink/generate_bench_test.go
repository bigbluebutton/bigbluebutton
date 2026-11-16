package sink

import (
	"io"
	"strconv"
	"testing"
)

func BenchmarkGenerate64MiB(b *testing.B) {
	for _, name := range []string{"a.pdf", "a.json", "a.txt"} {
		b.Run(name, func(b *testing.B) {
			for b.Loop() {
				r, err := generate(name, strconv.Itoa(MaxGenerated))
				if err != nil {
					b.Fatal(err)
				}
				if _, err := io.Copy(io.Discard, r); err != nil {
					b.Fatal(err)
				}
			}
		})
	}
}
