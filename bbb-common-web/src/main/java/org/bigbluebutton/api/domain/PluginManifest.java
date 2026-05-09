package org.bigbluebutton.api.domain;

import org.bigbluebutton.api.service.ValidatedUrl;

public class PluginManifest {
    private String url = "";
    private String checksum = "";
    private ValidatedUrl validatedUrl;

    public PluginManifest(String url, String checksum, ValidatedUrl validatedUrl) {
        this.url = url;
        this.checksum = checksum;
        this.validatedUrl = validatedUrl;
    }

    public PluginManifest(String url, String checksum) {
        this(url, checksum, null);
    }

    public PluginManifest(String url, ValidatedUrl validatedUrl) {
        this(url, "", validatedUrl);
    }

    public PluginManifest(String url) {
        this(url, "", null);
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getChecksum() {
        return checksum;
    }

    public void setChecksum(String checksum) {
        this.checksum = checksum;
    }

    public ValidatedUrl getValidatedUrl() {
        return validatedUrl;
    }

    public void setValidatedUrl(ValidatedUrl validatedUrl) {
        this.validatedUrl = validatedUrl;
    }
}