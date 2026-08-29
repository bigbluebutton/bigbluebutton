package org.bigbluebutton.api.service.impl;

import java.net.URI;

public class PluginRedirectValidatorService extends BaseUrlRedirectValidator {

    private String localPluginUrlPrefix;

    @Override
    protected boolean isUrlBypassed(String redirectUrl) {
        if (localPluginUrlPrefix == null || localPluginUrlPrefix.isEmpty()
                || redirectUrl == null || redirectUrl.isEmpty()) {
            return false;
        }

        try {
            URI allowed = URI.create(localPluginUrlPrefix).normalize();
            URI candidate = URI.create(redirectUrl).normalize();

            String allowedPath = allowed.getRawPath().endsWith("/")
                    ? allowed.getRawPath()
                    : allowed.getRawPath() + "/";

            return allowed.getScheme().equalsIgnoreCase(candidate.getScheme())
                    && allowed.getHost().equalsIgnoreCase(candidate.getHost())
                    && effectivePort(allowed) == effectivePort(candidate)
                    && candidate.getRawPath().startsWith(allowedPath);
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    private static int effectivePort(URI uri) {
        int port = uri.getPort();
        if (port != -1) {
            return port;
        }
        String scheme = uri.getScheme();
        if ("https".equalsIgnoreCase(scheme)) return 443;
        if ("http".equalsIgnoreCase(scheme)) return 80;
        return -1;
    }

    public void setLocalPluginUrlPrefix(String localPluginUrlPrefix) {
        this.localPluginUrlPrefix = localPluginUrlPrefix;
    }
}
