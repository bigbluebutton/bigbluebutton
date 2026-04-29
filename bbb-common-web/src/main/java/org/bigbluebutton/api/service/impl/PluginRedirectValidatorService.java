package org.bigbluebutton.api.service.impl;

public class PluginRedirectValidatorService extends BaseUrlRedirectValidator {

    private String localPluginUrlPrefix;

    @Override
    protected boolean isUrlBypassed(String redirectUrl) {
        return localPluginUrlPrefix != null
                && !localPluginUrlPrefix.isEmpty()
                && redirectUrl != null
                && redirectUrl.startsWith(localPluginUrlPrefix);
    }

    public void setLocalPluginUrlPrefix(String localPluginUrlPrefix) {
        this.localPluginUrlPrefix = localPluginUrlPrefix;
    }
}
