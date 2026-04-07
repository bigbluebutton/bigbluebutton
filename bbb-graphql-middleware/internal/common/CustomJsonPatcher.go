package common

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strings"

	evanphxjsonpatch "github.com/evanphx/json-patch"
	"github.com/mattbaird/jsonpatch"
	log "github.com/sirupsen/logrus"
)

func ValidateIfShouldUseCustomJsonPatch(original []byte, modified []byte, idFieldName string) (bool, []byte) {
	// Temporarily use CustomPatch only for UserList (testing feature)
	if !bytes.Contains(modified, []byte("\"__typename\":\"user\"}]")) {
		return false, nil
	}

	// Test Original Data
	originalMap := GetMapFromByte(original)
	if originalMap == nil {
		return false, nil
	}

	if len(originalMap) <= 1 {
		return false, nil
	}

	firstItem := originalMap[0]
	if _, existsIdField := firstItem[idFieldName].(string); !existsIdField {
		return false, nil
	}

	if hasDuplicatedId(originalMap, idFieldName) {
		return false, nil
	}

	// Test Modified Data
	modifiedMap := GetMapFromByte(modified)
	if modifiedMap == nil {
		return false, nil
	}

	if len(modifiedMap) <= 1 {
		return false, nil
	}

	firstItem = modifiedMap[0]
	if _, existsIdField := firstItem[idFieldName].(string); !existsIdField {
		return false, nil
	}

	if hasDuplicatedId(modifiedMap, idFieldName) {
		return false, nil
	}

	return true, CreateJsonPatchFromMaps(originalMap, modifiedMap, modified, idFieldName)
}

func hasDuplicatedId(items []map[string]interface{}, idFieldName string) bool {
	seen := make(map[string]bool)
	for _, item := range items {
		if idValue, existsIdField := item[idFieldName].(string); existsIdField {
			if _, exists := seen[idValue]; exists {
				return true
			}
			seen[idValue] = true
		}
	}
	return false
}

func CreateJsonPatch(original []byte, modified []byte, idFieldName string) []byte {
	originalMap := GetMapFromByte(original)
	modifiedMap := GetMapFromByte(modified)

	return CreateJsonPatchFromMaps(originalMap, modifiedMap, modified, idFieldName)
}

func CreateJsonPatchFromMaps(original []map[string]interface{}, modified []map[string]interface{}, modifiedJson []byte, idFieldName string) []byte {
	// CREATE PATCHES FOR OPERATION "REPLACE"
	replacesPatches, originalWithReplaces := CreateReplacePatches(original, modified, idFieldName)

	// CREATE PATCHES FOR OPERATION "ADD" and "REMOVE"
	addRemovePatches := CreateAddRemovePatches(originalWithReplaces, modified, idFieldName)

	mergedPatch := append(replacesPatches, addRemovePatches...)
	mergedPatchJson, _ := json.Marshal(mergedPatch)

	originalWithPatches, _ := ApplyPatch(original, mergedPatchJson)
	if evanphxjsonpatch.Equal(originalWithPatches, modifiedJson) {
		return mergedPatchJson
	}

	// CREATE PATCHES FOR OPERATION "MOVE"
	movesPatches, _ := CreateMovePatches(originalWithPatches, modifiedJson, idFieldName)
	mergedPatchJson, _ = MergePatches(mergedPatchJson, movesPatches)

	originalWithPatches, _ = ApplyPatch(original, mergedPatchJson)
	if evanphxjsonpatch.Equal(originalWithPatches, modifiedJson) {
		return mergedPatchJson
	} else {
		log.Error("It was not able to recreate the target data using the patch: ", string(mergedPatchJson))
		alternativePatch := PatchUsingMattbairdJsonpatch(original, modified)
		alternativePatchJson, _ := json.Marshal(alternativePatch)
		return alternativePatchJson
	}
}

func CreateReplacePatches(original []map[string]interface{}, modified []map[string]interface{}, idFieldName string) ([]jsonpatch.JsonPatchOperation, []map[string]interface{}) {
	var replacesListAsMap []map[string]interface{}

	for _, originalItem := range original {
		if id, existsIdField := originalItem[idFieldName].(string); existsIdField {
			itemInNewList := findItemWithId(modified, id, originalItem, idFieldName)

			replacesListAsMap = append(replacesListAsMap, itemInNewList)
		}
	}

	return PatchUsingMattbairdJsonpatch(original, replacesListAsMap), replacesListAsMap
}

