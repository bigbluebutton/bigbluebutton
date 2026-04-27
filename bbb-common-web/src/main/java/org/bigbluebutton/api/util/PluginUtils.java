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
import org.bigbluebutton.api.exception.PluginManifestChecksumMismatchException;
import org.bigbluebutton.api.exception.PluginMetadataException;
import org.bigbluebutton.api.service.RedirectFollowerService;
import org.bigbluebutton.api.service.SecureUrlDownloader;
import org.bigbluebutton.api.service.ValidatedUrl;
import org.bigbluebutton.api.service.impl.PluginRedirectValidatorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.github.zafarkhaja.semver.Version;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

public class PluginUtils {
    private static final Logger log = LoggerFactory.getLogger(PluginUtils.class);
    private static final String HTML5_PLUGIN_SDK_VERSION = "%%HTML5_PLUGIN_SDK_VERSION%%";
    private static final String HTML5_PLUGIN_SDK_MAIN_VERSION = "%%HTML5_PLUGIN_SDK_MAIN_VERSION%%";
    private static final String BBB_VERSION = "%%BBB_VERSION%%";
    private static final String BBB_MAIN_VERSION = "%%BBB_MAIN_VERSION%%";
    private static final String MEETING_ID = "%%MEETING_ID%%";
    private static final Pattern METADATA_PLACEHOLDER_PATTERN = Pattern.compile("\\$\\{([\\w-]+)(?::([^}]*))?\\}");
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static final String CACHE_REFRESH_CONTEXT_ID = "plugin-cache-refresh";
    private static final long CACHE_MAX_IDLE_HOURS = 24L * 7L;

    private static String bbbVersion;
    private String html5PluginSdkVersion;
    private RedirectFollowerService redirectFollower;
    private PluginRedirectValidatorService pluginRedirectValidator;
    private SecureUrlDownloader secureUrlDownloader;
    private String pluginManifestCacheDirectory;
    private Boolean pluginManifestCacheEnabled = true;
    private long pluginManifestFetchTimeoutSeconds = 15;
    private int maxPluginManifestPayloadSizeKib = 1024;
    private long pluginManifestCacheRefreshIntervalMinutes = 60;

    private final ConcurrentHashMap<String, CachedManifestEntry> trackedEntries = new ConcurrentHashMap<>();
    private ScheduledExecutorService cacheRefreshExecutor;

    private static final ConcurrentHashMap<String, Object> PLUGIN_LOCKS = new ConcurrentHashMap<>();
    private static Object getLockFor(String pluginUrl) {
        return PLUGIN_LOCKS.computeIfAbsent(pluginUrl, k -> new Object());
    }

    private static final class CachedManifestEntry {
        final String url;
        volatile long lastAccessedTimeMillis;

        CachedManifestEntry(String url) {
            this.url = url;
            this.lastAccessedTimeMillis = System.currentTimeMillis();
        }

        void touch() {
            this.lastAccessedTimeMillis = System.currentTimeMillis();
        }
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

    private String readCacheFile(String pluginManifestUrlString) throws IOException {
        Path cachedPluginManifestPath = getCachedPluginManifestPath(pluginManifestUrlString);
        if (Files.isRegularFile(cachedPluginManifestPath)) {
            return Files.readString(cachedPluginManifestPath);
        }
        return null;
    }

    private void writeCacheFile(String pluginManifestUrlString, String manifestContent) throws IOException {
        Path cachedPluginManifestPath = getCachedPluginManifestPath(pluginManifestUrlString);
        Files.createDirectories(getPluginManifestCacheDirectory());
        Files.writeString(cachedPluginManifestPath, manifestContent);
    }

    private String readFromCache(String pluginManifestUrlString) throws IOException {
        String content = readCacheFile(pluginManifestUrlString);
        if (content != null) {
            log.debug("Cache hit for plugin [{}]", pluginManifestUrlString);
            touchTrackedEntry(pluginManifestUrlString);
        } else {
            log.debug("Cache miss for plugin [{}]", pluginManifestUrlString);
        }
        return content;
    }

