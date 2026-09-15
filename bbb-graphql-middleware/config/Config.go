package config

import (
	"io/ioutil"
	"os"
	"path/filepath"
	"sync"

	"dario.cat/mergo"
	log "github.com/sirupsen/logrus"
	"gopkg.in/yaml.v3"
)

var (
	instance *Config
	once     sync.Once
)

var (
	DefaultConfigPath  = "/usr/share/bbb-graphql-middleware/config.yml"
	OverrideConfigPath = "/etc/bigbluebutton/bbb-graphql-middleware.yml"
)

type Config struct {
	Server struct {
		Host                                 string `yaml:"listen_host"`
		Port                                 int    `yaml:"listen_port"`
		MaxConnections                       int    `yaml:"max_connections"`
		MaxConnectionsPerSecond              int    `yaml:"max_connections_per_second"`
		MaxConnectionsPerSessionToken        int    `yaml:"max_connections_per_session_token"`
		MaxConnectionQueriesPerMinute        int    `yaml:"max_connection_queries_per_minute"`
		MaxConnectionMutationsPerMinute      int    `yaml:"max_connection_mutations_per_minute"`
		MaxConnectionConcurrentSubscriptions int    `yaml:"max_connection_concurrent_subscriptions"`
		MaxQueryLength                       int    `yaml:"max_query_length"`
		MaxQueryDepth                        int    `yaml:"max_query_depth"`
		MaxMutationLength                    int    `yaml:"max_mutation_length"`
		AuthorizedCrossOrigin                string `yaml:"authorized_cross_origin"`
		JsonPatchDisabled                    bool   `yaml:"json_patch_disabled"`
		SubscriptionAllowedList              string `yaml:"subscriptions_allowed_list"`
		SubscriptionsDeniedList              string `yaml:"subscriptions_denied_list"`
		WebsocketIdleTimeoutSeconds          int    `yaml:"websocket_idle_timeout_seconds"`
	} `yaml:"server"`
	Redis struct {
		Host     string `yaml:"host"`
		Port     int32  `yaml:"port"`
		Password string `yaml:"password"`
	} `yaml:"redis"`
	Hasura struct {
		Url string `yaml:"url"`
	} `yaml:"hasura"`
	GraphqlActions struct {
		Url string `yaml:"url"`
	} `yaml:"graphql-actions"`
	AuthHook struct {
		Url string `yaml:"url"`
	} `yaml:"auth_hook"`
	SessionVarsHook struct {
		Url string `yaml:"url"`
	} `yaml:"session_vars_hook"`
	LogLevel                         string `yaml:"log_level"`
	PrometheusAdvancedMetricsEnabled bool   `yaml:"prometheus_advanced_metrics_enabled"`
	DumpQueriesDir                   string `yaml:"dump_queries_dir"`
}

func GetConfig() *Config {
	once.Do(func() {
		instance = &Config{}
		instance.loadConfigs()
	})
	return instance
}

func (c *Config) loadConfigs() {
	// Load default config file
	configDefault, err := loadConfigFile(DefaultConfigPath)
	if err != nil {
		log.Fatalf("Error while loading config file (%s): %v", DefaultConfigPath, err)
	}

	// Load override config file if exists
	if _, err := os.Stat(OverrideConfigPath); err == nil {
		configOverride, err := loadConfigFile(OverrideConfigPath)
		if err != nil {
			log.Fatalf("Error while loading override config file (%s): %v", OverrideConfigPath, err)
		}

		log.Info("Override config found at " + OverrideConfigPath)

		// Use mergo to merge configs
		err = mergo.Merge(&configDefault, configOverride, mergo.WithOverride)
		if err != nil {
			log.Fatalf("Erro ao mesclar as configurações: %v", err)
		}
	}

	// Update the singleton instance with the merged config
	*instance = configDefault
}

func loadConfigFile(path string) (Config, error) {
	var config Config
	data, err := ioutil.ReadFile(filepath.Clean(path))
	if err != nil {
		return config, err
	}

	err = yaml.Unmarshal(data, &config)
	if err != nil {
		return config, err
	}

	return config, nil
}

var AllowedSubscriptionsForNotInMeetingUsers = []string{
	"getUserInfo",
	"getMeetingEndData",
	"PluginConfigurationQuery",
	"getGuestLobbyInfo",
	"userCurrentSubscription",
	"Patched_userCurrentSubscription",
}

// ReconnectionReasonsPreservingMembership lists the reconnection reasons that cannot have changed
// a user's meeting membership - they carry role, lock or presenter changes only.
//
// This is an allowlist, and it must stay one. Any reason not listed here, including one this list
// has never seen, is treated as possibly membership-changing. The inverse formulation is not
// available: the eject paths in akka-apps forward a human-readable sentence rather than a reason
// code, so the set of reasons that DO change membership is open-ended. Entries here correspond to
// fixed literals in akka-apps; anything dynamic belongs outside the list.
var ReconnectionReasonsPreservingMembership = []string{
	"role_changed",
	"lock_user_changed",
	"lockSettings_changed",
	"webcamOnlyForMod_changed",
	"assigned_presenter",
	"assigned_presenter_automatically",
}

var StreamingSubscriptionsManagedByMiddleware = []string{
	"getCursorCoordinatesStream",
	"getNotificationStream",
	"getChatMessageStream",
	"getUserVoiceStateStream",
}
