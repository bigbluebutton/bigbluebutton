package org.bigbluebutton.api.util;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import org.bigbluebutton.api.ParamsProcessorUtil;
import org.bigbluebutton.api.domain.PluginManifest;
import org.bigbluebutton.api.exception.PluginMalformedParametersException;
import org.bigbluebutton.api.exception.PluginMetadataException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.github.zafarkhaja.semver.Version;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class PluginUtils {
    private static final Logger log = LoggerFactory.getLogger(PluginUtils.class);
    private static final String HTML5_PLUGIN_SDK_VERSION = "%%HTML5_PLUGIN_SDK_VERSION%%";
    private static final String HTML5_PLUGIN_SDK_MAIN_VERSION = "%%HTML5_PLUGIN_SDK_MAIN_VERSION%%";
    private static final String BBB_VERSION = "%%BBB_VERSION%%";
    private static final String BBB_MAIN_VERSION = "%%BBB_MAIN_VERSION%%";
    private static final String MEETING_ID = "%%MEETING_ID%%";
    private static final Pattern METADATA_PLACEHOLDER_PATTERN = Pattern.compile("\\$\\{([\\w-]+)(?::([^}]*))?\\}");
    private static String bbbVersion;
    private String html5PluginSdkVersion;

    private String getMainVersion(String version) {
        Version parsedVersion = Version.parse(version);
        return parsedVersion.majorVersion() + "." + parsedVersion.minorVersion();
    }

    public String replaceAllPlaceholdersInManifestUrls(String url, String meetingId) {
        return url.replace(HTML5_PLUGIN_SDK_VERSION, html5PluginSdkVersion)
                .replace(HTML5_PLUGIN_SDK_MAIN_VERSION, getMainVersion(html5PluginSdkVersion))
                .replace(BBB_VERSION, bbbVersion)
                .replace(BBB_MAIN_VERSION, getMainVersion(bbbVersion))
                .replace(MEETING_ID, meetingId);
    }

    public PluginManifest createPluginManifestFromJson(JsonElement pluginManifestJson, String meetingId) {
        if (pluginManifestJson.isJsonObject()) {
            JsonObject pluginManifestJsonObj = pluginManifestJson.getAsJsonObject();
            if (pluginManifestJsonObj.has("url")) {
                String barePluginManifestUrl = pluginManifestJsonObj.get("url").getAsString();
                String url = replaceAllPlaceholdersInManifestUrls(barePluginManifestUrl, meetingId);
                PluginManifest newPlugin = new PluginManifest(url);
                if (pluginManifestJsonObj.has("checksum")) {
                    newPlugin.setChecksum(pluginManifestJsonObj.get("checksum").getAsString());
                }
                return newPlugin;
            }
        }
        return null;
    }

    private static boolean matchesPluginParameterFormat(String pluginParameter, String pluginName) {
        Pattern PLUGIN_PREFIX_PATTERN = Pattern.compile("plugin_" + Pattern.quote(pluginName) + "_[a-zA-Z][a-zA-Z0-9-]*$");
        Matcher pluginPrefixMatcher = PLUGIN_PREFIX_PATTERN.matcher(pluginParameter);
        return pluginPrefixMatcher.matches();
    }

    private static String resolveParameter(
        String pluginName,
        String rawParameterName,
        Map<String, String> source,
        String defaultValue,
        String prefixToRemove,
        String errorMessage
    ) throws PluginMetadataException {
        String key = ParamsProcessorUtil.removePrefixString(rawParameterName, prefixToRemove).toLowerCase();
        if (source.containsKey(key)) {
            String replacementValue = source.get(key);
            log.debug("plugin [{}] - {} parameter [{}] identified, value: [{}]",
                    pluginName, prefixToRemove, rawParameterName, replacementValue);
            return replacementValue;
        } else if (defaultValue != null) {
            log.debug("plugin [{}] - {} parameter [{}] not found, using default [{}]",
                    pluginName, prefixToRemove, rawParameterName, defaultValue);
            return defaultValue;
        } else {
            throw new PluginMetadataException(pluginName, errorMessage, rawParameterName);
        }
    }


    private static void validateAndReplaceMetadataParameters(
        String pluginName,
        Matcher matcher,
        Map<String, String> metadata,
        Map<String, String> pluginMetadata,
        StringBuilder result
    ) throws PluginMetadataException, PluginMalformedParametersException {
        // First capturing group of regex is parameterName
        String metadataParameterName = matcher.group(1);
        // Second capturing group of regex is default value if exists
        String defaultValue = matcher.group(2) != null ? matcher.group(2) : null;

        String replacement;
        // Checking if placeholder is a meta_ parameter
        if (ParamsProcessorUtil.isMetaValid(metadataParameterName)) {
            // Remove "meta_" and convert to lower case
            replacement = resolveParameter(
                pluginName,
                metadataParameterName,
                metadata,
                defaultValue,
                "meta_",
                "Metadata " + metadataParameterName + " not found in URL parameters"
            );

        // Checking if placeholder is a plugin_ parameter
        } else if (matchesPluginParameterFormat(metadataParameterName, pluginName)) {
            // Remove "plugin_" and convert to lower case
            replacement = resolveParameter(
                pluginName,
                metadataParameterName,
                pluginMetadata,
                defaultValue,
                "plugin_",
                "Plugin metadata parameter named " + metadataParameterName + " not found in URL parameters"
            );

        } else {
            throw new PluginMalformedParametersException(
                    pluginName,
                    metadataParameterName,
                    "Metadata " + metadataParameterName + " is malformed, please provide a valid one"
            );
        }
        // Replace the placeholder with the value from the map
        matcher.appendReplacement(result, Matcher.quoteReplacement(replacement));
        log.debug("Metadata [{}] replaced in manifest of plugin [{}]", metadataParameterName, pluginName);
    }


    static public Map<String, Object> createEmptyPluginObjectWithError(String errorMessage, String pluginManifestUrl) {
        HashMap<String, Object> manifestObject = new HashMap<>();
        Map<String, Object> mappedManifestContent = new HashMap<>();
        manifestObject.put("content", mappedManifestContent);
        manifestObject.put("url", pluginManifestUrl);

        Map<String, Object> manifestWrapper = new HashMap<>();
        manifestWrapper.put("manifest", manifestObject);
        manifestWrapper.put("loadFailureReason", errorMessage);
        manifestWrapper.put("loadFailureSource", "bbb-web");
        return manifestWrapper;
    }

    static public String replaceMetadataParametersIntoManifestTemplate(
        String pluginName,
        String manifestContent,
        Map<String, String> metadataParametersMap,
        Map<String, String> pluginMetadataParametersMap
    ) throws PluginMetadataException, PluginMalformedParametersException {
        Matcher matcher = METADATA_PLACEHOLDER_PATTERN.matcher(manifestContent);
        StringBuilder result = new StringBuilder();
        // Iterate over all matches
        while (matcher.find()) {
            validateAndReplaceMetadataParameters(pluginName, matcher, metadataParametersMap, pluginMetadataParametersMap, result);
        }
        matcher.appendTail(result);
        return result.toString();
    }

    public void setHtml5PluginSdkVersion(String html5PluginSdkVersion) {
        this.html5PluginSdkVersion = html5PluginSdkVersion;
    }

    public static void setBbbVersion(String bbbVersion) {
        PluginUtils.bbbVersion = bbbVersion;
    }
}
