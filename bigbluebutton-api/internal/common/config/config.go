// Package config manages the loading of the default configurations for each API.
//
// A default configuration is provided in config.yaml under each API in the configs
// directory.
package config

import (
	"fmt"
	"log/slog"
	"os"
	"path"

	"gopkg.in/yaml.v3"
)

const (
	cfgsPath = "configs"
	locator  = ".api"
)

// FindConfig determines the proper working directory to use to locate
// the configuration files based on the environment it is called from.
func FindConfig() {
	wd, err := os.Getwd()
	if err != nil {
		panic(err)
	}
	slog.Info("Initial working directory", "path", wd)

	for {
		if wd == "/" {
			panic("Missing .api locator file")
		}
		locatorPath := path.Join(wd, locator)

		_, err := os.Open(locatorPath)
		if err != nil && os.IsNotExist(err) {
			wd = path.Join(wd, "../")
			continue
		} else if err != nil {
			panic(err)
		} else {
			break
		}
	}

	slog.Info("Setting working directory", "path", wd)
	err = os.Chdir(wd)
	if err != nil {
		panic(err)
	}
}

// LoadConfig reads and parses the configuration from the named file for the
// given API. Configuration data will be unmarshalled into the out value.
// The configuration data must be provied in a .yaml file. May return an error
// if reading of the file or unmarshalling of the data fails.
func LoadConfig(api string, file string, out any) error {
	apiCfgPath := cfgsPath
	if api != "" {
		apiCfgPath = path.Join(apiCfgPath, api)
	}
	apiCfgPath = path.Join(apiCfgPath, file)

	slog.Info("Attempting to load configuration", "path", apiCfgPath)

	data, err := os.ReadFile(apiCfgPath)
	if err != nil {
		return fmt.Errorf("failed to read config file: %w", err)
	}

	if unmarshalErr := yaml.Unmarshal(data, out); unmarshalErr != nil {
		return fmt.Errorf("failed to unmarshal config: %w", unmarshalErr)
	}
	return nil
}
