package jsonpatcher

import (
	"bytes"
	"encoding/json"
	"fmt"
	"sort"

	evanphxjsonpatch "github.com/evanphx/json-patch"
	log "github.com/sirupsen/logrus"
	"github.com/wI2L/jsondiff"
)

// jsonPatchOp is a unified representation for RFC 6902 ops so replaces, removes,
// moves, and adds can live in a single slice and be marshaled in one pass.
type jsonPatchOp struct {
	Op    string      `json:"op"`
	Path  string      `json:"path"`
	From  string      `json:"from,omitempty"`
	Value interface{} `json:"value,omitempty"`
}

func ValidateIfShouldUseCustomJsonPatch(original []byte, modified []byte) (bool, []byte) {
	idFieldName := ""
	if bytes.HasSuffix(modified, []byte("\"__typename\":\"user\"}]")) {
		idFieldName = "userId"
	} else if bytes.HasSuffix(modified, []byte("\"__typename\":\"user_camera\"}]")) {
		idFieldName = "streamId"
	} else {
		return false, nil
	}

	originalMap := GetMapFromByte(original)
	if originalMap == nil || len(originalMap) <= 1 {
		return false, nil
	}
	if _, ok := originalMap[0][idFieldName].(string); !ok {
		return false, nil
	}
	if hasDuplicatedId(originalMap, idFieldName) {
		return false, nil
	}

	modifiedMap := GetMapFromByte(modified)
	if modifiedMap == nil || len(modifiedMap) <= 1 {
		return false, nil
	}
	if _, ok := modifiedMap[0][idFieldName].(string); !ok {
		return false, nil
	}
	if hasDuplicatedId(modifiedMap, idFieldName) {
		return false, nil
	}

	return true, CreateJsonPatchFromMaps(originalMap, modifiedMap, modified, idFieldName)
}

func hasDuplicatedId(items []map[string]interface{}, idFieldName string) bool {
	seen := make(map[string]struct{}, len(items))
	for _, item := range items {
		if id, ok := item[idFieldName].(string); ok {
			if _, dup := seen[id]; dup {
				return true
			}
			seen[id] = struct{}{}
		}
	}
	return false
}

func CreateJsonPatch(original []byte, modified []byte, idFieldName string) []byte {
	originalMap := GetMapFromByte(original)
	modifiedMap := GetMapFromByte(modified)
	return CreateJsonPatchFromMaps(originalMap, modifiedMap, modified, idFieldName)
}

// CreateJsonPatchFromMaps builds a minimal RFC 6902 patch from `original` to `modified`,
// assuming both are arrays of objects keyed by `idFieldName` and that IDs are unique
// within each array. Falls back to a whole-array jsondiff (with LCS) if the produced
// patch does not round-trip to `modifiedJson`.
func CreateJsonPatchFromMaps(original []map[string]interface{}, modified []map[string]interface{}, modifiedJson []byte, idFieldName string) []byte {
	if ops, ok := buildPatchOps(original, modified, idFieldName); ok {
		patchBytes, err := json.Marshal(ops)
		if err == nil {
			if applied, applyErr := applyPatchToMaps(original, patchBytes); applyErr == nil && evanphxjsonpatch.Equal(applied, modifiedJson) {
				return patchBytes
			}
		}
		log.Error("Custom patch did not round-trip to target, falling back to jsondiff")
	}

	return fallbackPatchUsingJsondiff(original, modified)
}

