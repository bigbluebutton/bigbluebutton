package org.bigbluebutton.api.util;

import com.fasterxml.jackson.databind.JsonNode;

public record ParsedPluginManifest(String rawContent, JsonNode jsonNode, String pluginName) {
}
