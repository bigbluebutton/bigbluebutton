package golden

import "strings"

// Lines diffs two line sequences by their longest common subsequence and
// returns the changed lines, "-" for a and "+" for b, in order. It returns
// nil when they are equal.
func Lines(a, b []string) []string {
	// Only the middle that differs goes through the quadratic table.
	for len(a) > 0 && len(b) > 0 && a[0] == b[0] {
		a, b = a[1:], b[1:]
	}
	for len(a) > 0 && len(b) > 0 && a[len(a)-1] == b[len(b)-1] {
		a, b = a[:len(a)-1], b[:len(b)-1]
	}
	n, m := len(a), len(b)
	lcs := make([][]int, n+1)
	for i := range lcs {
		lcs[i] = make([]int, m+1)
	}
	for i := n - 1; i >= 0; i-- {
		for j := m - 1; j >= 0; j-- {
			if a[i] == b[j] {
				lcs[i][j] = lcs[i+1][j+1] + 1
			} else {
				lcs[i][j] = max(lcs[i+1][j], lcs[i][j+1])
			}
		}
	}
	var out []string
	i, j := 0, 0
	for i < n || j < m {
		switch {
		case i < n && j < m && a[i] == b[j]:
			i++
			j++
		case i < n && (j == m || lcs[i+1][j] >= lcs[i][j+1]):
			out = append(out, "- "+a[i])
			i++
		default:
			out = append(out, "+ "+b[j])
			j++
		}
	}
	return out
}

// selectLines keeps a document's lines that lie at or under one of the
// paths, in order. A path with no line gets "<path> (absent)", so that
// what a selected part lacks is recorded too.
func selectLines(lines, paths []string) []string {
	var out []string
	found := make([]bool, len(paths))
	for _, l := range lines {
		p, _, _ := strings.Cut(l, " ")
		keep := false
		for i, sel := range paths {
			if p == sel || strings.HasPrefix(p, sel+".") || strings.HasPrefix(p, sel+"[") {
				found[i], keep = true, true
			}
		}
		if keep {
			out = append(out, l)
		}
	}
	for i, sel := range paths {
		if !found[i] {
			out = append(out, sel+" (absent)")
		}
	}
	return out
}