    private void writeToCache(String pluginManifestUrlString, String manifestContent) throws IOException {
        log.info("Caching plugin manifest [{}]", pluginManifestUrlString);
        writeCacheFile(pluginManifestUrlString, manifestContent);
        touchTrackedEntry(pluginManifestUrlString);
    }

    private void evictFromCache(String pluginManifestUrlString) {
        try {
            Path cachedPluginManifestPath = getCachedPluginManifestPath(pluginManifestUrlString);
            if (Files.deleteIfExists(cachedPluginManifestPath)) {
                log.info("Evicted cached manifest for plugin [{}]", pluginManifestUrlString);
            }
        } catch (IOException e) {
            log.warn("Failed to evict cached manifest for plugin [{}]", pluginManifestUrlString, e);
        } finally {
            trackedEntries.remove(pluginManifestUrlString);
        }
    }

    private void touchTrackedEntry(String pluginManifestUrlString) {
        trackedEntries.compute(pluginManifestUrlString, (key, existing) -> {
            if (existing == null) {
                return new CachedManifestEntry(key);
            }
            existing.touch();
            return existing;
        });
    }

    private String fetchPluginManifestContent(String pluginManifestUrlString, String meetingId) throws IOException {
        int timeoutMs = (int) Math.min(pluginManifestFetchTimeoutSeconds * 1000L, Integer.MAX_VALUE);
        ValidatedUrl validatedUrl = redirectFollower.followRedirectSecure(
                meetingId, pluginManifestUrlString, 0, pluginManifestUrlString,
                pluginRedirectValidator, timeoutMs
        );
        if (validatedUrl == null) {
            throw new IOException("Failed to validate or follow redirects for plugin URL " + pluginManifestUrlString);
        }
        log.info("Fetching plugin manifest content for [{}]", validatedUrl.originalUrl());
        String content = secureUrlDownloader.downloadToString(
                meetingId, validatedUrl, timeoutMs, maxPluginManifestPayloadSizeKib
        );
        if (content == null) {
            throw new IOException("Failed to download plugin manifest content for " + pluginManifestUrlString);
        }
        return content;
    }

    private ParsedPluginManifest parseAndValidate(String content, String checksum)
            throws JsonProcessingException, PluginManifestChecksumMismatchException {
        if (!isPluginManifestChecksumValid(content, checksum)) {
            throw new PluginManifestChecksumMismatchException("");
        }
        JsonNode jsonNode = objectMapper.readTree(content);
        String name = jsonNode.has("name") ? jsonNode.get("name").asText() : null;
        return new ParsedPluginManifest(content, jsonNode, name);
    }

    public ParsedPluginManifest getParsedPluginManifest(PluginManifest pluginManifest, String meetingId)
            throws IOException, PluginManifestChecksumMismatchException {
        String pluginManifestUrlString = pluginManifest.getUrl();
        String pluginManifestChecksum = pluginManifest.getChecksum();

        synchronized (getLockFor(pluginManifestUrlString)) {
            if (pluginManifestCacheEnabled) {
                String cached = null;
                try {
                    cached = readFromCache(pluginManifestUrlString);
                } catch (IOException e) {
                    log.warn("Failed to read cached manifest for plugin [{}]; will refetch",
                            pluginManifestUrlString, e);
                }
                if (cached != null) {
                    try {
                        return parseAndValidate(cached, pluginManifestChecksum);
                    } catch (JsonProcessingException e) {
                        log.warn("Cached manifest for plugin [{}] is corrupt; evicting and refetching",
                                pluginManifestUrlString, e);
                        evictFromCache(pluginManifestUrlString);
                    } catch (PluginManifestChecksumMismatchException e) {
                        log.info("Cached manifest for plugin [{}] no longer matches the requested checksum; " +
                                "evicting and refetching", pluginManifestUrlString);
                        evictFromCache(pluginManifestUrlString);
                    }
                }
            }

            String fresh = fetchPluginManifestContent(pluginManifestUrlString, meetingId);
            ParsedPluginManifest parsed;
            try {
                parsed = parseAndValidate(fresh, pluginManifestChecksum);
            } catch (PluginManifestChecksumMismatchException e) {
                throw new PluginManifestChecksumMismatchException(pluginManifestUrlString);
            }

            boolean nameUsable = parsed.pluginName() != null && !parsed.pluginName().isEmpty();
            if (pluginManifestCacheEnabled && nameUsable) {
                try {
                    writeToCache(pluginManifestUrlString, fresh);
                } catch (IOException e) {
                    log.error("Failed to save cache for plugin [{}]", pluginManifestUrlString, e);
                }
            }
            return parsed;
        }
    }

