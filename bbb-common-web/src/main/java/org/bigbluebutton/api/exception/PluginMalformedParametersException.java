package org.bigbluebutton.api.exception;

import java.lang.reflect.MalformedParametersException;

public class PluginMalformedParametersException extends MalformedParametersException {
    private final String pluginName;
    private final String errorMessage;
    private final String rawParameter;

    public PluginMalformedParametersException(String pluginName, String errorMessage, String rawParameter) {
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
