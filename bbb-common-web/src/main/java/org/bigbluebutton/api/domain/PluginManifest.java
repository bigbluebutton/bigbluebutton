package org.bigbluebutton.api.domain;

public class PluginManifest {
    private String url = "";
    private String checksum = "";
    public PluginManifest(
            String url,
             String checksum) {
        this.url = url;
        this.checksum = checksum;
    }
    public PluginManifest(
            String url) {
        this(url, "");
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
}