    public boolean isPluginManifestChecksumValid(String pluginManifestContent, String pluginManifestChecksum) {
        if (StringUtils.isEmpty(pluginManifestChecksum)) {
            return true;
        }
        String hash = DigestUtils.sha256Hex(pluginManifestContent);
        return pluginManifestChecksum.equals(hash);
    }

    public Path getPluginManifestCacheDirectory() {
        return Paths.get(pluginManifestCacheDirectory);
    }

    public Path getCachedPluginManifestPath(String pluginManifestUrlString) {
        String hashedPluginManifestUrl = DigestUtils.md5Hex(pluginManifestUrlString);
        return getPluginManifestCacheDirectory().resolve(hashedPluginManifestUrl + ".json");
    }

    public void start() {
        if (!Boolean.TRUE.equals(pluginManifestCacheEnabled)) {
            log.info("Plugin manifest cache is disabled; skipping startup wipe and refresh scheduling");
            return;
        }
        wipeCacheDirectory();
        if (pluginManifestCacheRefreshIntervalMinutes <= 0) {
            log.info("Plugin manifest cache refresh disabled (interval <= 0)");
            return;
        }
        cacheRefreshExecutor = Executors.newSingleThreadScheduledExecutor(runnable -> {
            Thread thread = new Thread(runnable, "plugin-manifest-cache-refresh");
            thread.setDaemon(true);
            return thread;
        });
        cacheRefreshExecutor.scheduleWithFixedDelay(
                this::refreshTrackedManifests,
                pluginManifestCacheRefreshIntervalMinutes,
                pluginManifestCacheRefreshIntervalMinutes,
                TimeUnit.MINUTES
        );
        log.info("Plugin manifest cache refresh scheduled every {} minute(s); idle entries dropped after {} hours",
                pluginManifestCacheRefreshIntervalMinutes, CACHE_MAX_IDLE_HOURS);
    }

    public void stop() {
        if (cacheRefreshExecutor != null) {
            cacheRefreshExecutor.shutdownNow();
            cacheRefreshExecutor = null;
        }
    }

    private void wipeCacheDirectory() {
        Path dir = getPluginManifestCacheDirectory();
        if (!Files.isDirectory(dir)) {
            return;
        }
        try (Stream<Path> entries = Files.list(dir)) {
            long deleted = entries
                    .filter(Files::isRegularFile)
                    .map(this::deleteSilently)
                    .filter(Boolean::booleanValue)
                    .count();
            log.info("Cleared {} stale entries from plugin manifest cache [{}]", deleted, dir);
        } catch (IOException e) {
            log.warn("Failed to wipe plugin manifest cache directory [{}]", dir, e);
        }
    }

    private boolean deleteSilently(Path path) {
        try {
            return Files.deleteIfExists(path);
        } catch (IOException e) {
            log.warn("Failed to delete cached file [{}]", path, e);
            return false;
        }
    }

    private void refreshTrackedManifests() {
        long now = System.currentTimeMillis();
        long maxIdleMs = TimeUnit.HOURS.toMillis(CACHE_MAX_IDLE_HOURS);
        for (CachedManifestEntry entry : trackedEntries.values()) {
            if (now - entry.lastAccessedTimeMillis > maxIdleMs) {
                log.info("Evicting plugin manifest [{}] idle for over {} hours", entry.url, CACHE_MAX_IDLE_HOURS);
                evictFromCache(entry.url);
                continue;
            }
            try {
                refreshSingleManifest(entry.url);
            } catch (Throwable t) {
                log.warn("Unexpected failure while refreshing plugin manifest [{}]", entry.url, t);
            }
        }
    }