// buildPatchOps produces ops in four phases: replaces (per shared item, at original
// positions) → removes (descending) → moves (LCS-optimal) → adds (ascending). This
// ordering keeps every op's indices valid against the state produced by the prior ops.
func buildPatchOps(original, modified []map[string]interface{}, idFieldName string) ([]jsonPatchOp, bool) {
	origIDs := make([]string, len(original))
	origByID := make(map[string]map[string]interface{}, len(original))
	origPosByID := make(map[string]int, len(original))
	for i, item := range original {
		id, ok := item[idFieldName].(string)
		if !ok {
			return nil, false
		}
		origIDs[i] = id
		origByID[id] = item
		origPosByID[id] = i
	}

	modIDs := make([]string, len(modified))
	modByID := make(map[string]map[string]interface{}, len(modified))
	for i, item := range modified {
		id, ok := item[idFieldName].(string)
		if !ok {
			return nil, false
		}
		modIDs[i] = id
		modByID[id] = item
	}

	shared := make(map[string]struct{}, len(origIDs))
	for _, id := range origIDs {
		if _, exists := modByID[id]; exists {
			shared[id] = struct{}{}
		}
	}

	ops := make([]jsonPatchOp, 0, len(original)+len(modified))

	// Phase 1: per-item replaces for shared IDs, at original positions.
	// Iterating origIDs (instead of the shared map) keeps op order deterministic.
	for _, id := range origIDs {
		if _, kept := shared[id]; !kept {
			continue
		}
		itemOps, err := diffItem(origByID[id], modByID[id], origPosByID[id])
		if err != nil {
			return nil, false
		}
		ops = append(ops, itemOps...)
	}

	// Phase 2: removes for items in original not in modified, descending position.
	removePositions := make([]int, 0)
	for _, id := range origIDs {
		if _, kept := shared[id]; !kept {
			removePositions = append(removePositions, origPosByID[id])
		}
	}
	sort.Sort(sort.Reverse(sort.IntSlice(removePositions)))
	for _, pos := range removePositions {
		ops = append(ops, jsonPatchOp{Op: "remove", Path: fmt.Sprintf("/%d", pos)})
	}

	// Phase 3: LCS-optimal moves to reorder shared items.
	// Working state at the start of this phase is `original minus removed items`
	// — i.e., shared items in their original relative order.
	sharedInOrigOrder := make([]string, 0, len(shared))
	for _, id := range origIDs {
		if _, kept := shared[id]; kept {
			sharedInOrigOrder = append(sharedInOrigOrder, id)
		}
	}
	sharedInModOrder := make([]string, 0, len(shared))
	for _, id := range modIDs {
		if _, kept := shared[id]; kept {
			sharedInModOrder = append(sharedInModOrder, id)
		}
	}
	ops = append(ops, buildMoveOpsLCS(sharedInOrigOrder, sharedInModOrder)...)

	// Phase 4: adds for items in modified not in original, ascending target position.
	// After phase 3 the array equals `sharedInModOrder`; inserting at modified-index
	// positions in ascending order produces the final array.
	for i, id := range modIDs {
		if _, kept := shared[id]; kept {
			continue
		}
		ops = append(ops, jsonPatchOp{
			Op:    "add",
			Path:  fmt.Sprintf("/%d", i),
			Value: modByID[id],
		})
	}

	return ops, true
}

func diffItem(original, modified map[string]interface{}, originalPos int) ([]jsonPatchOp, error) {
	origBytes, err := json.Marshal(original)
	if err != nil {
		return nil, err
	}
	modBytes, err := json.Marshal(modified)
	if err != nil {
		return nil, err
	}
	diffs, err := jsondiff.CompareJSON(origBytes, modBytes)
	if err != nil {
		return nil, err
	}
	prefix := fmt.Sprintf("/%d", originalPos)
	out := make([]jsonPatchOp, len(diffs))
	for i, d := range diffs {
		out[i] = jsonPatchOp{
			Op:    d.Type,
			Path:  prefix + d.Path,
			Value: d.Value,
		}
	}
	return out, nil
}

