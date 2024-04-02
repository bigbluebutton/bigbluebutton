package common

import (
	"encoding/json"
	"fmt"
	log "github.com/sirupsen/logrus"
	"runtime"
	"strings"
	"sync"
	"time"
)

type ActivitiesOverviewObj struct {
	Started      int64
	Completed    int64
	DataReceived int64
	DataSizeAvg  int64
	DataCountAvg int64
}

var activitiesOverviewEnabled = false
var activitiesOverview = make(map[string]ActivitiesOverviewObj)
var activitiesOverviewMux = sync.Mutex{}

func ActivitiesOverviewStarted(index string) {
	if !activitiesOverviewEnabled {
		return
	}

	activitiesOverviewMux.Lock()
	defer activitiesOverviewMux.Unlock()

	if _, exists := activitiesOverview[index]; !exists {
		activitiesOverview[index] = ActivitiesOverviewObj{
			Started:      0,
			Completed:    0,
			DataReceived: 0,
			DataSizeAvg:  0,
			DataCountAvg: 0,
		}
	}

	updatedValues := activitiesOverview[index]
	updatedValues.Started++

	activitiesOverview[index] = updatedValues
}

func ActivitiesOverviewDataReceived(index string) {
	if !activitiesOverviewEnabled {
		return
	}

	activitiesOverviewMux.Lock()
	defer activitiesOverviewMux.Unlock()

	if updatedValues, exists := activitiesOverview[index]; exists {
		updatedValues.DataReceived++

		activitiesOverview[index] = updatedValues
	}
}

func ActivitiesOverviewDataSize(index string, dataSize int64, dataCount int64) {
	if !activitiesOverviewEnabled {
		return
	}

	activitiesOverviewMux.Lock()
	defer activitiesOverviewMux.Unlock()

	if updatedValues, exists := activitiesOverview[index]; exists {

		//fmt.Println("---------------" + index)
		//fmt.Printf("Received dataCount: %d\n", dataCount)
		//fmt.Printf("It was dataCount: %d\n", updatedValues.DataCountAvg)

		updatedValues.DataSizeAvg = ((updatedValues.DataSizeAvg*updatedValues.DataReceived - 1) + dataSize) / updatedValues.DataReceived
		updatedValues.DataCountAvg = ((updatedValues.DataCountAvg * (updatedValues.DataReceived - 1)) + dataCount) / updatedValues.DataReceived

		//fmt.Printf("New value dataCount: %d\n", updatedValues.DataCountAvg)

		activitiesOverview[index] = updatedValues
	}
}

func ActivitiesOverviewCompleted(index string) {
	if !activitiesOverviewEnabled {
		return
	}

	activitiesOverviewMux.Lock()
	defer activitiesOverviewMux.Unlock()

	if updatedValues, exists := activitiesOverview[index]; exists {
		updatedValues.Completed++

		activitiesOverview[index] = updatedValues
	}

}

func GetActivitiesOverview() map[string]ActivitiesOverviewObj {
	activitiesOverviewMux.Lock()
	defer activitiesOverviewMux.Unlock()

	return activitiesOverview
}

func ActivitiesOverviewLogRoutine() {
	activitiesOverviewEnabled = true
	log.Info("Activities Overview routine started!")

	for {
		time.Sleep(5 * time.Second)
		fmt.Println("===================================================")

		hasuraConnections := GetActivitiesOverview()["__HasuraConnection"].Started
		topMessages := make(map[string]ActivitiesOverviewObj)
		activitiesOverview := GetActivitiesOverview()
		for index, item := range activitiesOverview {
			if strings.HasPrefix(index, "_") ||
				item.Started > hasuraConnections*3 ||
				item.DataReceived > hasuraConnections*5 ||
				item.DataSizeAvg > 3000 ||
				item.DataCountAvg > 5 {
				topMessages[index] = item
			}
		}

		jsonIndentOverviewBytes, err := json.MarshalIndent(topMessages, "", "   ")
		if err != nil {
			log.Errorf("Error occurred during marshaling. Error: %s", err.Error())
		}
		fmt.Println(string(jsonIndentOverviewBytes))

		jsonOverviewBytes, err := json.Marshal(topMessages)
		fmt.Println(string(jsonOverviewBytes))

		//log.WithField("data", string(jsonOverviewBytes)).Info("Top Activities Overview")

		activitiesOverviewSummary := make(map[string]int64)
		activitiesOverviewSummary["activeWsConnections"] = GetActivitiesOverview()["__WebsocketConnection"].Started - GetActivitiesOverview()["__WebsocketConnection"].Completed
		activitiesOverviewSummary["activeBrowserHandlers"] = GetActivitiesOverview()["__BrowserConnection"].Started - GetActivitiesOverview()["__BrowserConnection"].Completed
		activitiesOverviewSummary["activeSubscriptions"] = GetActivitiesOverview()["_Sum-subscription"].Started - GetActivitiesOverview()["_Sum-subscription"].Completed
		activitiesOverviewSummary["pendingMutations"] = GetActivitiesOverview()["_Sum-mutation"].Started - GetActivitiesOverview()["_Sum-mutation"].Completed
		activitiesOverviewSummary["numGoroutine"] = int64(runtime.NumGoroutine())
		jsonOverviewSummaryBytes, _ := json.MarshalIndent(activitiesOverviewSummary, "", "")
		//log.WithField("data", string(jsonOverviewSummaryBytes)).Info("Activities Overview Summary")
		fmt.Println(string(jsonOverviewSummaryBytes))
	}
}
