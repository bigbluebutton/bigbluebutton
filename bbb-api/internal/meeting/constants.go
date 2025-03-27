package meeting

const (
	RetryPolicy = `{
		"methodConfig": [{
			"name": [{"service": "org.bigbluebutton.protos.BbbCoreService"}],
			"waitForReady": true,
	
			"retryPolicy": {
				"MaxAttempts": 5,
				"InitialBackoff": ".01s",
				"MaxBackoff": ".1s",
				"BackoffMultiplier": 2.0,
				"RetryableStatusCodes": [ "UNAVAILABLE" ]
			}
		}]
	}`

	MeetingIDParam = "meetingID"
)
