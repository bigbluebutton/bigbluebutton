package jsonpatcher

import (
	"encoding/json"
	"fmt"
	"strings"
	"testing"

	evanphxjsonpatch "github.com/evanphx/json-patch"
)

// userItem keeps __typename as the *last* serialized field so the array bytes
// end with the literal `"__typename":"user"}]` substring the validator gates on
// (Go's map JSON marshal sorts keys alphabetically, which would put __typename first).
type userItem struct {
	UserId   string `json:"userId"`
	Name     string `json:"name"`
	Typename string `json:"__typename"`
}

// makeUsers builds a `__typename:user` array from id+name pairs.
func makeUsers(pairs ...string) []byte {
	if len(pairs)%2 != 0 {
		panic("makeUsers expects id,name pairs")
	}
	items := make([]userItem, 0, len(pairs)/2)
	for i := 0; i < len(pairs); i += 2 {
		items = append(items, userItem{UserId: pairs[i], Name: pairs[i+1], Typename: "user"})
	}
	b, _ := json.Marshal(items)
	return b
}

// applyAndExpect applies `patchBytes` to `original` and fails if the result
// doesn't equal `modified`. Returns the produced array bytes for further checks.
func applyAndExpect(t *testing.T, original, modified, patchBytes []byte) []byte {
	t.Helper()
	patch, err := evanphxjsonpatch.DecodePatch(patchBytes)
	if err != nil {
		t.Fatalf("DecodePatch failed: %v\npatch=%s", err, patchBytes)
	}
	got, err := patch.Apply(original)
	if err != nil {
		t.Fatalf("Apply failed: %v\npatch=%s", err, patchBytes)
	}
	if !evanphxjsonpatch.Equal(got, modified) {
		t.Fatalf("patch does not round-trip\noriginal=%s\nmodified=%s\npatch=%s\ngot     =%s",
			original, modified, patchBytes, got)
	}
	return got
}

// countOps decodes the patch into a slice of ops and tallies them by `op` name.
func countOps(t *testing.T, patchBytes []byte) map[string]int {
	t.Helper()
	var ops []map[string]interface{}
	if err := json.Unmarshal(patchBytes, &ops); err != nil {
		t.Fatalf("could not unmarshal patch: %v", err)
	}
	counts := map[string]int{}
	for _, op := range ops {
		if name, ok := op["op"].(string); ok {
			counts[name]++
		}
	}
	return counts
}

func TestPatch_Identical(t *testing.T) {
	orig := makeUsers("a", "A", "b", "B", "c", "C")
	mod := makeUsers("a", "A", "b", "B", "c", "C")

	ok, patch := ValidateIfShouldUseCustomJsonPatch(orig, mod, "userId")
	if !ok {
		t.Fatalf("expected validator to accept the array")
	}
	applyAndExpect(t, orig, mod, patch)

	if string(patch) != "[]" && string(patch) != "null" {
		t.Errorf("expected empty patch for identical arrays, got: %s", patch)
	}
}

func TestPatch_SingleFieldChange(t *testing.T) {
	orig := makeUsers("a", "A", "b", "B", "c", "C")
	mod := makeUsers("a", "A", "b", "B2", "c", "C")

	_, patch := ValidateIfShouldUseCustomJsonPatch(orig, mod, "userId")
	applyAndExpect(t, orig, mod, patch)

	counts := countOps(t, patch)
	if counts["replace"] != 1 || counts["move"]+counts["add"]+counts["remove"] != 0 {
		t.Errorf("expected exactly 1 replace, got %v\npatch=%s", counts, patch)
	}
}

func TestPatch_AddOneAtEnd(t *testing.T) {
	orig := makeUsers("a", "A", "b", "B")
	mod := makeUsers("a", "A", "b", "B", "c", "C")

	_, patch := ValidateIfShouldUseCustomJsonPatch(orig, mod, "userId")
	applyAndExpect(t, orig, mod, patch)

	counts := countOps(t, patch)
	if counts["add"] != 1 || counts["move"]+counts["remove"]+counts["replace"] != 0 {
		t.Errorf("expected exactly 1 add, got %v\npatch=%s", counts, patch)
	}
}

