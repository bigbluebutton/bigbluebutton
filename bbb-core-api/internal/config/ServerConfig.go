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
			URL       string `yaml:"url"`
			LogoutURL string `yaml:"logout_url"`
			Logo      struct {
				Default struct {
					Use     bool `yaml:"use"`
					UseDark bool `yaml:"use_dark"`
					Path    struct {
						Logo     string `yaml:"logo"`
						DarkLogo string `yaml:"dark_logo"`
					} `yaml:"path"`
				} `yaml:"default"`
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
		Brdige struct {
			Camera      string `yaml:"camera"`
			ScreenShare string `yaml:"screen_share"`
			Audio       string `yaml:"audio"`
		} `yaml:"bridge"`
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
		Guest struct {
			WaitingTimeout int32 `yaml:"waiting_timeout"`
		} `yaml:"guest"`
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
			Blank               struct {
				Presentation string `yaml:"presentation"`
				Thumbnail    string `yaml:"thumbnail"`
				PNG          string `yaml:"png"`
				SVG          string `yaml:"svg"`
			} `yaml:"blank"`
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

func ParseConfig(path string) (*ServerConfig, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	decoder := yaml.NewDecoder(f)
	var config ServerConfig
	err = decoder.Decode(&config)
	if err != nil {
		return nil, err
	}

	return &config, nil
}

func (config *ServerConfig) DefaultPresentation() string {
	return fmt.Sprintf("%s/%s", config.Server.BigBlueButton.URL, config.Presentation.Default)
}

func (config *ServerConfig) DefaultPresentationBaseURL() string {
	return fmt.Sprintf("%s/%s", config.Server.BigBlueButton.URL, config.Presentation.BasePath)
}

func (config *ServerConfig) DefaultLogoURL() string {
	return fmt.Sprintf("%s/%s", config.Server.BigBlueButton.URL, config.Server.BigBlueButton.Logo.Default.Path.Logo)
}

func (config *ServerConfig) DefaultDarkLogoURL() string {
	return fmt.Sprintf("%s/%s", config.Server.BigBlueButton.URL, config.Server.BigBlueButton.Logo.Default.Path.DarkLogo)
}
