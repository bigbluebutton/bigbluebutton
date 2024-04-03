package common

import (
	"github.com/google/uuid"
	"sync"
)

var uniqueID string

func InitUniqueID() {
	uniqueID = uuid.New().String()
}

func GetUniqueID() string {
	return uniqueID
}

type ActivitiesOverviewObj struct {
	Started      int64
	Completed    int64
	DataReceived int64
}

var activitiesOverview = make(map[string]ActivitiesOverviewObj)
var activitiesOverviewMux = sync.Mutex{}

func ActivitiesOverviewStarted(index string) {
	activitiesOverviewMux.Lock()
	defer activitiesOverviewMux.Unlock()

	if _, exists := activitiesOverview[index]; !exists {
		activitiesOverview[index] = ActivitiesOverviewObj{
			Started:      0,
			Completed:    0,
			DataReceived: 0,
		}
	}

	updatedValues := activitiesOverview[index]
	updatedValues.Started++

	activitiesOverview[index] = updatedValues
}

func ActivitiesOverviewDataReceived(index string) {
	activitiesOverviewMux.Lock()
	defer activitiesOverviewMux.Unlock()

	if updatedValues, exists := activitiesOverview[index]; exists {
		updatedValues.DataReceived++

		activitiesOverview[index] = updatedValues
	}

}

func ActivitiesOverviewCompleted(index string) {
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