func TestPatch_AddOneInMiddle(t *testing.T) {
	orig := makeUsers("a", "A", "c", "C")
	mod := makeUsers("a", "A", "b", "B", "c", "C")

	_, patch := ValidateIfShouldUseCustomJsonPatch(orig, mod, "userId")
	applyAndExpect(t, orig, mod, patch)

	counts := countOps(t, patch)
	if counts["add"] != 1 || counts["move"]+counts["remove"]+counts["replace"] != 0 {
		t.Errorf("expected exactly 1 add, got %v\npatch=%s", counts, patch)
	}
}

func TestPatch_AddOneAtBeginning(t *testing.T) {
	orig := makeUsers("b", "B", "c", "C")
	mod := makeUsers("a", "A", "b", "B", "c", "C")

	_, patch := ValidateIfShouldUseCustomJsonPatch(orig, mod, "userId")
	applyAndExpect(t, orig, mod, patch)

	counts := countOps(t, patch)
	if counts["add"] != 1 || counts["move"]+counts["remove"]+counts["replace"] != 0 {
		t.Errorf("expected exactly 1 add, got %v\npatch=%s", counts, patch)
	}
}

func TestPatch_RemoveOneFromMiddle(t *testing.T) {
	orig := makeUsers("a", "A", "b", "B", "c", "C")
	mod := makeUsers("a", "A", "c", "C")

	_, patch := ValidateIfShouldUseCustomJsonPatch(orig, mod, "userId")
	applyAndExpect(t, orig, mod, patch)

	counts := countOps(t, patch)
	if counts["remove"] != 1 || counts["move"]+counts["add"]+counts["replace"] != 0 {
		t.Errorf("expected exactly 1 remove, got %v\npatch=%s", counts, patch)
	}
}

func TestPatch_RemoveMultipleFromVariousPositions(t *testing.T) {
	orig := makeUsers("a", "A", "b", "B", "c", "C", "d", "D", "e", "E")
	mod := makeUsers("b", "B", "d", "D")

	_, patch := ValidateIfShouldUseCustomJsonPatch(orig, mod, "userId")
	applyAndExpect(t, orig, mod, patch)

	counts := countOps(t, patch)
	if counts["remove"] != 3 || counts["move"]+counts["add"]+counts["replace"] != 0 {
		t.Errorf("expected 3 removes, got %v\npatch=%s", counts, patch)
	}
}

// Rotate-by-one is the regression case from the analysis: greedy approaches
// produced many redundant moves; LCS gets it in one.
func TestPatch_RotateByOne_IsSingleMove(t *testing.T) {
	orig := makeUsers("a", "A", "b", "B", "c", "C", "d", "D", "e", "E")
	mod := makeUsers("e", "E", "a", "A", "b", "B", "c", "C", "d", "D")

	_, patch := ValidateIfShouldUseCustomJsonPatch(orig, mod, "userId")
	applyAndExpect(t, orig, mod, patch)

	counts := countOps(t, patch)
	if counts["move"] != 1 || counts["add"]+counts["remove"]+counts["replace"] != 0 {
		t.Errorf("expected exactly 1 move for a single-element rotation, got %v\npatch=%s", counts, patch)
	}
}

func TestPatch_SwapTwoElements_IsSingleMove(t *testing.T) {
	// LCS of [a,b,c] and [b,a,c] is [a,c] or [b,c] (length 2); 1 move suffices.
	orig := makeUsers("a", "A", "b", "B", "c", "C")
	mod := makeUsers("b", "B", "a", "A", "c", "C")

	_, patch := ValidateIfShouldUseCustomJsonPatch(orig, mod, "userId")
	applyAndExpect(t, orig, mod, patch)

	counts := countOps(t, patch)
	if counts["move"] != 1 || counts["add"]+counts["remove"]+counts["replace"] != 0 {
		t.Errorf("expected exactly 1 move for a swap, got %v\npatch=%s", counts, patch)
	}
}

func TestPatch_ReverseEntireArray(t *testing.T) {
	// LCS of [a,b,c,d,e] and [e,d,c,b,a] has length 1, so 4 moves are optimal.
	orig := makeUsers("a", "A", "b", "B", "c", "C", "d", "D", "e", "E")
	mod := makeUsers("e", "E", "d", "D", "c", "C", "b", "B", "a", "A")

	_, patch := ValidateIfShouldUseCustomJsonPatch(orig, mod, "userId")
	applyAndExpect(t, orig, mod, patch)

	counts := countOps(t, patch)
	if counts["move"] > 4 {
		t.Errorf("expected at most 4 moves for full reverse, got %v\npatch=%s", counts, patch)
	}
	if counts["add"]+counts["remove"]+counts["replace"] != 0 {
		t.Errorf("expected only moves for a pure reorder, got %v\npatch=%s", counts, patch)
	}
}

