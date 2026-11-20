// Package testconfig points the middleware configuration at the repository's config/config.yml, so
// the tests run in a clean checkout, without an installed /usr/share/bbb-graphql-middleware/config.yml
// and whatever /etc/bigbluebutton holds. A package whose tests load the configuration imports it
// from a test file, for its side effect:
//
//	import _ "bbb-graphql-middleware/config/testconfig"
//
// Some packages read the configuration when they are initialized (package-level variables), which
// is before any init function of their own tests runs. This package is initialized before them:
// Go initializes the packages in the order of their import paths, each once its imports are, and
// bbb-graphql-middleware/config/testconfig comes right after bbb-graphql-middleware/config, before
// every bbb-graphql-middleware/internal package.
package testconfig

import (
	"path/filepath"
	"runtime"

	"bbb-graphql-middleware/config"
)

func init() {
	_, file, _, _ := runtime.Caller(0)
	dir := filepath.Dir(file)
	config.DefaultConfigPath = filepath.Join(dir, "..", "config.yml")
	// A path that does not exist, so no override installed on the machine applies.
	config.OverrideConfigPath = filepath.Join(dir, "no-override.yml")
}
