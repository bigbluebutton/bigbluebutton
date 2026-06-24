package org.bigbluebutton.api.exception;

public class PluginMetadataException extends NoSuchFieldException {
    private final String pluginName;
    private final String errorMessage;
    private final String rawParameter;

    public PluginMetadataException(String pluginName, String errorMessage, String rawParameter) {
        this.pluginName = pluginName;
        this.errorMessage = errorMessage;
        this.rawParameter = rawParameter;
    }

    public String getPluginName() {
        return pluginName;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public String getRawParameter() {
        return rawParameter;
    }
}
