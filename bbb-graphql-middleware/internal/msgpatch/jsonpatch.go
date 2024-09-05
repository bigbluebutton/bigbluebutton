package msgpatch

import (
	"bbb-graphql-middleware/internal/common"
	"encoding/json"
	"github.com/mattbaird/jsonpatch"
	log "github.com/sirupsen/logrus"
	"strconv"
)

var minLengthToPatch = 250    //250 chars
var minShrinkToUsePatch = 0.5 //50% percent

func GetPatchedMessage(
	receivedMessage []byte,
	dataKey string,
	lastHasuraMessage common.HasuraMessage,
	hasuraMessage common.HasuraMessage,
	cacheKey uint32,
	lastDataChecksum uint32,
	currDataChecksum uint32) []byte {

	if lastDataChecksum != 0 {
		common.JsonPatchBenchmarkingStarted(strconv.Itoa(int(cacheKey)))
		defer common.JsonPatchBenchmarkingCompleted(strconv.Itoa(int(cacheKey)))
	}

	//Lock to avoid other routines from processing the same message
	common.GlobalCacheLocks.Lock(cacheKey)
	if patchedMessageCache, patchedMessageCacheExists := common.GetPatchedMessageCache(cacheKey); patchedMessageCacheExists {
		//Unlock immediately once the cache was already created by other routine
		common.GlobalCacheLocks.Unlock(cacheKey)
		return patchedMessageCache
	} else {
		//It will create the cache and then Unlock (others will wait to benefit from this cache)
		defer common.GlobalCacheLocks.Unlock(cacheKey)
	}

	var jsonDiffPatch []byte

	if currDataChecksum == lastDataChecksum {
		//Content didn't change, set message as null to avoid sending it to the browser
		//This case is usual when the middleware reconnects with Hasura and receives the data again
		jsonData, _ := json.Marshal(nil)
		common.StorePatchedMessageCache(cacheKey, jsonData)
		return jsonData
	} else {
		//Content was changed, creating json patch
		//If data is small (< minLengthToPatch) it's not worth creating the patch
		if len(hasuraMessage.Payload.Data[dataKey]) > minLengthToPatch {
			if string(lastHasuraMessage.Payload.Data[dataKey]) != "" {
				var shouldUseCustomJsonPatch bool
				if shouldUseCustomJsonPatch, jsonDiffPatch = common.ValidateIfShouldUseCustomJsonPatch(
					lastHasuraMessage.Payload.Data[dataKey],
					hasuraMessage.Payload.Data[dataKey],
					"userId"); shouldUseCustomJsonPatch {
					common.StorePatchedMessageCache(cacheKey, jsonDiffPatch)
				} else if diffPatch, diffPatchErr := jsonpatch.CreatePatch(lastHasuraMessage.Payload.Data[dataKey], hasuraMessage.Payload.Data[dataKey]); diffPatchErr == nil {
					var err error
					if jsonDiffPatch, err = json.Marshal(diffPatch); err != nil {
						log.Errorf("Error marshaling patch array: %v", err)
					}
				} else {
					log.Errorf("Error creating JSON patch: %v\n%v", diffPatchErr, string(hasuraMessage.Payload.Data[dataKey]))
				}
			}
		}
	}

	//Use patch if the length is {minShrinkToUsePatch}% smaller than the original msg
	if jsonDiffPatch != nil && float64(len(string(jsonDiffPatch)))/float64(len(string(hasuraMessage.Payload.Data[dataKey]))) < minShrinkToUsePatch {
		//Modify receivedMessage to include the Patch and remove the previous data
		//The key of the original message is kept to avoid errors (Apollo-client expects to receive this prop)

		hasuraMessage.Payload.Data = map[string]json.RawMessage{
			"patch": jsonDiffPatch,
			dataKey: json.RawMessage("[]"),
		}
		hasuraMessageJson, _ := json.Marshal(hasuraMessage)
		receivedMessage = hasuraMessageJson
	}

	common.StorePatchedMessageCache(cacheKey, receivedMessage)
	return receivedMessage
}
