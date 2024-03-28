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

var activitiesOverview = make(map[string]int64)
var activitiesOverviewMux = sync.Mutex{}

func ActivitiesOverviewIncIndex(index string) {
	activitiesOverviewMux.Lock()
	defer activitiesOverviewMux.Unlock()

	if _, exists := activitiesOverview[index]; !exists {
		activitiesOverview[index] = 0
	}

	activitiesOverview[index]++
}

func GetActivitiesOverview() map[string]int64 {
	activitiesOverviewMux.Lock()
	defer activitiesOverviewMux.Unlock()

	return activitiesOverview
}
