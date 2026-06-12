package org.bigbluebutton.api.exception;

public class PluginManifestChecksumMismatchException extends Exception {
    private final String pluginManifestUrl;

    public PluginManifestChecksumMismatchException(String pluginManifestUrl) {
        super("Checksum mismatch for plugin manifest URL " + pluginManifestUrl);
        this.pluginManifestUrl = pluginManifestUrl;
    }

    public String getPluginManifestUrl() {
        return pluginManifestUrl;
    }
}
