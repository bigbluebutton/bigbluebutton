package config

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

type ServerConfig struct {
	Server struct {
		Host          string `yaml:"host"`
		Port          string `yaml:"port"`
		BigBlueButton struct {
			Url       string `yaml:"url"`
			LogoutUrl string `yaml:"logout_url"`
			Logo      struct {
				UseDefaultLogo  bool   `yaml:"use_default_logo"`
				DefaultLogoPath string `yaml:"default_logo_path"`
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
			Directory    string   `yaml:"directory"`
			Protocols    []string `yaml:"protocols"`
			BlockedHosts []string `yaml:"blocked_hosts"`
		} `yaml:"upload"`
		Conversion struct {
			GeneratePNGs        bool `yaml:"generate_pngs"`
			PlacementsThreshold int  `yaml:"placements_threshold"`
			ImageTagThreshold   int  `yaml:"image_tag_threshold"`
		} `yaml:"conversion"`
		Default  string `yaml:"default"`
		BasePath string `yaml:"base_path"`
	} `yaml:"presentation"`
	BreakoutRooms struct {
		Record             bool `yaml:"record"`
		PrivateChatEnabled bool `yaml:"private_chat_enabled"`
	} `yaml:"breakout_rooms"`
	LearningDashboard struct {
		CleanupDelay int32 `yaml:"cleanup_delay"`
	} `yaml:"learning_dashboard"`
	Override struct {
		ClientSettings      bool `yaml:"client_settings"`
		DefaultPresentation bool `yaml:"default_presentation"`
	} `yaml:"override"`
}

func (config *ServerConfig) ParseConfig(path string) error {
	f, err := os.Open(path)
	if err != nil {
		return err
	}
	defer f.Close()

	decoder := yaml.NewDecoder(f)
	err = decoder.Decode(&config)
	if err != nil {
		return err
	}

	return nil
}

func (config *ServerConfig) DefaultPresentation() string {
	return fmt.Sprintf("%s/%s", config.Server.BigBlueButton.Url, config.Presentation.Default)
}

func (config *ServerConfig) DefaultPresentationBaseURL() string {
	return fmt.Sprintf("%s/%s", config.Server.BigBlueButton.Url, config.Presentation.BasePath)
}

func (config *ServerConfig) DefaultLogoURL() string {
	return fmt.Sprintf("%s/%s", config.Server.BigBlueButton.Url, config.Server.BigBlueButton.Logo.DefaultLogoPath)
}
