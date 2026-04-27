package org.bigbluebutton.api.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.lang3.StringUtils;
import org.bigbluebutton.api.ParamsProcessorUtil;
import org.bigbluebutton.api.domain.PluginManifest;
import org.bigbluebutton.api.exception.PluginMalformedParametersException;
import org.bigbluebutton.api.exception.PluginMetadataException;
import java.time.LocalDate;

import org.bigbluebutton.api.service.impl.PluginRedirectValidatorService;
import org.bigbluebutton.api.service.RedirectFollowerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.github.zafarkhaja.semver.Version;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.concurrent.ConcurrentHashMap;

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
    private RedirectFollowerService redirectFollower;
    private PluginRedirectValidatorService pluginRedirectValidator;
    public String cachedPluginsBaseDirectory;
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private Boolean pluginManifestCacheEnabled;


    private static final ConcurrentHashMap<String, Object> PLUGIN_LOCKS = new ConcurrentHashMap<>();
    private static Object getLockFor(String pluginUrl) {
        return PLUGIN_LOCKS.computeIfAbsent(pluginUrl, k -> new Object());
    }


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

    private String followManifestRedirects(String manifestUrlBeforeRedirections, String meetingId) {
        String finalUrl = redirectFollower.followRedirect(
                meetingId, manifestUrlBeforeRedirections, 0, manifestUrlBeforeRedirections,
                pluginRedirectValidator, 6000
        );
        if (finalUrl != null) {
            return finalUrl;
        } else {
            log.error("Raw manifest URL [{}] failed when following redirects", manifestUrlBeforeRedirections);
            return manifestUrlBeforeRedirections;
        }
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

    public String getPluginManifestContentFromCache(
            String pluginManifestUrlString
    ) throws IOException {
        Path cachedPluginManifestPath = getCachedPluginManifestPath(pluginManifestUrlString);
        String content;
        if (Files.isRegularFile(cachedPluginManifestPath)) {
            log.info("Found cache for plugin [{}]. Using it.", pluginManifestUrlString);
            content = Files.readString(cachedPluginManifestPath);
        } else {
            log.info("Cache for plugin [{}] not found.", pluginManifestUrlString);
            content = null;
        }
        return content;
    }

    public boolean hasPluginManifestContentCacheFile(String pluginManifestUrlString) throws IOException {
        return getPluginManifestContentFromCache(pluginManifestUrlString) != null;
    }

    public void savePluginManifestContentInCache(
            String pluginManifestUrlString, String manifestContent
    ) throws IOException {
        log.info("Saving cache for plugin [{}].", pluginManifestUrlString);
        Path cachedPluginManifestPath = getCachedPluginManifestPath(pluginManifestUrlString);
        Path cacheDir = getCachedPluginsBaseDirectory();
        Files.createDirectories(cacheDir);
        Files.writeString(cachedPluginManifestPath, manifestContent);
    }

    public static String fetchPluginManifestContentFromUrl(
            String pluginManifestUrlString
    ) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder(URI.create(pluginManifestUrlString)).GET().build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IOException("HTTP " + response.statusCode() + " when fetching " + pluginManifestUrlString);
        }
        return response.body();
    }

    public String getRawPluginManifestContent(
            PluginManifest pluginManifest, String meetingId
    ) throws IOException, InterruptedException {
        String pluginManifestUrlString = pluginManifest.getUrl();
        synchronized (getLockFor(pluginManifestUrlString)) {
            String pluginManifestContent = null;
            String pluginManifestChecksum = pluginManifest.getChecksum();
            if (pluginManifestCacheEnabled) {
                pluginManifestContent = getPluginManifestContentFromCache(pluginManifestUrlString);
                if (pluginManifestContent == null) {
                    log.info("Cache not found for plugin [{}].", pluginManifestUrlString);
                }
            }
            boolean isPluginManifestContentCached = pluginManifestContent != null;
            boolean fetchManifestContent = !pluginManifestCacheEnabled || !isPluginManifestContentCached;
            if (fetchManifestContent) {
                String finalUrl = followManifestRedirects(pluginManifestUrlString, meetingId);
                log.info("Fetching plugin manifest content for [{}]", finalUrl);
                pluginManifestContent = PluginUtils.fetchPluginManifestContentFromUrl(finalUrl);
            }

            boolean isRawPluginManifestContentValid = isPluginManifestChecksumValid(
                    pluginManifestContent, pluginManifestChecksum)
                    && !getPluginName(pluginManifestContent).isEmpty();


            try {
                boolean savePluginManifestInCache = !hasPluginManifestContentCacheFile(pluginManifestUrlString)
                        && isRawPluginManifestContentValid
                        && pluginManifestCacheEnabled;

                if (savePluginManifestInCache) {
                    savePluginManifestContentInCache(pluginManifestUrlString, pluginManifestContent);
                }
            } catch (IOException e) {
               log.error("Failed to save cache for plugin [{}]", pluginManifestUrlString, e);
            }

            return pluginManifestContent;
        }
    }

    public boolean isPluginManifestChecksumValid(String pluginManifestContent, String pluginManifestChecksum) {
        if (!StringUtils.isEmpty(pluginManifestChecksum)) {
            String hash = DigestUtils.sha256Hex(pluginManifestContent);
            return pluginManifestChecksum.equals(hash);
        }
        return true;
    }

    public String getPluginName(
            String pluginManifestContent
    ) throws JsonProcessingException {
        JsonNode jsonNode = objectMapper.readTree(pluginManifestContent);

        String pluginName;
        if (jsonNode.has("name")) {
            pluginName = jsonNode.get("name").asText();
        } else {
            pluginName = null;
        }
        return pluginName;
    }

    public Path getCachedPluginsBaseDirectory() {
        return Paths.get(cachedPluginsBaseDirectory);
    }

    public Path getCachedPluginManifestPath(String pluginManifestUrlString) {
        LocalDate date = LocalDate.now();
        String formatted = date.format(formatter);

        String hashedPluginManifestUrl = DigestUtils.md5Hex(pluginManifestUrlString + formatted);
        Path cacheDir = Paths.get(cachedPluginsBaseDirectory);
        return cacheDir.resolve(hashedPluginManifestUrl + ".json");
    }

    public void setHtml5PluginSdkVersion(String html5PluginSdkVersion) {
        this.html5PluginSdkVersion = html5PluginSdkVersion;
    }

    public static void setBbbVersion(String bbbVersion) {
        PluginUtils.bbbVersion = bbbVersion;
    }

    public void setCachedPluginsBaseDirectory(String cachedPluginsBaseDirectory) {
        this.cachedPluginsBaseDirectory = cachedPluginsBaseDirectory;
    }

    public void setRedirectFollower(RedirectFollowerService redirectFollower) {
        this.redirectFollower = redirectFollower;
    }

    public void setPluginRedirectValidator(PluginRedirectValidatorService pluginRedirectValidator) {
        this.pluginRedirectValidator = pluginRedirectValidator;
    }

    public void setPluginManifestCacheEnabled(Boolean pluginManifestCacheEnabled) {
        this.pluginManifestCacheEnabled = pluginManifestCacheEnabled;
    }
}