func CreateAddRemovePatches(original []map[string]interface{}, modified []map[string]interface{}, idFieldName string) []jsonpatch.JsonPatchOperation {
	hasSameIDs := false
	addedFakeItem := false
	if len(original) == len(modified) {
		hasSameIDs = true
		for i := range original {
			if original[i][idFieldName] != modified[i][idFieldName] {
				hasSameIDs = false
				break
			}
		}

		if !hasSameIDs {
			modified = append(modified, modified[len(modified)-1])
			addedFakeItem = true
		}
	}
	patch := PatchUsingMattbairdJsonpatch(original, modified)

	if addedFakeItem {
		patch = patch[0 : len(patch)-1]
	}

	return patch
}

func findAndApplyMove(arr1, arr2 []map[string]interface{}, patches []map[string]interface{}, idFieldName string) ([]map[string]interface{}, []map[string]interface{}, bool) {
	for i, item1 := range arr1 {
		for j, item2 := range arr2 {
			if item1[idFieldName] == item2[idFieldName] && i != j {
				patch := map[string]interface{}{
					"op":   "move",
					"from": fmt.Sprintf("/%d", i),
					"path": fmt.Sprintf("/%d", j),
				}
				patches = append(patches, patch)

				element := arr1[i]
				arr1 = append(arr1[:i], arr1[i+1:]...)
				if j >= len(arr1) {
					arr1 = append(arr1, element)
				} else {
					arr1 = append(arr1[:j], append([]map[string]interface{}{element}, arr1[j:]...)...)
				}
				return arr1, patches, true
			}
		}
	}
	return arr1, patches, false
}

func findAndApplyMoveFromArr2(arr1, arr2 []map[string]interface{}, patches []map[string]interface{}, idFieldName string) ([]map[string]interface{}, []map[string]interface{}, bool) {
	for j, item2 := range arr2 {
		for i, item1 := range arr1 {
			if item1[idFieldName] == item2[idFieldName] && i != j {
				patch := map[string]interface{}{
					"op":   "move",
					"from": fmt.Sprintf("/%d", i),
					"path": fmt.Sprintf("/%d", j),
				}
				patches = append(patches, patch)

				element := arr1[i]
				arr1 = append(arr1[:i], arr1[i+1:]...)
				if j >= len(arr1) {
					arr1 = append(arr1, element)
				} else {
					arr1 = append(arr1[:j], append([]map[string]interface{}{element}, arr1[j:]...)...)
				}
				return arr1, patches, true
			}
		}
	}
	return arr1, patches, false
}

func findAndApplyMoveInversely(arr1, arr2 []map[string]interface{}, patches []map[string]interface{}, idFieldName string) ([]map[string]interface{}, []map[string]interface{}, bool) {
	for i := len(arr1) - 1; i >= 0; i-- {
		for j := len(arr2) - 1; j >= 0; j-- {
			if arr1[i][idFieldName] == arr2[j][idFieldName] && i != j {
				newIndex := j
				if j > i {
					newIndex = j - 1
				}
				patch := map[string]interface{}{
					"op":   "move",
					"from": fmt.Sprintf("/%d", i),
					"path": fmt.Sprintf("/%d", newIndex),
				}
				patches = append(patches, patch)

				element := arr1[i]
				arr1 = append(arr1[:i], arr1[i+1:]...)
				if newIndex >= len(arr1) {
					arr1 = append(arr1, element)
				} else {
					arr1 = append(arr1[:newIndex], append([]map[string]interface{}{element}, arr1[newIndex:]...)...)
				}

				return arr1, patches, true
			}
		}
	}
	return arr1, patches, false
}

