package config

import "github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/config"

const (
	name    = "document"
	cfgFile = "config.yaml"
)

var (
	cfg Config
)

// A Config encapsulates all of the settings necessary for the processing of
// uploaded documents.
type Config struct {
	// Document conversion settings.
	Conversion struct {
		// Office document settings.
		Office struct {
			// Path to script file for converting office documents
			// to PDF.
			Script string `yaml:"script"`
			// Timeout in seconds for an office document to PDF
			// conversion attempt.
			Timeout int `yaml:"timeout"`
			// Maximum number of times office to PDF conversion
			// should be attempted.
			MaxAttempts int `yaml:"max_attempts"`
		} `yaml:"office"`
	} `yaml:"conversion"`
	// Document processing settings
	Processing struct {
		// PDF settings.
		PDF struct {
			// Page settings.
			Page struct {
				// Downscaling settings.
				Downscale struct {
					// Path to script file for downscaling PDF pages.
					Script string `yaml:"script"`
					// Timeout in seconds for PDF page downscaling.
					Timeout int `yaml:"timeout"`
				} `yaml:"downscale"`
				// Maximum size in bytes for a single PDF page.
				MaxSize int64 `yaml:"max_size"`
			} `yaml:"page"`
		} `yaml:"pdf"`
		// Image settings.
		Image struct {
			// Maximum width in pixels for an uploaded image.
			MaxWidth int `yaml:"max_width"`
			// Maximum height in pixels for an uploaded image.
			MaxHeight int `yaml:"max_height"`
			// Resize settings.
			Resize struct {
				// Timeout in seconds for resizing an uploaded
				// image.
				Timeout int `yaml:"timeout"`
			} `yaml:"resize"`
		} `yaml:"image"`
	} `yaml:"processing"`
	// Document validation settings.
	Validation struct {
		// Office document settings.
		Office struct {
			// Path to script for validating .pptx files
			Script string `yaml:"script"`
			// Script timeout in seconds for validating
			//powerpoint files.
			Timeout int `yaml:"timeout"`
			// Command process execution timeout in seconds.
			ExecTimeout int `yaml:"exec_timeout"`
			// Indicates whether powerpoint validation should
			// be skipped.
			SkipPrecheck bool `yaml:"skip_precheck"`
		} `yaml:"office"`
		// Indicates whether uploaded presentation files should be scanned for viruses.
		Scan   bool `yaml:"scan"`
		ClamAV struct {
			Host string `yaml:"host"`
			Port string `yaml:"port"`
		} `yaml:"clamav"`
	} `yaml:"validation"`
	// Document generation settings.
	Generation struct {
		// Thumbnail settings
		Thumbnail struct {
			// Path to the location of ImageMagick.
			ImageMagickDir string `yaml:"image_magick_dir"`
			// Thumbnail generation timeout in seconds.
			Timeout int `yaml:"timeout"`
		} `yaml:"thumbnail"`
		// Text file settings
		TextFile struct {
			// Text file generation timeout in seconds.
			Timeout int `yaml:"timeout"`
		} `yaml:"text_file"`
		// PNG settings.
		PNG struct {
			// The width in pixels of the generated PNG.
			SlideWidth int `yaml:"slide_width"`
			// Indicates whether PNGs should be generated
			// for uploaded documents.
			Generate bool `yaml:"generate"`
			// PNG generation timeout in seconds.
			Timeout int `yaml:"timeout"`
		} `yaml:"png"`
		// SVG settings.
		SVG struct {
			// Indiciates whether SVGs should be generated
			// for uploaded documents.
			Generate bool `yaml:"generate"`
			// SVG generation timeout in seconds.
			Timeout int `yaml:"timeout"`
			// The resolution to be used when converting
			// PDFs to PNGs before SVG generation.
			Resolution int `yaml:"resolution"`
			// The maximum number of images tags that can
			// be present in a generated SVG.
			MaxImages int `yaml:"max_images"`
			// The maximum number of overall tags that can
			// be present in a generated SVG.
			MaxTags int `yaml:"max_tags"`
			// PDF settings
			PDF struct {
				// Font detection settings.
				Font struct {
					// Font detection timeout in seconds.
					Timeout int `yaml:"timeout"`
					// Maximum number of times to attempt to
					// determine the font type of an uploaded PDF.
					MaxAttempts int `yaml:"max_attempts"`
				} `yaml:"font"`
			} `yaml:"pdf"`
			// Rasterization settings.
			Rasterize struct {
				// Indicates whether rasterization should
				// be used for all uploaded documents regardless
				// of document complexity.
				Force bool `yaml:"force"`
				// The maximum width for rasterized document images.
				Width int `yaml:"width"`
			} `yaml:"rasterize"`
		} `yaml:"svg"`
		// Blank document settings.
		Blank struct {
			// Path to the location of the default blank
			// presentation.
			Presentation string `yaml:"presentation"`
			// Path to the location of the default blank
			// thumbnail.
			Thumbnail string `yaml:"thumbnail"`
			// Path to the location of the default blank
			// PNG.
			PNG string `yaml:"png"`
			// Path to the location of the default blank
			// SVG.
			SVG string `yaml:"svg"`
		} `yaml:"blank"`
	} `yaml:"generation"`
}

func init() {
	config.FindConfig()
	err := config.LoadConfig(name, cfgFile, &cfg)
	if err != nil {
		panic(err)
	}
}

// DefaultConfig returns a copy of the default configuration loaded during
// application startup.
func DefaultConfig() Config {
	return cfg
}
