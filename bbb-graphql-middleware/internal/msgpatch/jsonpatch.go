package msgpatch

import (
	"encoding/json"
	"github.com/iMDT/bbb-graphql-middleware/internal/common"
	"github.com/mattbaird/jsonpatch"
	log "github.com/sirupsen/logrus"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
)

var cacheDir = os.TempDir() + "/graphql-middleware-cache/"
var minLengthToPatch = 250    //250 chars
var minShrinkToUsePatch = 0.5 //50% percent

func getConnPath(connectionId string) string {
	return cacheDir + connectionId
}

func getSubscriptionCacheDirPath(
	bConn *common.BrowserConnection,
	subscriptionId string,
	createIfNotExists bool) (string, error) {
	//Using SessionToken as path to reinforce security (once connectionId repeats on restart of middleware)
	connectionPatchCachePath := getConnPath(bConn.Id) + "/" + bConn.SessionToken + "/"
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
	err := os.RemoveAll(getConnPath(connectionId))
	if err != nil {
		if !os.IsNotExist(err) {
			log.Errorf("Error while removing CLI patch cache directory: %v", err)
		}
		return
	}

	log.Debugf("Directory of patch caches removed successfully for client %s.", connectionId)
}

func RemoveConnSubscriptionCacheFile(bConn *common.BrowserConnection, subscriptionId string) {
	subsCacheDirPath, err := getSubscriptionCacheDirPath(bConn, subscriptionId, false)
	if err == nil {
		err = os.RemoveAll(subsCacheDirPath)
		if err != nil {
			if !os.IsNotExist(err) {
				log.Errorf("Error while removing CLI subscription patch cache directory: %v", err)
			}
			return
		}

		log.Debugf("Directory of patch caches removed successfully for client %s, subscription %s.", bConn.Id, subscriptionId)
	}
}

func ClearAllCaches() {
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

func fileExists(filename string) bool {
	_, err := os.Stat(filename)
	return !os.IsNotExist(err)
}

func PatchMessage(
	receivedMessage *map[string]interface{},
	queryId string,
	dataKey string,
	dataAsJson []byte,
	bConn *common.BrowserConnection,
	cacheKey string,
	lastDataChecksum uint32,
	currDataChecksum uint32) {

	if lastDataChecksum != 0 {
		common.JsonPatchBenchmarkingStarted(cacheKey)
		defer common.JsonPatchBenchmarkingCompleted(cacheKey)
	}

	//Avoid other routines from processing the same JsonPatch
	common.GlobalCacheLocks.Lock(cacheKey)
	jsonDiffPatch, jsonDiffPatchExists := common.GetJsonPatchCache(cacheKey)
	if jsonDiffPatchExists {
		//Unlock immediately once the cache was already created by other routine
		common.GlobalCacheLocks.Unlock(cacheKey)
	} else {
		//It will create the cache and then Unlock (others will wait to benefit from this cache)
		defer common.GlobalCacheLocks.Unlock(cacheKey)
	}

	var receivedMessageMap = *receivedMessage

	fileCacheDirPath, err := getSubscriptionCacheDirPath(bConn, queryId, true)
	if err != nil {
		log.Errorf("Error on get Client/Subscription cache path: %v", err)
		return
	}
	filePath := fileCacheDirPath + dataKey + ".json"

	if !jsonDiffPatchExists {
		if currDataChecksum == lastDataChecksum {
			//Content didn't change, set message as null to avoid sending it to the browser
			//This case is usual when the middleware reconnects with Hasura and receives the data again
			*receivedMessage = nil
		} else {
			//Content was changed, creating json patch
			//If data is small (< minLengthToPatch) it's not worth creating the patch
			if len(string(dataAsJson)) > minLengthToPatch {
				if lastContent, lastContentErr := ioutil.ReadFile(filePath); lastContentErr == nil && string(lastContent) != "" {
					//Temporarily use CustomPatch only for UserList (testing feature)
					if strings.HasPrefix(cacheKey, "subscription-Patched_UserListSubscription") &&
						common.ValidateIfShouldUseCustomJsonPatch(lastContent, dataAsJson, "userId") {
						jsonDiffPatch = common.CreateJsonPatch(lastContent, dataAsJson, "userId")
						common.StoreJsonPatchCache(cacheKey, jsonDiffPatch)
					} else if diffPatch, diffPatchErr := jsonpatch.CreatePatch(lastContent, dataAsJson); diffPatchErr == nil {
						if jsonDiffPatch, err = json.Marshal(diffPatch); err == nil {
							common.StoreJsonPatchCache(cacheKey, jsonDiffPatch)
						} else {
							log.Errorf("Error marshaling patch array: %v", err)
						}
					} else {
						log.Errorf("Error creating JSON patch: %v\n%v", diffPatchErr, string(dataAsJson))
					}
				}
			}
		}
	}

	//Use patch if the length is {minShrinkToUsePatch}% smaller than the original msg
	if jsonDiffPatch != nil && float64(len(string(jsonDiffPatch)))/float64(len(string(dataAsJson))) < minShrinkToUsePatch {
		//Modify receivedMessage to include the Patch and remove the previous data
		//The key of the original message is kept to avoid errors (Apollo-client expects to receive this prop)
		receivedMessageMap["payload"] = map[string]interface{}{
			"data": map[string]interface{}{
				"patch": json.RawMessage(jsonDiffPatch),
				dataKey: json.RawMessage("[]"),
			},
		}
		*receivedMessage = receivedMessageMap
	}

	//Store current result to be used to create json patch in the future
	if len(string(dataAsJson)) > minLengthToPatch || fileExists(filePath) {
		errWritingOutput := ioutil.WriteFile(filePath, dataAsJson, 0644)
		if errWritingOutput != nil {
			log.Errorf("Error on trying to write cache of json diff: %v", errWritingOutput)
		}
	}
}
