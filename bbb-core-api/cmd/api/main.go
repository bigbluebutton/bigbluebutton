package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	bbbcore "github.com/bigbluebutton/bigbluebutton/bbb-core-api/gen/bbb-core"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"gopkg.in/yaml.v3"
)

type Config struct {
	BbbCore            bbbcore.BbbCoreServiceClient `yaml:"-"`
	ChecksumAlgorithms map[string]struct{}          `yaml:"-"`
	DisabledFeatures   map[string]struct{}          `yaml:"-"`
	Server             struct {
		Host          string `yaml:"host"`
		Port          string `yaml:"port"`
		BigBlueButton struct {
			Url       string `yaml:"url"`
			LogoutUrl string `yaml:"logout_url"`
			Logo      struct {
				UseDefaultLogo bool   `yaml:"useDefaultLogo"`
				DefaultLogoUrl string `yaml:"defaultLogoUrl"`
			} `yaml:"logo"`
		} `yaml:"bigbluebutton"`
		Grpc struct {
			Host string `yaml:"host"`
			Port string `yaml:"port"`
		} `yaml:"grpc"`
	} `yaml:"server"`
	Security struct {
		Salt     string `yaml:"salt"`
		Checksum struct {
			Algorithms []string `yaml:"algorithms"`
		} `yaml:"checksum"`
	} `yaml:"security"`
	Meeting struct {
		Cameras struct {
			Cap              int32 `yaml:"cap"`
			MaxPinned        int32 `yaml:"max_pinned"`
			ModOnly          bool  `yaml:"mod_only"`
			AllowModsToEject bool  `yaml:"allow_mods_to_eject"`
		} `yaml:"cameras"`
		Features struct {
			Disabled []string `yaml:"disabled"`
		} `yaml:"features"`
		Duration int32 `yaml:"duration"`
		Expiry   struct {
			NoUserJoined            int32 `yaml:"no_user_joined"`
			LastUserLeft            int32 `yaml:"last_user_left"`
			EndWhenNoModerator      bool  `yaml:"end_when_no_moderator"`
			EndWhenNoModeratorDelay int32 `yaml:"end_when_no_moderator_delay"`
		} `yaml:"expiry"`
		Welcome struct {
			Message struct {
				Template string `yaml:"template"`
				Footer   string `yaml:"footer"`
			} `yaml:"message"`
		} `yaml:"welcome"`
		Voice struct {
			VoiceBridgeLength int32  `yaml:"voice_bridge_length"`
			DialAccessNumber  string `yaml:"dial_access_number"`
			MuteOnStart       bool   `yaml:"mute_on_start"`
		} `yaml:"voice"`
		Users struct {
			Max                     int32  `yaml:"max"`
			MaxConcurrentAccess     int32  `yaml:"max_concurrent_access"`
			AllowDuplicateExtUserId bool   `yaml:"allow_duplicate_ext_user_id"`
			GuestPolicy             string `yaml:"guest_policy"`
			AllowModsToUnmute       bool   `yaml:"allow_mods_to_unmute"`
			AuthenticatedGuest      bool   `yaml:"authenticated_guest"`
			AllowPromoteGuest       bool   `yaml:"allow_promote_guest"`
		} `yaml:"users"`
		Layout string `yaml:"layout"`
		Lock   struct {
			Disable struct {
				Cam   bool `yaml:"cam"`
				Mic   bool `yaml:"mic"`
				Notes bool `yaml:"notes"`
				Chat  struct {
					Private bool `yaml:"private"`
					Public  bool `yaml:"public"`
				} `yaml:"chat"`
			} `yaml:"disable"`
			OnJoin             bool `yaml:"on_join"`
			OnJoinConfigurable bool `yaml:"on_join_configurable"`
			Hide               struct {
				UserList          bool `yaml:"user_list"`
				ViewersCursor     bool `yaml:"viewers_cursor"`
				ViewersAnnotation bool `yaml:"viewers_annotation"`
			} `yaml:"hide"`
		} `yaml:"lock"`
	} `yaml:"meeting"`
	User struct {
		Camera struct {
			Cap int32 `yaml:"cap"`
		} `yaml:"camera"`
		Inactivity struct {
			InspectInterval int32 `yaml:"inspect_interval"`
			Threshold       int32 `yaml:"threshold"`
			ResponseDelay   int32 `yaml:"response_deplay"`
		} `yaml:"inactivity"`
	} `yaml:"user"`
	Recording struct {
		NotifyRecordingIsOn     bool `yaml:"notifyRecordingIsOn"`
		Disabled                bool `yaml:"disabled"`
		AutoStart               bool `yaml:"auto_start"`
		AllowStartStopRecording bool `yaml:"allow_start_stop_recording"`
		RecordFullDurationMedia bool `yaml:"record_full_duration_media"`
		KeepEvents              bool `yaml:"keep_events"`
	} `yaml:"recording"`
	Presentation struct {
		Upload struct {
			External struct {
				Description string `yaml:"description"`
				Url         string `yaml:"url"`
			} `yaml:"external"`
		} `yaml:"upload"`
	} `yaml:"presentation"`
	BreakoutRooms struct {
		Record             bool `yaml:"record"`
		PrivateChatEnabled bool `yaml:"private_chat_enabled"`
	} `yaml:"breakout_rooms"`
	LearningDashboard struct {
		CleanupDelay int32 `yam:"cleanup_delay"`
	} `yaml:"learning_dashboard"`
}

const retryPolicy = `{
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

func main() {
	app := parseConfiguration()
	target := fmt.Sprintf("%s:%s", app.Server.Grpc.Host, app.Server.Grpc.Port)

	log.Println("Establishing connection to akka-apps through gRPC at", target)
	conn, err := grpc.Dial(target, grpc.WithTransportCredentials(insecure.NewCredentials()), grpc.WithDefaultServiceConfig(retryPolicy))
	if err != nil {
		log.Panicln(err)
		return
	}
	defer conn.Close()

	client := bbbcore.NewBbbCoreServiceClient(conn)
	app.BbbCore = client

	address := fmt.Sprintf("%s:%s", app.Server.Host, app.Server.Port)
	log.Printf("Starting bbb-core-api at %s\n", address)
	srv := &http.Server{
		Addr:    address,
		Handler: app.routes(),
	}

	err = srv.ListenAndServe()
	if err != nil {
		log.Panicln(err)
	}
}

func parseConfiguration() *Config {
	log.Println("Parsing server configuration")

	f, err := os.Open("config.yml")
	if err != nil {
		log.Println(err)
		return nil
	}
	defer f.Close()

	var app Config
	decoder := yaml.NewDecoder(f)
	err = decoder.Decode(&app)
	if err != nil {
		log.Println(err)
		return nil
	}

	checksumAlgorithms := make(map[string]struct{})
	for _, algorithm := range app.Security.Checksum.Algorithms {
		checksumAlgorithms[algorithm] = struct{}{}
	}
	app.ChecksumAlgorithms = checksumAlgorithms

	disabledFeatures := make(map[string]struct{})
	for _, feature := range app.Meeting.Features.Disabled {
		disabledFeatures[feature] = struct{}{}
	}
	app.DisabledFeatures = disabledFeatures

	return &app
}
