package plugin

import "encoding/json"

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
	err := json.Unmarshal([]byte(data), &pluginManifests)
	return pluginManifests, err
}
