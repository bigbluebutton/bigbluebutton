package config

import (
	"fmt"
	"log/slog"
	"os"
	"path"

	"gopkg.in/yaml.v3"
)

const (
	cfgPath = "configs"
	cfgName = "config.yaml"
	locator = ".presentation"
)

var cfg *Config

type Config struct {
	Conversion struct {
		Office struct {
			Script      string `yaml:"script"`
			Timeout     int    `yaml:"timeout"`
			MaxAttempts int    `yaml:"max_attempts"`
		} `yaml:"office"`
	} `yaml:"conversion"`
	Processing struct {
		PDF struct {
			Page struct {
				Downscale struct {
					Script  string `yaml:"script"`
					Timeout int    `yaml:"timeout"`
				} `yaml:"downscale"`
			} `yaml:"page"`
		} `yaml:"pdf"`
	} `yaml:"processing"`
	Validation struct {
		Office struct {
			Script       string `yaml:"script"`
			Timeout      int    `yaml:"timeout"`
			ExecTimeout  int    `yaml:"exec_timeout"`
			SkipPrecheck bool   `yaml:"skip_precheck"`
		} `yaml:"office"`
	} `yaml:"validation"`
	Generation struct {
		Thumbnail struct {
			ImageMagickDir string `yaml:"image_magick_dir"`
			Timeout        int    `yaml:"timeout"`
		} `yaml:"thumbnail"`
	} `yaml:"generation"`
}

func init() {
	wd, err := os.Getwd()
	if err != nil {
		panic(err)
	}
	slog.Info("Initial working directory:", "path", wd)

	for {
		if wd == "/" {
			panic("Missing .presentation locator file")
		}
		locatorPath := path.Join(wd, locator)
		_, err = os.Open(locatorPath)
		if err != nil && os.IsNotExist(err) {
			wd = path.Join(wd, "../")
			continue
		} else if err != nil {
			panic(err)
		} else {
			slog.Info("Found presentation root at", "path", wd)
			break
		}
	}

	slog.Info("Setting working directory", "path", wd)
	err = os.Chdir(wd)
	if err != nil {
		panic(err)
	}

	cfg, err = loadConfig(fmt.Sprintf("%s/%s", cfgPath, cfgName))
	if err != nil {
		panic(err)
	}
}

func loadConfig(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("failed to read config file: %w", err)
	}

	var cfg Config
	if err := yaml.Unmarshal(data, &cfg); err != nil {
		return nil, fmt.Errorf("failed to parse config: %w", err)
	}

	return &cfg, nil
}

func DefaultConfig() *Config {
	return cfg
}