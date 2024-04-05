package common

import (
	"encoding/json"
	"fmt"
	log "github.com/sirupsen/logrus"
	"strings"
	"sync"
	"time"
)

type JsonPatchBenchmarkingObj struct {
	Started           time.Time
	Count             int64
	Completed         time.Time
	TotalDuration     time.Duration
	TotalDurationSecs float64
}

var JsonPatchBenchmarkingEnabled = false
var JsonPatchBenchmarking = make(map[string]JsonPatchBenchmarkingObj)
var JsonPatchBenchmarkingMux = sync.Mutex{}

func JsonPatchBenchmarkingStarted(index string) {
	if !JsonPatchBenchmarkingEnabled {
		return
	}

	JsonPatchBenchmarkingMux.Lock()
	defer JsonPatchBenchmarkingMux.Unlock()

	if _, exists := JsonPatchBenchmarking[index]; !exists {
		JsonPatchBenchmarking[index] = JsonPatchBenchmarkingObj{
			Started: time.Now(),
			Count:   0,
		}
	}

	updatedValues := JsonPatchBenchmarking[index]
	updatedValues.Count++

	JsonPatchBenchmarking[index] = updatedValues
}

func JsonPatchBenchmarkingCompleted(index string) {
	if !JsonPatchBenchmarkingEnabled {
		return
	}

	JsonPatchBenchmarkingMux.Lock()
	defer JsonPatchBenchmarkingMux.Unlock()

	if updatedValues, exists := JsonPatchBenchmarking[index]; exists {
		updatedValues.Completed = time.Now()
		updatedValues.TotalDurationSecs = time.Since(updatedValues.Started).Seconds()
		updatedValues.TotalDuration = time.Since(updatedValues.Started)

		JsonPatchBenchmarking[index] = updatedValues
	}
}

func JsonPatchBenchmarkingLogRoutine() {
	JsonPatchBenchmarkingEnabled = true
	log.Info("Activities Overview routine started!")

	for {
		time.Sleep(5 * time.Second)
		fmt.Println("===================================================")

		//hasuraConnections := GetJsonPatchBenchmarking()["__HasuraConnection"].Started
		topMessages := make(map[string]JsonPatchBenchmarkingObj)
		JsonPatchBenchmarkingMux.Lock()
		for index, item := range JsonPatchBenchmarking {
			if strings.HasPrefix(index, "_") ||
				item.Count > 380 ||
				item.TotalDurationSecs > 1 {
				topMessages[index] = item
			}
		}
		JsonPatchBenchmarkingMux.Unlock()

		jsonIndentOverviewBytes, err := json.MarshalIndent(topMessages, "", "   ")
		if err != nil {
			log.Errorf("Error occurred during marshaling. Error: %s", err.Error())
		}
		fmt.Println(string(jsonIndentOverviewBytes))

		jsonOverviewBytes, err := json.Marshal(topMessages)
		fmt.Println(string(jsonOverviewBytes))
	}
}
