// Package config manages the default global configuration for the Core API
// that will be used throughout the lifecycle of the applicaton.
//
// Upon API startup, the configuration provided for this API found in the
// configs directory will be loaded and used as the default configuration.
//
// The default configuration can be accessed for reading by any other package
// of this application. The default configuration may not be modified after
// its creation.
package config

import (
	"fmt"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-api/internal/common/config"
)

const (
	api     = "core"
	cfgFile = "config.yaml"
)

var (
	cfg Config
)

// Config encapsulates all of the settings necessary for the proper functioning of the
// Core API.
type Config struct {
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
	Plugins struct {
		Manifests []string `yaml:"maniftests"`
	} `yaml:"plugins"`

	checksumAlgorithms map[string]struct{}
	disabledFeatures   map[string]struct{}
}

// DefaultPresentation returns the location of the default presentation file.
func (c Config) DefaultPresentation() string {
	return fmt.Sprintf("%s/%s", c.Server.BigBlueButton.URL, c.Presentation.Default)
}

// DefaultPresentation returns the default presentation base URL.
func (c Config) DefaultPresentationBaseURL() string {
	return fmt.Sprintf("%s/%s", c.Server.BigBlueButton.URL, c.Presentation.BasePath)
}

// DefaultLogoURL returns the default BigBlueButton logo URL.
func (c Config) DefaultLogoURL() string {
	return fmt.Sprintf("%s/%s", c.Server.BigBlueButton.URL, c.Server.BigBlueButton.Logo.Default.Path.Logo)
}

// DefaultDarkLogoURL returns the default URL for the BigBlueButton dark logo.
func (c Config) DefaultDarkLogoURL() string {
	return fmt.Sprintf("%s/%s", c.Server.BigBlueButton.URL, c.Server.BigBlueButton.Logo.Default.Path.DarkLogo)
}

// ChecksumAlgorithms returns all of the hashing algorithms that may
// be used for generating checksums.
func (c Config) ChecksumAlgorithms() map[string]struct{} {
	if c.checksumAlgorithms == nil {
		c.checksumAlgorithms = make(map[string]struct{})
		for _, algo := range c.Security.Checksum.Algorithms {
			c.checksumAlgorithms[algo] = struct{}{}
		}
	}

	checksumAlgorithms := make(map[string]struct{})
	for algo := range c.checksumAlgorithms {
		checksumAlgorithms[algo] = struct{}{}
	}
	return checksumAlgorithms
}

// DisabledFeatures returns all of the features that are disabled for meetings
// on this server.
func (c Config) DisabledFeatures() map[string]struct{} {
	if c.disabledFeatures == nil {
		c.disabledFeatures = make(map[string]struct{})
		for _, disabledFeature := range c.Meeting.Features.Disabled {
			c.disabledFeatures[disabledFeature] = struct{}{}
		}
	}

	disabledFeatures := make(map[string]struct{})
	for disabledFeature := range c.disabledFeatures {
		disabledFeatures[disabledFeature] = struct{}{}
	}
	return disabledFeatures
}

func init() {
	config.FindConfig()
	config.LoadConfig(api, cfgFile, &cfg)
}

// DefaultConfig returns a copy of the default configuration that was loaded
// during startup of this API.
func DefaultConfig() Config {
	return cfg
}