    private void refreshSingleManifest(String pluginManifestUrlString) {
        synchronized (getLockFor(pluginManifestUrlString)) {
            String cached;
            try {
                cached = readCacheFile(pluginManifestUrlString);
            } catch (IOException e) {
                log.warn("Cannot read cached manifest for plugin [{}] during refresh", pluginManifestUrlString, e);
                return;
            }
            if (cached == null) {
                trackedEntries.remove(pluginManifestUrlString);
                return;
            }
            String fresh;
            try {
                fresh = fetchPluginManifestContent(pluginManifestUrlString, CACHE_REFRESH_CONTEXT_ID);
            } catch (IOException e) {
                log.warn("Failed to refetch plugin manifest [{}]; keeping previously cached copy",
                        pluginManifestUrlString, e);
                return;
            }
            if (fresh.equals(cached)) {
                log.debug("Plugin manifest [{}] unchanged; cache retained", pluginManifestUrlString);
                return;
            }
            try {
                JsonNode jsonNode = objectMapper.readTree(fresh);
                String name = jsonNode.has("name") ? jsonNode.get("name").asText() : null;
                if (name == null || name.isEmpty()) {
                    log.warn("Refreshed manifest for plugin [{}] is missing 'name'; not replacing cache",
                            pluginManifestUrlString);
                    return;
                }
            } catch (JsonProcessingException e) {
                log.warn("Refreshed manifest for plugin [{}] is not valid JSON; not replacing cache",
                        pluginManifestUrlString, e);
                return;
            }
            try {
                writeCacheFile(pluginManifestUrlString, fresh);
                log.info("Plugin manifest [{}] changed at source; cache replaced", pluginManifestUrlString);
            } catch (IOException e) {
                log.warn("Failed to replace cached manifest for plugin [{}]", pluginManifestUrlString, e);
            }
        }
    }

    public void setHtml5PluginSdkVersion(String html5PluginSdkVersion) {
        this.html5PluginSdkVersion = html5PluginSdkVersion;
    }

    public static void setBbbVersion(String bbbVersion) {
        PluginUtils.bbbVersion = bbbVersion;
    }

    public void setPluginManifestCacheDirectory(String pluginManifestCacheDirectory) {
        this.pluginManifestCacheDirectory = pluginManifestCacheDirectory;
    }

    public void setRedirectFollower(RedirectFollowerService redirectFollower) {
        this.redirectFollower = redirectFollower;
    }

    public void setPluginRedirectValidator(PluginRedirectValidatorService pluginRedirectValidator) {
        this.pluginRedirectValidator = pluginRedirectValidator;
    }

    public void setSecureUrlDownloader(SecureUrlDownloader secureUrlDownloader) {
        this.secureUrlDownloader = secureUrlDownloader;
    }

    public void setPluginManifestCacheEnabled(Boolean pluginManifestCacheEnabled) {
        this.pluginManifestCacheEnabled = pluginManifestCacheEnabled;
    }

    public void setPluginManifestFetchTimeoutSeconds(long pluginManifestFetchTimeoutSeconds) {
        this.pluginManifestFetchTimeoutSeconds = pluginManifestFetchTimeoutSeconds;
    }

    public void setMaxPluginManifestPayloadSizeKib(int maxPluginManifestPayloadSizeKib) {
        this.maxPluginManifestPayloadSizeKib = maxPluginManifestPayloadSizeKib;
    }

    public void setPluginManifestCacheRefreshIntervalMinutes(long pluginManifestCacheRefreshIntervalMinutes) {
        this.pluginManifestCacheRefreshIntervalMinutes = pluginManifestCacheRefreshIntervalMinutes;
    }
}