func CreateMovePatches(arr1 []byte, arr2 []byte, idFieldName string) ([]byte, error) {
	methodFailed := make([]string, 0)
	patchDirect, stepsDirect, errDirect := generateJSONPatch(arr1, arr2, idFieldName, 1)
	if stepsDirect <= 1 {
		return patchDirect, nil
	}
	if errDirect != nil {
		methodFailed = append(methodFailed, "1")
	}

	// Try reverse
	patchInverse, stepsInverse, errInverse := generateJSONPatch(arr1, arr2, idFieldName, 2)
	if stepsInverse <= 1 {
		return patchInverse, nil
	}
	if errInverse != nil {
		methodFailed = append(methodFailed, "2")
	}

	// Try arr2First
	patchFromArr2, stepsFromArr2, errFromArr2 := generateJSONPatch(arr1, arr2, idFieldName, 3)
	if errFromArr2 != nil {
		methodFailed = append(methodFailed, "2")
	}

	if errDirect != nil && errInverse != nil && errFromArr2 != nil {
		log.Infof("Unable to generate json-patch with method any method (1, 2 and 3): %v", errDirect)
		return nil, errDirect
	}

	if len(methodFailed) > 0 {
		log.Infof("Unable to generate json-patch with methods (%s), but other succeeded", strings.Join(methodFailed, ", "))
	}

	// Send the shorter way
	if patchFromArr2 != nil && stepsFromArr2 < stepsDirect && stepsFromArr2 < stepsInverse {
		return patchFromArr2, nil
	} else if patchDirect != nil && stepsDirect < stepsInverse {
		return patchDirect, nil
	} else if patchInverse != nil {
		return patchInverse, nil
	} else {
		return nil, nil
	}
}

func generateJSONPatch(arr1Json []byte, arr2Json []byte, idFieldName string, method int) ([]byte, int, error) {
	arr1AsMap := GetMapFromByte(arr1Json)
	arr2AsMap := GetMapFromByte(arr2Json)

	patches := make([]map[string]interface{}, 0)
	steps := 0
	changed := true
	for {
		if steps > 50 {
			log.Debug(string(arr1Json))
			log.Debug(string(arr2Json))
			log.Debug(patches)
			return nil, steps, fmt.Errorf("too many (> 50) patches to generate JSON patch")
		}
		switch method {
		case 1:
			_, patches, changed = findAndApplyMove(arr1AsMap, arr2AsMap, patches, idFieldName)
		case 2:
			_, patches, changed = findAndApplyMoveInversely(arr1AsMap, arr2AsMap, patches, idFieldName)
		default:
			_, patches, changed = findAndApplyMoveFromArr2(arr1AsMap, arr2AsMap, patches, idFieldName)
		}

		if !changed {
			break
		}
		steps++
	}
	patchBytes, err := json.Marshal(patches)
	return patchBytes, steps, err
}

func ApplyPatch(original []map[string]interface{}, patchBytes []byte) ([]byte, error) {
	originalBytes, _ := json.Marshal(original)
	patch, err := evanphxjsonpatch.DecodePatch(patchBytes)
	if err != nil {
		return nil, err
	}

	modifiedJson, _ := patch.Apply(originalBytes)

	return modifiedJson, nil
}

func PatchUsingMattbairdJsonpatch(original []map[string]interface{}, modified []map[string]interface{}) []jsonpatch.JsonPatchOperation {
	oldListJson, _ := json.Marshal(original)
	newListJson, _ := json.Marshal(modified)

	patches, _ := jsonpatch.CreatePatch(oldListJson, newListJson)

	return patches
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

func MergePatches(patchA []byte, patchB []byte) ([]byte, error) {
	patchAMap := GetMapFromByte(patchA)
	patchBMap := GetMapFromByte(patchB)

	mergedOps := append(patchAMap, patchBMap...)
	mergedJSON, err := json.Marshal(mergedOps)
	if err != nil {
		return nil, err
	}

	return mergedJSON, nil
}

func findItemWithId(itemMaps []map[string]interface{}, id string, defaultValue map[string]interface{}, idFieldName string) map[string]interface{} {
	for _, u := range itemMaps {
		if idField, existsIdField := u[idFieldName].(string); existsIdField {
			if idField == id {
				return u
			}
		}
	}

	return defaultValue
}

func PrintJsonPatchOperation(it []jsonpatch.JsonPatchOperation, name string) {
	fmt.Printf("%s:\n", name)
	a, _ := json.Marshal(it)
	PrintJson(a, name)
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
