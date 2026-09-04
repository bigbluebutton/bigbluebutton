package plugin

// Package plugin provides functonality for managing
// BBB plugins.

import "encoding/json"

// A PluginManifest is a description of a
// BBB plugin that contains the URL where
// the plugin is located and a checksum to
// verify the legitimacy of the plugin.
type PluginManifest struct {
	URL      string `json:"url"`
	Checksum string `json:"checksum,omitempty"`
}

// Parse attempts to unmarshal the provided JSON data of the form
// [{url: "", checksum: ""}] into a slice of [PluginManifest].
// If unmarshalling fails an empty slice along with an error
// will be returned.
func Parse(data string) ([]PluginManifest, error) {
	var pluginManifests []PluginManifest
	if err := json.Unmarshal([]byte(data), &pluginManifests); err != nil {
		return []PluginManifest{}, err
	}
	return pluginManifests, nil
}
