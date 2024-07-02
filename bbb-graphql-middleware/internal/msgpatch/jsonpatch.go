package msgpatch

import (
	"encoding/json"
	"github.com/iMDT/bbb-graphql-middleware/internal/common"
	"github.com/mattbaird/jsonpatch"
	log "github.com/sirupsen/logrus"
	"io/ioutil"
	"os"
	"path/filepath"
	"strconv"
)

var cacheDir = os.TempDir() + "/graphql-middleware-cache/"
var minLengthToPatch = 250         //250 chars
var minShrinkToUsePatch = 0.5      //50% percent
var RawDataCacheStorageMode string //memory or file

func getConnPath(connectionId string, browserSessionToken string) string {
	if browserSessionToken == "" {
		return cacheDir + connectionId
	} else {
		return cacheDir + connectionId + "/" + browserSessionToken
	}
}

func getSubscriptionCacheDirPath(
	browserConnectionId string,
	browserSessionToken string,
	subscriptionId string,
	createIfNotExists bool) (string, error) {
	//Using SessionToken as path to reinforce security (once connectionId repeats on restart of middleware)
	connectionPatchCachePath := getConnPath(browserConnectionId, browserSessionToken) + "/"
	subscriptionCacheDirPath := connectionPatchCachePath + subscriptionId + "/"
	_, err := os.Stat(subscriptionCacheDirPath)
	if err != nil {
		if os.IsNotExist(err) && createIfNotExists {
			err = os.MkdirAll(subscriptionCacheDirPath, 0755)
			if err != nil {
				log.Errorf("Error on create cache directory: %v", err)
				return subscriptionCacheDirPath, nil
			}
		} else {
			return "", err
		}
	}

	return subscriptionCacheDirPath, nil
}

func RemoveConnCacheDir(connectionId string) {
	if RawDataCacheStorageMode == "file" {
		err := os.RemoveAll(getConnPath(connectionId, ""))
		if err != nil {
			if !os.IsNotExist(err) {
				log.Errorf("Error while removing CLI patch cache directory: %v", err)
			}
			return
		}

		log.Debugf("Directory of patch caches removed successfully for client %s.", connectionId)
	}
}

func RemoveConnSubscriptionCacheFile(browserConnectionId string, browserSessionToken string, subscriptionId string) {
	if RawDataCacheStorageMode == "file" {
		subsCacheDirPath, err := getSubscriptionCacheDirPath(browserConnectionId, browserSessionToken, subscriptionId, false)
		if err == nil {
			err = os.RemoveAll(subsCacheDirPath)
			if err != nil {
				if !os.IsNotExist(err) {
					log.Errorf("Error while removing CLI subscription patch cache directory: %v", err)
				}
				return
			}

			log.Debugf("Directory of patch caches removed successfully for client %s, subscription %s.", browserConnectionId, subscriptionId)
		}
	}
}

func ClearAllCaches() {
	if RawDataCacheStorageMode == "file" {
		info, err := os.Stat(cacheDir)
		if err == nil && info.IsDir() {
			filepath.Walk(cacheDir, func(path string, info os.FileInfo, err error) error {
				if err != nil {
					log.Debugf("Cache dir was removed previously (probably user disconnected): %q: %v\n", path, err)
					return err
				}

				if info.IsDir() && path != cacheDir {
					os.RemoveAll(path)
				}
				return nil
			})
		}
	}
}

func GetRawDataCache(browserConnectionId string, browserSessionToken string, subscriptionId string, dataKey string, lastDataAsJson []byte) ([]byte, error) {
	if RawDataCacheStorageMode == "file" {
		fileCacheDirPath, err := getSubscriptionCacheDirPath(browserConnectionId, browserSessionToken, subscriptionId, true)
		if err != nil {
			log.Errorf("Error on get Client/Subscription cache path: %v", err)
			return nil, err
		}
		filePath := fileCacheDirPath + dataKey + ".json"

		return ioutil.ReadFile(filePath)
	} else {
		return lastDataAsJson, nil
	}
}

func StoreRawDataCache(browserConnectionId string, browserSessionToken string, subscriptionId string, dataKey string, dataAsJson []byte) {
	//Case the mode is memory, it was stored in the Reader already
	if RawDataCacheStorageMode == "file" {
		fileCacheDirPath, err := getSubscriptionCacheDirPath(browserConnectionId, browserSessionToken, subscriptionId, true)
		if err != nil {
			log.Errorf("Error on get Client/Subscription cache path: %v", err)
			return
		}
		filePath := fileCacheDirPath + dataKey + ".json"

		if len(string(dataAsJson)) > minLengthToPatch || fileExists(filePath) {
			errWritingOutput := ioutil.WriteFile(filePath, dataAsJson, 0644)
			if errWritingOutput != nil {
				log.Errorf("Error on trying to write cache of json diff: %v", errWritingOutput)
			}
		}
	}
}

func fileExists(filename string) bool {
	_, err := os.Stat(filename)
	return !os.IsNotExist(err)
}

func GetPatchedMessage(
	receivedMessage []byte,
	subscriptionId string,
	dataKey string,
	lastHasuraMessage common.HasuraMessage,
	hasuraMessage common.HasuraMessage,
	browserConnectionId string,
	browserSessionToken string,
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
			if lastContent, lastContentErr := GetRawDataCache(browserConnectionId, browserSessionToken, subscriptionId, dataKey, lastHasuraMessage.Payload.Data[dataKey]); lastContentErr == nil && string(lastContent) != "" {
				var shouldUseCustomJsonPatch bool
				if shouldUseCustomJsonPatch, jsonDiffPatch = common.ValidateIfShouldUseCustomJsonPatch(lastContent, hasuraMessage.Payload.Data[dataKey], "userId"); shouldUseCustomJsonPatch {
					common.StorePatchedMessageCache(cacheKey, jsonDiffPatch)
				} else if diffPatch, diffPatchErr := jsonpatch.CreatePatch(lastContent, hasuraMessage.Payload.Data[dataKey]); diffPatchErr == nil {
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

	//Store current result to be used to create json patch in the future
	StoreRawDataCache(browserConnectionId, browserSessionToken, subscriptionId, dataKey, hasuraMessage.Payload.Data[dataKey])

	common.StorePatchedMessageCache(cacheKey, receivedMessage)
	return receivedMessage
}