func TestPatch_AnalysisCase_TwoMovesOptimal(t *testing.T) {
	// From the analysis: [A,B,C,D,E] -> [C,A,D,B,E]. LCS length 3 ⇒ 2 moves.
	orig := makeUsers("a", "A", "b", "B", "c", "C", "d", "D", "e", "E")
	mod := makeUsers("c", "C", "a", "A", "d", "D", "b", "B", "e", "E")

	_, patch := ValidateIfShouldUseCustomJsonPatch(orig, mod, "userId")
	applyAndExpect(t, orig, mod, patch)

	counts := countOps(t, patch)
	if counts["move"] != 2 || counts["add"]+counts["remove"]+counts["replace"] != 0 {
		t.Errorf("expected exactly 2 moves, got %v\npatch=%s", counts, patch)
	}
}

func TestPatch_AddRemoveReplaceMove_Combined(t *testing.T) {
	orig := makeUsers("a", "A", "b", "B", "c", "C", "d", "D")
	// remove b, change c, move d before a, add e at end
	mod := makeUsers("d", "D", "a", "A", "c", "C2", "e", "E")

	_, patch := ValidateIfShouldUseCustomJsonPatch(orig, mod, "userId")
	applyAndExpect(t, orig, mod, patch)

	counts := countOps(t, patch)
	if counts["replace"] < 1 {
		t.Errorf("expected at least 1 replace, got %v\npatch=%s", counts, patch)
	}
	if counts["remove"] != 1 {
		t.Errorf("expected exactly 1 remove, got %v\npatch=%s", counts, patch)
	}
	if counts["add"] != 1 {
		t.Errorf("expected exactly 1 add, got %v\npatch=%s", counts, patch)
	}
	if counts["move"] != 1 {
		t.Errorf("expected exactly 1 move, got %v\npatch=%s", counts, patch)
	}
}

func TestPatch_AllRemoved_FallbackPath(t *testing.T) {
	// modified has length 1; validator should reject and patch should not be produced.
	orig := makeUsers("a", "A", "b", "B", "c", "C")
	mod := makeUsers("a", "A")

	ok, _ := ValidateIfShouldUseCustomJsonPatch(orig, mod, "userId")
	if ok {
		t.Errorf("validator should reject when modified has <=1 items (current policy)")
	}
}

func TestPatch_NoSharedItems_AllAddRemove(t *testing.T) {
	orig := makeUsers("a", "A", "b", "B")
	mod := makeUsers("c", "C", "d", "D")

	_, patch := ValidateIfShouldUseCustomJsonPatch(orig, mod, "userId")
	applyAndExpect(t, orig, mod, patch)

	counts := countOps(t, patch)
	if counts["remove"] != 2 || counts["add"] != 2 {
		t.Errorf("expected 2 removes + 2 adds, got %v\npatch=%s", counts, patch)
	}
	if counts["move"]+counts["replace"] != 0 {
		t.Errorf("expected no moves or replaces when sets are disjoint, got %v\npatch=%s", counts, patch)
	}
}

// Pathological cases for the old greedy algorithm: rotations of various sizes
// should all collapse to 1 move under LCS.
func TestPatch_RotationsAreSingleMove(t *testing.T) {
	for n := 3; n <= 8; n++ {
		ids := make([]string, 0, n*2)
		for i := 0; i < n; i++ {
			ids = append(ids, fmt.Sprintf("u%d", i), fmt.Sprintf("Name%d", i))
		}
		orig := makeUsers(ids...)

		// Rotate left by one: move first to end.
		rotated := append([]string{}, ids[2:]...)
		rotated = append(rotated, ids[0], ids[1])
		mod := makeUsers(rotated...)

		_, patch := ValidateIfShouldUseCustomJsonPatch(orig, mod, "userId")
		applyAndExpect(t, orig, mod, patch)

		counts := countOps(t, patch)
		if counts["move"] != 1 || counts["add"]+counts["remove"]+counts["replace"] != 0 {
			t.Errorf("n=%d rotate-left: expected 1 move, got %v\npatch=%s", n, counts, patch)
		}
	}
}

