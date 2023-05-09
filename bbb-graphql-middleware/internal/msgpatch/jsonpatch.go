package msgpatch

import (
	"encoding/json"
	"github.com/iMDT/bbb-graphql-middleware/internal/common"
	"github.com/mattbaird/jsonpatch"
	log "github.com/sirupsen/logrus"
	"io/ioutil"
	"os"
	"path/filepath"
)

var cacheDir = os.TempDir() + "/graphql-middleware-cache/"

func getConnPath(bConn *common.BrowserConnection) string {
	//Using SessionToken as path to reinforce security (once connectionId repeats on restart of middleware)
	return cacheDir + bConn.Id
}

func getSubscriptionCacheDirPath(bConn *common.BrowserConnection, subscriptionId string, createIfNotExists bool) (string, error) {
	//Using SessionToken as path to reinforce security (once connectionId repeats on restart of middleware)
	connectionPatchCachePath := getConnPath(bConn) + "/" + bConn.SessionToken + "/"
	subscriptionCacheDirPath := connectionPatchCachePath + subscriptionId + "/"
	_, err := os.Stat(subscriptionCacheDirPath)
	if err != nil {
		if os.IsNotExist(err) && createIfNotExists {
			err = os.MkdirAll(subscriptionCacheDirPath, 0755)
			if err != nil {
				log.Errorf("Error on create cache directory:", err)
				return subscriptionCacheDirPath, nil
			}
		} else {
			return "", err
		}
	}

	return subscriptionCacheDirPath, nil
}

func RemoveConnCacheDir(bConn *common.BrowserConnection) {
	err := os.RemoveAll(getConnPath(bConn))
	if err != nil && !os.IsNotExist(err) {
		log.Errorf("Error while removing CLI patch cache directory:", err)
		return
	}

	log.Infof("Directory of patch caches removed successfully for client %s.", bConn.Id)
}

func RemoveConnSubscriptionCacheFile(bConn *common.BrowserConnection, subscritionId string) {
	subsCacheDirPath, err := getSubscriptionCacheDirPath(bConn, subscritionId, false)
	if err == nil {
		err = os.RemoveAll(subsCacheDirPath)
		if err != nil {
			if !os.IsNotExist(err) {
				log.Errorf("Error while removing CLI subscription patch cache directory:", err)
			}
			return
		}

		log.Infof("Directory of patch caches removed successfully for client %s, subscription %s.", bConn.Id, subscritionId)
	}
}

func ClearAllCaches() {
	filepath.Walk(cacheDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			log.Errorf("prevent panic by handling failure accessing a path %q: %v\n", path, err)
			return err
		}

		if info.IsDir() && path != cacheDir {
			os.RemoveAll(path)
		}
		return nil
	})
}

func PatchMessage(receivedMessage *map[string]interface{}, bConn *common.BrowserConnection) {
	var receivedMessageMap = *receivedMessage

	idValue, ok := receivedMessageMap["id"]
	if !ok {
		//Id does not exists in response Json
		//It's not a subscription data
		return
	}

	payload, ok := receivedMessageMap["payload"].(map[string]interface{})
	if !ok {
		//payload does not exists in response Json
		//It's not a subscription data
		return
	}

	data, ok := payload["data"].(map[string]interface{})
	if !ok {
		//payload.data does not exists in response Json
		//It's not a subscription data
		return
	}
	for key, value := range data {
		currentData, ok := value.([]interface{})
		if !ok {
			log.Errorf("Payload/Data/%s does not exists in response Json.", key)
			return
		}

		dataAsJsonString, err := json.Marshal(currentData)
		if err != nil {
			log.Errorf("Error on convert Payload/Data/%s.", key)
			return
		}

		fileCacheDirPath, err := getSubscriptionCacheDirPath(bConn, idValue.(string), true)
		if err != nil {
			log.Errorf("Error on get Client/Subscription cache path: %v", err)
			return
		}
		filePath := fileCacheDirPath + key + ".json"

		lastContent, err := ioutil.ReadFile(filePath)
		if err != nil {
			//Last content doesn't exist, probably it's the first response
		}
		lastDataAsJsonString := string(lastContent)
		if string(dataAsJsonString) == lastDataAsJsonString {
			//Content didn't change, set message as null to avoid sending it to the browser
			//This case is usual when the middleware reconnects with Hasura and receives the data again
			*receivedMessage = nil
		} else {
			//Content was changed, creating json patch
			if lastDataAsJsonString != "" &&
				len(string(dataAsJsonString)) > 250 { //If data is small it's not worth creating the patch
				diffPatch, e := jsonpatch.CreatePatch([]byte(lastDataAsJsonString), []byte(dataAsJsonString))
				if e != nil {
					log.Errorf("Error creating JSON patch:%v", e)
					return
				}
				jsonDiffPatch, err := json.Marshal(diffPatch)
				if err != nil {
					log.Errorf("Error marshaling patch array:", err)
					return
				}

				//Use patch if the length is 50% smaller than the original msg
				if float64(len(string(jsonDiffPatch)))/float64(len(string(dataAsJsonString))) < 0.5 {
					//Modify receivedMessage to include the Patch and remove the previous data
					//The key of the original message is kept to avoid errors (Apollo-client expects to receive this prop)
					receivedMessageMap["payload"] = map[string]interface{}{
						"data": map[string]interface{}{
							"patch": json.RawMessage(jsonDiffPatch),
							key:     json.RawMessage("[]"),
						},
					}
					*receivedMessage = receivedMessageMap
				}
			}

			//Store current result to be used to create json patch in the future
			errWritingOutput := ioutil.WriteFile(filePath, []byte(dataAsJsonString), 0644)
			if errWritingOutput != nil {
				log.Errorf("Error on trying to write cache of json diff:", errWritingOutput)
			}
		}
	}
}