// buildMoveOpsLCS computes the minimum-move sequence to transform `fromOrder`
// into `toOrder` (which must be permutations of the same set). The number of
// moves equals len - len(LCS(fromOrder, toOrder)).
//
// Strategy: items in some LCS stay put as anchors; every other item gets one
// move op. Walking `toOrder` left to right and emitting moves immediately works
// because once position i is correct, subsequent moves only touch indices > i
// (LCS anchors keep their relative order, so the not-yet-placed item we need
// for position i+1 still lies at some index >= i+1).
func buildMoveOpsLCS(fromOrder, toOrder []string) []jsonPatchOp {
	if len(fromOrder) == 0 {
		return nil
	}

	lcs := longestCommonSubsequence(fromOrder, toOrder)
	anchor := make(map[string]struct{}, len(lcs))
	for _, id := range lcs {
		anchor[id] = struct{}{}
	}

	working := append([]string(nil), fromOrder...)
	ops := make([]jsonPatchOp, 0)
	for i, id := range toOrder {
		if _, isAnchor := anchor[id]; isAnchor {
			continue
		}
		k := indexOfString(working, id)
		if k == -1 || k == i {
			continue
		}
		ops = append(ops, jsonPatchOp{
			Op:   "move",
			From: fmt.Sprintf("/%d", k),
			Path: fmt.Sprintf("/%d", i),
		})
		// Mirror JSON Patch move semantics: remove at k, insert at i (post-removal index).
		elem := working[k]
		working = append(working[:k], working[k+1:]...)
		if i >= len(working) {
			working = append(working, elem)
		} else {
			working = append(working[:i], append([]string{elem}, working[i:]...)...)
		}
	}
	return ops
}

func longestCommonSubsequence(a, b []string) []string {
	m, n := len(a), len(b)
	if m == 0 || n == 0 {
		return nil
	}
	dp := make([][]int, m+1)
	for i := range dp {
		dp[i] = make([]int, n+1)
	}
	for i := 1; i <= m; i++ {
		for j := 1; j <= n; j++ {
			if a[i-1] == b[j-1] {
				dp[i][j] = dp[i-1][j-1] + 1
			} else if dp[i-1][j] >= dp[i][j-1] {
				dp[i][j] = dp[i-1][j]
			} else {
				dp[i][j] = dp[i][j-1]
			}
		}
	}
	lcs := make([]string, 0, dp[m][n])
	i, j := m, n
	for i > 0 && j > 0 {
		if a[i-1] == b[j-1] {
			lcs = append(lcs, a[i-1])
			i--
			j--
		} else if dp[i-1][j] >= dp[i][j-1] {
			i--
		} else {
			j--
		}
	}
	for l, r := 0, len(lcs)-1; l < r; l, r = l+1, r-1 {
		lcs[l], lcs[r] = lcs[r], lcs[l]
	}
	return lcs
}

func indexOfString(xs []string, target string) int {
	for i, x := range xs {
		if x == target {
			return i
		}
	}
	return -1
}

func applyPatchToMaps(original []map[string]interface{}, patchBytes []byte) ([]byte, error) {
	originalBytes, err := json.Marshal(original)
	if err != nil {
		return nil, err
	}
	patch, err := evanphxjsonpatch.DecodePatch(patchBytes)
	if err != nil {
		return nil, err
	}
	return patch.Apply(originalBytes)
}

// fallbackPatchUsingJsondiff produces a whole-array diff via jsondiff with LCS,
// used when the per-id custom diff fails to round-trip. LCS keeps the patch
// compact for array reorderings and partial changes.
func fallbackPatchUsingJsondiff(original []map[string]interface{}, modified []map[string]interface{}) []byte {
	oldListJson, _ := json.Marshal(original)
	newListJson, _ := json.Marshal(modified)

	patch, err := jsondiff.CompareJSON(oldListJson, newListJson, jsondiff.LCS())
	if err != nil {
		log.Errorf("jsondiff fallback failed: %v", err)
		return nil
	}
	patchJson, err := json.Marshal(patch)
	if err != nil {
		log.Errorf("jsondiff fallback marshal failed: %v", err)
		return nil
	}
	return patchJson
}

func GetMapFromByte(jsonAsByte []byte) []map[string]interface{} {
	var jsonAsMap []map[string]interface{}
	if len(jsonAsByte) > 0 {
		err := json.Unmarshal(jsonAsByte, &jsonAsMap)
		if err != nil {
			log.Debug(jsonAsByte)
			log.Error("Error Unmarshal GetMapFromByte:", err)
			return nil
		}
	}

	return jsonAsMap
}

func PrintMap(it []map[string]interface{}, name string) {
	fmt.Printf("%s:\n", name)
	a, _ := json.Marshal(it)
	PrintJson(a, name)
}

func PrintJson(it []byte, name string) {
	fmt.Printf("%s:\n", name)
	fmt.Println(string(it))
}