func TestPatch_FieldChangeInMovedItem(t *testing.T) {
	// b moves AND its name changes; the replace should be at b's original
	// position and the move should reorder. Both must round-trip correctly.
	orig := makeUsers("a", "A", "b", "B", "c", "C")
	mod := makeUsers("b", "B2", "a", "A", "c", "C")

	_, patch := ValidateIfShouldUseCustomJsonPatch(orig, mod, "userId")
	applyAndExpect(t, orig, mod, patch)

	counts := countOps(t, patch)
	if counts["replace"] != 1 {
		t.Errorf("expected 1 replace, got %v\npatch=%s", counts, patch)
	}
	if counts["move"] != 1 {
		t.Errorf("expected 1 move, got %v\npatch=%s", counts, patch)
	}
}

func TestPatch_PatchIsSmallerThanFullPayload(t *testing.T) {
	// Build a 50-user list and only change one user's name. The patch must be
	// dramatically smaller than the modified payload (the whole point of patching).
	pairs := make([]string, 0, 100)
	for i := 0; i < 50; i++ {
		pairs = append(pairs, fmt.Sprintf("user-%02d", i), fmt.Sprintf("Name %02d", i))
	}
	orig := makeUsers(pairs...)
	pairs[1] = "Name 00 changed"
	mod := makeUsers(pairs...)

	_, patch := ValidateIfShouldUseCustomJsonPatch(orig, mod, "userId")
	applyAndExpect(t, orig, mod, patch)

	if len(patch) >= len(mod)/10 {
		t.Errorf("patch should be <10%% of modified size; patch=%d bytes, modified=%d bytes",
			len(patch), len(mod))
	}
}

// Ensure ValidateIfShouldUseCustomJsonPatch's __typename gating still works.
func TestValidator_RejectsWhenNoUserTypename(t *testing.T) {
	items := []map[string]interface{}{
		{"id": "a", "__typename": "meeting"},
		{"id": "b", "__typename": "meeting"},
	}
	orig, _ := json.Marshal(items)
	items[0]["x"] = 1
	mod, _ := json.Marshal(items)

	ok, patch := ValidateIfShouldUseCustomJsonPatch(orig, mod, "id")
	if ok {
		t.Errorf("expected validator to reject non-user payload; got patch=%s", patch)
	}
}

// LCS sanity tests (white-box; exercises the helper directly).
func TestLCS_BasicCases(t *testing.T) {
	cases := []struct {
		a, b []string
		want int
	}{
		{[]string{"a", "b", "c"}, []string{"a", "b", "c"}, 3},
		{[]string{"a", "b", "c"}, []string{"c", "b", "a"}, 1},
		{[]string{"a", "b", "c", "d", "e"}, []string{"c", "a", "d", "b", "e"}, 3},
		{[]string{"a", "b", "c", "d", "e"}, []string{"e", "a", "b", "c", "d"}, 4},
		{[]string{}, []string{"a"}, 0},
		{[]string{"a"}, []string{}, 0},
	}
	for i, tc := range cases {
		lcs := longestCommonSubsequence(tc.a, tc.b)
		if len(lcs) != tc.want {
			t.Errorf("case %d: LCS(%v, %v) length = %d, want %d (got %v)",
				i, tc.a, tc.b, len(lcs), tc.want, lcs)
		}
		// Verify it really is a subsequence of both.
		if !isSubsequence(lcs, tc.a) {
			t.Errorf("case %d: %v is not a subsequence of %v", i, lcs, tc.a)
		}
		if !isSubsequence(lcs, tc.b) {
			t.Errorf("case %d: %v is not a subsequence of %v", i, lcs, tc.b)
		}
	}
}

func isSubsequence(sub, full []string) bool {
	i := 0
	for _, x := range full {
		if i < len(sub) && sub[i] == x {
			i++
		}
	}
	return i == len(sub)
}

// Light sanity check that the patch is valid JSON of array form.
func TestPatch_IsJSONArray(t *testing.T) {
	orig := makeUsers("a", "A", "b", "B", "c", "C")
	mod := makeUsers("c", "C", "b", "B", "a", "A")

	_, patch := ValidateIfShouldUseCustomJsonPatch(orig, mod, "userId")
	if !strings.HasPrefix(string(patch), "[") {
		t.Errorf("patch should be a JSON array, got: %s", patch)
	}
}
