package org.bigbluebutton.api.exception;

public class PluginMissingNameException extends NoSuchFieldException {
    String pluginManifestUrl;
    public PluginMissingNameException(String message, String pluginManifestUrl) {
        super(message);
        this.pluginManifestUrl = pluginManifestUrl;
    }
    public String getPluginManifestUrl() {
      return pluginManifestUrl;
    }
}
